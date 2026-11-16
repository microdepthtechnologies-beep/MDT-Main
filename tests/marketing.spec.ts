import { test, expect } from "@playwright/test";

const pages = ["/", "/about/", "/our-services/", "/software-licenses/", "/blog/", "/contact/"];
const article = "/2026/09/28/11-branch-network-refresh-for-a-regional-sacco/";

test("dark theme keeps branding readable and sections follow the displayed order", async ({ page }) => {
  for (const path of ["/", "/about/"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const numbers = await page.locator("main .eyebrow, main .section-index > span").evaluateAll(elements =>
      elements.map(element => element.textContent?.match(/^(\d+)\s*\//)?.[1]).filter(Boolean).map(Number),
    );
    expect(numbers).toEqual(numbers.map((_, index) => index + 1));
    expect(await page.locator(".site-header .brand-logo").evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");
  }
  await page.goto("/");
  const sections = await page.locator("main section[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(sections.indexOf("approach")).toBeLessThan(sections.indexOf("platforms"));
  expect(sections.indexOf("about")).toBeGreaterThan(sections.indexOf("platforms"));
  await expect(page.locator(".hq-hero-actions a")).toHaveCount(1);
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.locator('.utility-bar a[href="mailto:sales@mdt.co.ke"]')).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("button", { name: "Close navigation" })).toBeVisible();
  await page.getByRole("button", { name: "Close navigation" }).click();
  await expect(page.locator(".mobile-nav-dialog")).not.toBeVisible();
});

test("theme toggle changes the page theme and persists the preference", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const accountButton = page.getByRole("link", { name: "My account" });
  const desktopToggle = page.locator(".header-theme-toggle");
  const quoteButton = page.getByRole("link", { name: "Request a quote" });
  await expect(desktopToggle).toHaveCSS("border-width", "0px");
  const headerPositions = await Promise.all([accountButton, desktopToggle, quoteButton].map(element =>
    element.evaluate(node => node.getBoundingClientRect().x),
  ));
  expect(headerPositions[0]).toBeLessThan(headerPositions[1]);
  expect(headerPositions[1]).toBeLessThan(headerPositions[2]);

  await desktopToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".hq-hero")).toHaveCSS("background-color", "rgb(245, 245, 242)");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.goto("/auth/signin/");
  await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("software category navigation uses icons and has no category quote actions", async ({ page }) => {
  await page.goto("/software-licenses/");
  const navigation = page.getByRole("navigation", { name: "Software categories" });
  await expect(navigation.locator("a")).toHaveCount(11);
  await expect(navigation.locator("a svg")).toHaveCount(11);
  await expect(page.locator(".sw-cat-header .button")).toHaveCount(0);
  await expect(page.locator('main a[href*="/quote/checkout/"]')).toHaveCount(0);
  const securityCards = page.locator("#sw-security .sw-client-card");
  await expect(securityCards.first()).toBeVisible();
  await expect(securityCards.first()).toHaveAttribute("href", /^mailto:sales@mdt\.co\.ke\?subject=/);
  const href = await securityCards.first().getAttribute("href");
  expect(decodeURIComponent(href ?? "")).toContain("Quotation request:");
  await navigation.getByRole("link", { name: "Data Analytics Software" }).click();
  await expect(page).toHaveURL(/#sw-datal$/);
  await expect(page.locator("#sw-datal h2")).toBeInViewport();
});

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
