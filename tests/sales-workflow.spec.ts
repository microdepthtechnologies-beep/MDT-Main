import { test, expect, type Browser, type BrowserContext } from "@playwright/test";
import { MongoClient, ObjectId, type Db } from "mongodb";
import { encode } from "next-auth/jwt";
import { createServer, type Server } from "node:net";
import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { quotationTotals, validateQuotation, type Quotation } from "../lib/quotation";

// End-to-end against an isolated database and SMTP sink. Never use customer mailboxes.
const port = 3107;
const smtpPort = 2527;
const origin = `http://localhost:${port}`;
const databaseName = `mdt_sales_test_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
const secret = randomUUID() + randomUUID();
const customer = { _id: new ObjectId(), email: "customer@example.test", name: "Test Customer", role: "customer" };
const staff = { _id: new ObjectId(), email: "sales@example.test", name: "Test Sales", role: "sales" };
const other = { _id: new ObjectId(), email: "other@example.test", name: "Other Customer", role: "customer" };
const messages: string[] = [];
let failMail = false;
let client: MongoClient;
let db: Db;
let server: ChildProcess;
let smtp: Server;
let replica: MongoMemoryReplSet;
let customerContext: BrowserContext;
let staffContext: BrowserContext;
let otherContext: BrowserContext;

async function signedIn(browser: Browser, user: typeof customer) {
  const context = await browser.newContext({ baseURL: origin });
  const value = await encode({ secret, salt: "authjs.session-token", token: { sub: user._id.toString(), email: user.email, name: user.name, role: user.role, passwordVersion: 0 }, maxAge: 3600 });
  await context.addCookies([{ name: "authjs.session-token", value, url: origin, httpOnly: true, sameSite: "Lax" }]);
  return context;
}

test.describe("sales quotation workflow", () => {
  test.describe.configure({ mode: "serial" });
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120000);
    replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    client = new MongoClient(replica.getUri(), { serverSelectionTimeoutMS: 15000 });
    await client.connect();
    db = client.db(databaseName);
    const passwordHash = await bcrypt.hash("Test password 2026", 12);
    await db.collection("accounts").insertMany([customer, staff, other].map(user => ({ ...user, passwordHash, passwordVersion: 0 })));
    smtp = createServer(socket => {
      socket.setEncoding("utf8");
      socket.write("220 localhost MDT test SMTP\r\n");
      let buffer = ""; let data = false; let message = "";
      socket.on("data", chunk => {
        buffer += chunk;
        let end;
        while ((end = buffer.indexOf("\r\n")) >= 0) {
          const line = buffer.slice(0, end); buffer = buffer.slice(end + 2);
          if (data) {
            if (line === ".") {
              data = false;
              if (failMail) socket.write("451 simulated delivery failure\r\n");
              else { messages.push(message); socket.write("250 queued\r\n"); }
              message = "";
            } else message += line + "\n";
          } else if (/^EHLO|^HELO/.test(line)) socket.write("250-localhost\r\n250 AUTH PLAIN\r\n");
          else if (/^AUTH/.test(line)) socket.write("235 authenticated\r\n");
          else if (line === "DATA") { data = true; socket.write("354 send message\r\n"); }
          else if (line === "QUIT") { socket.end("221 bye\r\n"); }
          else socket.write("250 OK\r\n");
        }
      });
    });
    await new Promise<void>((resolve, reject) => { smtp.once("error", reject); smtp.listen(smtpPort, "127.0.0.1", resolve); });
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: "production", MONGODB_URI: replica.getUri(), MONGODB_DB: databaseName, AUTH_SECRET: secret, NEXTAUTH_SECRET: secret, AUTH_URL: origin, NEXTAUTH_URL: origin, APP_URL: origin, AUTH_TRUST_HOST: "true", SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtpPort), SMTP_SECURE: "false", SMTP_USER: "smtp@example.test", SMTP_PASS: "local-test-only", SALES_EMAIL: staff.email },
      stdio: "ignore",
    });
    await expect.poll(async () => {
      try { return (await fetch(`${origin}/api/auth/providers/`)).status; } catch { return 0; }
    }, { timeout: 30000 }).toBe(200);
    customerContext = await signedIn(browser, customer);
    staffContext = await signedIn(browser, staff);
    otherContext = await signedIn(browser, other);
  });
  test.afterAll(async () => {
    await Promise.all([customerContext?.close(), staffContext?.close(), otherContext?.close()]);
    server?.kill();
    if (smtp) await new Promise<void>(resolve => smtp.close(() => resolve()));
    if (db && db.databaseName === databaseName && databaseName.startsWith("mdt_sales_test_")) await db.dropDatabase();
    await client?.close();
    await replica?.stop();
  });

  const items = [
    { name: "Business notebook", slug: "test-notebook", sku: "MDT-TEST-1", configuration: "16 GB RAM", quantity: 2 },
    { name: "Network switch", slug: "test-switch", sku: "MDT-TEST-2", configuration: "", quantity: 1 },
  ];
  const draft: Quotation = {
    lines: [{ availability: "available", quantity: 2, unitPrice: 12500000, note: "One year warranty" }, { availability: "unavailable", quantity: 0, unitPrice: 0, note: "Currently unavailable" }],
    currency: "KES", taxRate: 16, deliveryFee: 100000, validUntil: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    leadTime: "3–5 working days", terms: "Payment arrangements confirmed by sales.", note: "Thank you for choosing MDT.",
  };
  let number = "";
  let revision = 0;
  let offerId = "";

  test("submits once, emails both parties, enforces permissions and keeps drafts private", async () => {
    const requestKey = randomUUID();
    const response = await customerContext.request.post(`${origin}/api/quotes/`, { data: { items, company: "Acme Test", phone: "+254700000000", message: "<script>example</script>", requestKey } });
    expect(response.status()).toBe(200);
    const body = await response.json(); number = body.number;
    expect(body.emailPending).toBe(false);
    expect(messages).toHaveLength(2);
    const mail = messages.join("\n").replace(/=\n/g, "").replace(/=3D/g, "=");
    expect(mail).toContain(`/sales/${number}/`);
    expect(mail).toContain("&lt;script&gt;");
    expect(mail).not.toContain("<script>example</script>");
    const duplicate = await customerContext.request.post(`${origin}/api/quotes/`, { data: { items, requestKey } });
    expect((await duplicate.json()).number).toBe(number);
    expect(await db.collection("quoteRequests").countDocuments()).toBe(1);
    expect(messages).toHaveLength(2);
    expect((await fetch(`${origin}/api/sales/quotes/${number}/`)).status).toBe(401);
    expect((await customerContext.request.get(`${origin}/api/sales/quotes/${number}/`)).status()).toBe(403);
    const saved = await staffContext.request.post(`${origin}/api/sales/quotes/${number}/`, { data: { action: "save", revision, draft, internalNote: "PRIVATE SUPPLIER COST" } });
    expect(saved.status()).toBe(200);
    revision = (await saved.json()).quote.revision;
    const customerData = await customerContext.request.get(`${origin}/api/quotes/`);
    const customerText = await customerData.text();
    expect(customerText).not.toContain("PRIVATE SUPPLIER");
    expect(customerText).not.toContain("12500000");
    expect(customerText).not.toContain('"draft"');
    const outsider = await otherContext.request.get(`${origin}/api/quotes/`);
    expect((await outsider.json()).quotes).toHaveLength(0);
    expect((await otherContext.request.post(`${origin}/api/quotes/${number}/respond/`, { data: { action: "accepted", offerId: "not-mine" } })).status()).toBe(404);
    expect((await staffContext.request.post(`${origin}/api/sales/quotes/${number}/`, { data: { action: "save", revision: 0, draft, internalNote: "stale" } })).status()).toBe(409);
  });

  test("sales UI is responsive; a sent quotation appears live for the customer and can be accepted", async () => {
    const salesPage = await staffContext.newPage();
    const customerPage = await customerContext.newPage();
    await salesPage.goto(`${origin}/sales/`);
    await expect(salesPage.getByRole("heading", { name: "Good business starts here." })).toBeVisible();
    await salesPage.getByRole("link").filter({ hasText: number }).click();
    await expect(salesPage.getByRole("heading", { name: "Build the right offer." })).toBeVisible();
    for (const width of [320, 390, 768, 1440]) {
      await salesPage.setViewportSize({ width, height: 1000 });
      expect(await salesPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `sales editor at ${width}`).toBe(true);
    }
    await salesPage.screenshot({ path: "test-results/sales-editor-desktop.png", fullPage: true });
    await salesPage.setViewportSize({ width: 390, height: 900 });
    await salesPage.screenshot({ path: "test-results/sales-editor-mobile.png", fullPage: true });
    await customerPage.goto(`${origin}/dashboard/quotes/?q=${number}`);
    await expect(customerPage.getByText("Live updates", { exact: true })).toBeVisible({ timeout: 30000 });
    await salesPage.getByRole("button", { name: "Preview & send" }).click();
    await expect(salesPage.getByRole("dialog")).toBeVisible();
    await salesPage.getByRole("button", { name: "Send quotation", exact: true }).click();
    await expect(salesPage.getByRole("status").filter({ hasText: "Quotation published and emailed" })).toBeVisible({ timeout: 30000 });
    await expect(customerPage.getByRole("button", { name: "Accept quotation", exact: true })).toBeVisible({ timeout: 10000 });
    expect(messages).toHaveLength(3);
    const doc = await db.collection("quoteRequests").findOne({ number });
    expect(doc?.offer.total).toBe(29116000);
    expect(doc?.delivery.state).toBe("sent");
    revision = doc!.revision; offerId = doc!.offer.id;
    const exposed = JSON.stringify((await (await customerContext.request.get(`${origin}/api/quotes/`)).json()).quotes);
    expect(exposed).toContain("29116000");
    expect(exposed).not.toContain("PRIVATE SUPPLIER");
    expect(exposed).not.toContain("internalNote");
    for (const width of [320, 390, 768, 1440]) {
      await customerPage.setViewportSize({ width, height: 1000 });
      expect(await customerPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `customer quote at ${width}`).toBe(true);
    }
    await customerPage.getByRole("button", { name: "Accept quotation", exact: true }).click();
    await customerPage.getByRole("button", { name: "Confirm acceptance" }).click();
    await expect(customerPage.getByRole("status").filter({ hasText: "Quotation accepted" })).toBeVisible();
    await expect(salesPage.getByRole("button", { name: "Start fulfilment" })).toBeVisible({ timeout: 10000 });
    await salesPage.getByRole("button", { name: "Start fulfilment" }).click();
    await expect(salesPage.getByRole("button", { name: "Mark fulfilled" })).toBeVisible({ timeout: 10000 });
    await salesPage.getByRole("button", { name: "Mark fulfilled" }).click();
    await expect(customerPage.locator(".workspace-quote-update .workspace-status")).toHaveText("Fulfilled", { timeout: 10000 });
    await customerPage.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await customerPage.screenshot({ path: "test-results/customer-quotation-desktop.png", fullPage: true });
    expect((await customerContext.request.post(`${origin}/api/quotes/${number}/respond/`, { data: { action: "accepted", offerId } })).status()).toBe(409);
    await salesPage.close(); await customerPage.close();
  });

  test("mail failure preserves the issued quote, retries safely and rejects invalid totals and expired offers", async () => {
    const result = await customerContext.request.post(`${origin}/api/quotes/`, { data: { items, requestKey: randomUUID() } });
    const ref = (await result.json()).number;
    failMail = true;
    const sent = await staffContext.request.post(`${origin}/api/sales/quotes/${ref}/`, { data: { action: "send", revision: 0, draft, internalNote: "" } });
    expect(sent.status()).toBe(200);
    const failure = await sent.json();
    expect(failure.emailFailed).toBe(true);
    expect(failure.quote.status).toBe("quoted");
    expect(failure.quote.delivery.state).toBe("failed");
    failMail = false;
    const before = messages.length;
    const retries = await Promise.all([0, 1].map(() => staffContext.request.post(`${origin}/api/sales/quotes/${ref}/`, { data: { action: "retry-email", revision: failure.quote.revision } })));
    expect(retries.map(res => res.status()).sort()).toEqual([200, 409]);
    expect(messages.length).toBe(before + 1);
    const latest = await db.collection("quoteRequests").findOne({ number: ref });
    await db.collection("quoteRequests").updateOne({ number: ref }, { $set: { "offer.validUntil": "2020-01-01" } });
    expect((await customerContext.request.post(`${origin}/api/quotes/${ref}/respond/`, { data: { action: "accepted", offerId: latest!.offer.id } })).status()).toBe(409);
    expect(() => validateQuotation({ ...draft, lines: [{ ...draft.lines[0], unitPrice: -10 }, draft.lines[1]] }, items, true)).toThrow();
    expect(() => validateQuotation({ ...draft, lines: [{ ...draft.lines[0], quantity: 3 }, draft.lines[1]] }, items, true)).toThrow();
    expect(() => validateQuotation({ ...draft, lines: [{ ...draft.lines[0], unitPrice: 0 }, draft.lines[1]] }, items, true)).toThrow();
    expect(() => validateQuotation({ ...draft, validUntil: "2026-99-99" }, items, true)).toThrow("Enter a valid quotation expiry date.");
    expect(quotationTotals(draft).total).toBe(29116000);
  });
});
