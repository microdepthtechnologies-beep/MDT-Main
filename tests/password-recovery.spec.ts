import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Db } from "mongodb";
import { completePasswordReset, requestPasswordReset, resetPasswordIsValid, resetTokenIsValid } from "../lib/password-reset";

// An isolated MongoDB double: never changes real accounts or sends real mail.
function recoveryStore(hasPassword = true) {
  const account: Record<string, unknown> = { _id: "account-1", email: "recovery@example.test", ...(hasPassword ? { passwordHash: "old-hash" } : {}) };
  let attempts = 0;
  const matches = (filter: Record<string, unknown>) => Object.entries(filter).every(([key, value]) => {
    if (key === "$or") return !account.resetRequestedAt || (account.resetRequestedAt as Date).getTime() <= Date.now() - 60_000;
    if (key === "passwordHash" && typeof value === "object") return typeof account.passwordHash === "string";
    if (key === "resetExpiresAt") return account.resetExpiresAt instanceof Date && account.resetExpiresAt > (value as { $gt: Date }).$gt;
    return account[key] === value;
  });
  const apply = (update: { $set?: Record<string, unknown>; $unset?: Record<string, unknown>; $inc?: Record<string, number> }) => {
    Object.assign(account, update.$set);
    for (const key of Object.keys(update.$unset || {})) delete account[key];
    for (const [key, value] of Object.entries(update.$inc || {})) account[key] = Number(account[key] || 0) + value;
  };
  const accounts = {
    async findOne(filter: Record<string, unknown>) { return matches(filter) ? { ...account } : null; },
    async findOneAndUpdate(filter: Record<string, unknown>, update: Parameters<typeof apply>[0]) {
      if (!matches(filter)) return null;
      const previous = { ...account };
      apply(update);
      return previous;
    },
    async updateOne(filter: Record<string, unknown>, update: Parameters<typeof apply>[0]) {
      if (!matches(filter)) return { modifiedCount: 0 };
      apply(update);
      return { modifiedCount: 1 };
    },
  };
  const limits = {
    async createIndex() {},
    async findOneAndUpdate() { return { count: ++attempts }; },
  };
  return { account, db: { collection: (name: string) => name === "accounts" ? accounts : limits } as unknown as Db };
}

test.describe("password recovery security", () => {
  test.beforeEach(() => { process.env.AUTH_URL = "http://localhost:3000"; });

  test("sends only for password accounts, stores only a hash, expires and throttles links", async () => {
    const { db, account } = recoveryStore();
    const sent: string[] = [];
    const send = async (_email: string, url: string) => { sent.push(url); };
    await requestPasswordReset(db, String(account.email), send);
    expect(sent).toHaveLength(1);
    const token = new URL(sent[0]).searchParams.get("token")!;
    expect(resetTokenIsValid(token)).toBe(true);
    expect(account.resetTokenHash).toBe(createHash("sha256").update(token).digest("hex"));
    expect(JSON.stringify(account)).not.toContain(token);
    expect((account.resetExpiresAt as Date).getTime() - Date.now()).toBeGreaterThan(29 * 60_000);
    await requestPasswordReset(db, String(account.email), send);
    expect(sent).toHaveLength(1);
    for (let i = 0; i < 5; i++) {
      account.resetRequestedAt = new Date(0);
      await requestPasswordReset(db, String(account.email), send);
    }
    expect(sent).toHaveLength(4); // Five attempts/hour, including the cooldown attempt.
    const google = recoveryStore(false);
    await requestPasswordReset(google.db, String(google.account.email), send);
    const unknown = recoveryStore();
    await requestPasswordReset(unknown.db, "unknown@example.test", send);
    expect(sent).toHaveLength(4);
    expect(google.account.resetTokenHash).toBeUndefined();
    expect(unknown.account.resetTokenHash).toBeUndefined();
  });

  test("rejects expired and replaced links; a concurrent reset can succeed only once", async () => {
    const { db, account } = recoveryStore();
    let token = "";
    const send = async (_email: string, url: string) => { token = new URL(url).searchParams.get("token")!; };
    await requestPasswordReset(db, String(account.email), send);
    const old = token;
    account.resetRequestedAt = new Date(0);
    await requestPasswordReset(db, String(account.email), send);
    expect(await completePasswordReset(db, old, "A new passphrase")).toBe(false);
    account.resetExpiresAt = new Date(0);
    expect(await completePasswordReset(db, token, "A new passphrase")).toBe(false);
    expect(account.passwordHash).toBe("old-hash");
    account.resetExpiresAt = new Date(Date.now() + 60_000);
    const results = await Promise.all([
      completePasswordReset(db, token, "A new passphrase"),
      completePasswordReset(db, token, "A new passphrase"),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await bcrypt.compare("A new passphrase", String(account.passwordHash))).toBe(true);
    expect(account.passwordVersion).toBe(1);
    expect(account.resetTokenHash).toBeUndefined();
    expect(await completePasswordReset(db, token, "Another passphrase")).toBe(false);
  });

  test("failed delivery cleans up the token; input checks reject weak and oversized passwords", async () => {
    const { db, account } = recoveryStore();
    await requestPasswordReset(db, String(account.email), async () => { throw new Error("simulated mail failure"); });
    expect(account.resetTokenHash).toBeUndefined();
    expect(account.resetExpiresAt).toBeUndefined();
    expect(account.passwordHash).toBe("old-hash");
    expect(resetPasswordIsValid("short")).toBe(false);
    expect(resetPasswordIsValid("é".repeat(37))).toBe(false);
    expect(resetPasswordIsValid("a".repeat(72))).toBe(true);
    expect(resetTokenIsValid({ $ne: null })).toBe(false);
  });
});

test("recovery pages are responsive and support request, validation, failure and success states", async ({ page, request }) => {
  await page.goto("/auth/signin/");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/auth\/forgot-password\//);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.route("**/api/auth/forgot-password/", route => route.fulfill({ status: 200, json: { message: "Request accepted" } }));
  await page.getByLabel("Email address").fill("recovery@example.test");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText("Check your inbox");
  await expect(page.getByRole("status")).toContainText("If this email");
  await page.goto("/auth/reset-password/");
  await expect(page.locator(".account-error")).toContainText("invalid");
  await expect(page.getByRole("button", { name: "Save new password" })).toHaveCount(0);
  await page.goto(`/auth/reset-password/?token=${"a".repeat(64)}`);
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute("content", "no-referrer");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.getByLabel("New password", { exact: true }).fill("New passphrase 2026");
  await page.getByLabel("Confirm new password").fill("Different passphrase");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.locator(".account-error")).toContainText("don’t match");
  await page.getByLabel("Confirm new password").fill("New passphrase 2026");
  await page.getByRole("button", { name: "Show passwords" }).click();
  await expect(page.getByLabel("New password", { exact: true })).toHaveAttribute("type", "text");
  await page.route("**/api/auth/reset-password/", route => route.fulfill({ status: 400, json: { error: "This reset link has expired." } }));
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.locator(".account-error")).toContainText("expired");
  await page.unroute("**/api/auth/reset-password/");
  await page.route("**/api/auth/reset-password/", route => route.fulfill({ status: 200, json: { ok: true } }));
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("status")).toContainText("password has been updated");
  expect(new URL(page.url()).search).toBe("");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.screenshot({ path: "test-results/password-reset-desktop.png", fullPage: true });
  // Real endpoints reject malformed input before touching MongoDB or SMTP.
  expect((await request.post("/api/auth/forgot-password/", { data: { email: { $ne: null } } })).status()).toBe(400);
  expect((await request.post("/api/auth/reset-password/", { data: { token: "invalid", password: "New password" } })).status()).toBe(400);
  expect((await request.post("/api/auth/register/", { data: { name: { $ne: null }, email: "bad", password: "password" } })).status()).toBe(400);
  expect((await request.post("/api/auth/register/", { data: { name: "Test User", email: "test@example.test", password: "é".repeat(37) } })).status()).toBe(400);
});
