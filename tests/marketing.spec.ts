import { test, expect } from "@playwright/test";

const pages = ["/", "/about/", "/our-services/", "/software-licenses/", "/blog/", "/contact/"];
const article = "/2026/09/28/11-branch-network-refresh-for-a-regional-sacco/";

test("marketing pages have canonical metadata, semantic content and price-free structured data", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const path of [...pages, article, "/category/education/", "/category/financial-services/", "/network-infrastructure/", "/our-services/it-support-services/"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("#main-content")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://mdt.co.ke${path}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{30,}/);
    expect(await page.locator('meta[name="robots"]').evaluateAll(tags => tags.map(tag => tag.getAttribute("content")).join(" "))).not.toContain("noindex");
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(schemas.length, path).toBeGreaterThan(0);
    for (const schema of schemas) {
      expect(() => JSON.parse(schema)).not.toThrow();
      expect(schema).not.toMatch(/"(?:price|lowPrice|highPrice|priceCurrency|passwordHash|internalNotes)"\s*:/);
    }
  }
  expect(errors).toEqual([]);
});

test("marketing templates fit phones, tablets and desktop, with working media", async ({ page }) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [...pages, article]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path} at ${width}px`).toBe(true);
      if (width === 390) {
        for (const image of await page.locator("main img:visible").all()) {
          await image.scrollIntoViewIfNeeded();
          await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
        }
        await expect(page.locator("main .image-placeholder")).toHaveCount(0);
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        await page.screenshot({ path: `test-results/marketing-${path.replace(/\W/g, "-")}-390.png`, fullPage: true });
      }
    }
  }
});

test("journal search, topics and original article URLs work together", async ({ page }) => {
  await page.goto("/blog/");
  await page.getByRole("navigation", { name: "Article topics" }).getByRole("link", { name: "Financial services" }).click();
  await expect(page).toHaveURL(/\/category\/financial-services\/$/);
  await page.locator(".journal-card h3 a").first().click();
  await expect(page).toHaveURL(article);
  await expect(page.locator(".article-body")).toContainText(/network/i);
  const section = page.getByRole("navigation", { name: "In this article" }).getByRole("link").first();
  if (await section.count()) {
    await section.click();
    const hash = new URL(page.url()).hash;
    await expect(page.locator(hash)).toBeVisible();
  }
  await page.goto("/blog/");
  await page.getByRole("searchbox", { name: "Search articles" }).fill("no-such-mdt-article");
  await page.getByRole("button", { name: "Search articles", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Let’s try another search." })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.getByRole("link", { name: "Clear search" }).click();
  await expect(page.locator(".journal-feature")).toBeVisible();
  await page.goto("/blog/11-branch-network-refresh-for-a-regional-sacco/");
  await expect(page).toHaveURL(article);
});

test("mobile navigation and licensing enquiries lead to the right pages", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/about/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const menu = page.locator(".mobile-nav-dialog");
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Software & Licenses", exact: true }).click();
  await expect(page).toHaveURL(/\/software-licenses\/$/);
  await expect(menu).not.toBeVisible();
  const question = page.locator(".marketing-faqs summary").first();
  await question.click();
  await expect(question.locator("..")).toHaveAttribute("open", "");
  await page.locator(".marketing-cta .button").click();
  await expect(page).toHaveURL(/\/contact\//);
  await expect(page.getByLabel("Area of interest")).toHaveValue(/Software/i);
  await page.getByRole("button", { name: "Continue in email" }).click();
  await expect(page.getByText("Please enter your name.", { exact: true })).toBeVisible();
});

test("legacy redirects, sitemap and robots retain the public migration routes", async ({ request }) => {
  for (const [from, to] of [
    ["/products/", "/shop/"], ["/about-design-concept/", "/about/"],
    ["/software-and-licenses-design/", "/software-licenses/"], ["/services/", "/our-services/"],
    ["/request-quote/", "/quote/checkout/"], ["/request-a-quote/", "/quote/checkout/"],
    ["/sitemap_index.xml", "/sitemap.xml"],
  ]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers().location, "https://mdt.co.ke").pathname).toBe(to);
  }
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const sitemap = await response.text();
  for (const path of [...pages, "/shop/", article, "/category/education/", "/network-infrastructure/"]) {
    expect(sitemap).toContain(`<loc>https://mdt.co.ke${path}</loc>`);
  }
  expect(sitemap).not.toMatch(/<loc>[^<]*(?:\/dashboard\/|\/quote\/|\/auth\/)/);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  for (const path of ["/api/", "/dashboard/", "/quote/"]) expect(robots).toContain(`Disallow: ${path}`);
  expect(robots).toContain("Sitemap: https://mdt.co.ke/sitemap.xml");
  expect((await request.get("/not-an-mdt-page/", { headers: { "User-Agent": "Googlebot" } })).status()).toBe(404);
});
