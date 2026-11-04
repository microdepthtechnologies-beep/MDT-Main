import { test, expect } from "@playwright/test";

const product = "/product/hp-240-14-g9-notebook-pc/";
test("catalogue search, sorting and filter state work together", async ({ page }) => {
  await page.goto("/shop/?q=Epson&category=projectors");
  await expect(page.locator(".product-card").first()).toBeVisible();
  const sidebar = page.locator(".catalogue-sidebar");
  await sidebar.getByRole("checkbox", { name: "Epson", exact: true }).check();
  await sidebar.getByLabel("In stock only").check();
  await expect(page).toHaveURL(/brand=Epson/);
  await expect(page).toHaveURL(/instock=1/);
  await expect(page.locator(".product-card h3").first()).toContainText("Epson");
  await page.getByLabel("Sort by", { exact: true }).selectOption("name");
  await expect(page).toHaveURL(/sort=name/);
  await expect(page).toHaveURL(/category=projectors/);
  await expect(page).toHaveURL(/q=Epson/);
  await page.getByRole("link", { name: "Remove Epson filter", exact: true }).click();
  await expect(page).not.toHaveURL(/brand=/);
  await expect(page).toHaveURL(/instock=1/);
  await page.getByRole("link", { name: "Clear all", exact: true }).click();
  await expect(page).toHaveURL(/\/shop\/\?sort=name$/);
  await expect(page.locator(".active-filters")).toHaveCount(0);
});

test("empty searches and special characters are safe; pagination preserves filters", async ({ page }) => {
  await page.goto("/shop/?q=%5B");
  await expect(page.locator("#main-content")).toBeVisible();
  await page.goto("/shop/?q=no-such-product-mdt-test");
  await expect(page.getByRole("heading", { name: "Let’s try another search." })).toBeVisible();
  await page.getByRole("link", { name: "Clear filters", exact: true }).click();
  await page.getByRole("link", { name: "Next page", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator(".results-count")).toContainText("25–48");
  await page.goto("/shop/?sort=price-asc&min=10000&max=1000");
  await expect(page.locator(".active-filters")).toContainText("From KES 1,000");
  await expect(page.locator(".active-filters")).toContainText("Up to KES 10,000");
});

test("category links include the hierarchy and images load", async ({ page }) => {
  await page.goto("/shop/");
  await page.getByRole("link", { name: "Computing", exact: true }).click();
  await expect(page).toHaveURL(/\/product-category\/pcs-desktops\/$/);
  await expect(page.locator(".product-card").first()).toBeVisible();
  const child = page.locator(".subcategory-links a").first();
  await expect(child).toHaveAttribute("href", /\/product-category\/pcs-desktops\/.+\/$/);
  await child.click();
  await expect(page.locator("h1")).toBeVisible();
  await page.locator(".product-card-image").first().scrollIntoViewIfNeeded();
  await expect(page.locator(".product-card-image img").first()).toBeVisible();
  await expect.poll(() => page.locator(".product-card-image img").first().evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test("gallery, configurations and enquiry links use the selected product", async ({ page }) => {
  await page.goto(product);
  await expect(page.locator("h1")).toContainText("HP 240");
  const thumbnails = page.locator(".gallery-thumbnails button");
  if (await thumbnails.count() > 1) {
    await thumbnails.nth(1).click();
    await expect(thumbnails.nth(1)).toHaveAttribute("aria-pressed", "true");
  }
  await page.getByRole("button", { name: "Enlarge product image" }).click();
  await expect(page.locator(".gallery-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".gallery-dialog")).not.toBeVisible();
  const configs = page.getByLabel("Choose a configuration", { exact: false });
  await configs.selectOption({ index: 1 });
  await expect(page.locator(".configuration-confirmation")).toBeVisible();
  const email = await page.getByRole("link", { name: "Request a quotation" }).getAttribute("href");
  expect(email).toContain("mailto:sales@mdt.co.ke");
  expect(decodeURIComponent(email || "")).toContain("Configuration:");
  await expect(page.getByRole("link", { name: "Discuss on WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/254748489784\?text=/);
});

test("mobile filters and navigation are keyboard accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shop/");
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  const dialog = page.locator(".filter-dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Find a brand", { exact: true }).fill("HP");
  await dialog.getByRole("checkbox", { name: "HP", exact: true }).check();
  await expect(page).toHaveURL(/brand=HP/);
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /^Show [\d,]+ products?$/ }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator(".mobile-nav-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".mobile-nav-dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Search products", exact: true }).click();
  await page.getByLabel("Search products", { exact: true }).fill("ThinkPad");
  await page.locator("#header-search").getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/q=ThinkPad/);
});

test("existing pages fit mobile, tablet and desktop; shared links resolve", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/shop/", "/product-category/projectors/", product]) {
      await page.goto(path);
      await expect(page.locator("#main-content")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path} at ${width}px`).toBe(true);
    }
  }
  await page.goto("/");
  const anchors = await page.locator(".site-header a, .site-footer a").evaluateAll(links => links.map(a => a.getAttribute("href")).filter((href): href is string => !!href && href.startsWith("/#")));
  for (const href of anchors) await expect(page.locator(href.slice(1))).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("quick look opens the chosen product and list view preserves browsing state", async ({ page }) => {
  await page.goto("/shop/?q=HP&sort=name");
  const card = page.locator(".product-card").first();
  const title = await card.locator("h3").innerText();
  const href = await card.locator("h3 a").getAttribute("href");
  await card.getByRole("button", { name: /^Quick look at/ }).click();
  const dialog = page.locator(".quick-view-dialog[open]");
  await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(title);
  await expect(dialog.getByRole("link", { name: "Explore this product" })).toHaveAttribute("href", href!);
  await expect.poll(() => dialog.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(card.getByRole("button", { name: /^Quick look at/ })).toBeFocused();

  await page.getByRole("link", { name: "List view", exact: true }).click();
  await expect(page).toHaveURL(/view=list/);
  await expect(page).toHaveURL(/q=HP/);
  await expect(page).toHaveURL(/sort=name/);
  await expect(page.locator(".product-list")).toBeVisible();
  await page.getByLabel("Sort by", { exact: true }).selectOption("newest");
  await expect(page).toHaveURL(/view=list/);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.getByRole("link", { name: "Grid view", exact: true }).click();
  await expect(page.locator(".product-list")).toHaveCount(0);
  await expect(page).toHaveURL(/q=HP/);
});

test("service explorer works with keyboard and loads local imagery with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const tabs = page.getByRole("tablist", { name: "MDT solutions" });
  await tabs.getByRole("tab").first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(tabs.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("Layered protection");
  await page.keyboard.press("End");
  await expect(tabs.getByRole("tab").last()).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("Certified hands");
  const image = page.locator(".solution-photo img");
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveAttribute("src", /wp-content/);
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  expect(await image.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await expect(page.getByRole("tabpanel").getByRole("link", { name: "Visit MDT Repairs" })).toHaveAttribute("href", "https://www.mdtrepairs.co.ke/");
});

test("multiple brands compose instantly and survive history, pagination and reload", async ({ page }) => {
  await page.goto("/shop/?category=pcs-desktops");
  await page.evaluate(() => { (window as Window & { browseSession?: string }).browseSession = "same-document"; });
  const sidebar = page.locator(".catalogue-sidebar");
  await sidebar.getByRole("checkbox", { name: "HP", exact: true }).check();
  await sidebar.getByRole("checkbox", { name: "Dell", exact: true }).check();
  await expect(page).toHaveURL(url => url.searchParams.getAll("brand").sort().join() === "Dell,HP");
  await expect(page.locator("#catalogue-product-results")).toHaveAttribute("aria-busy", "false");
  const brands = await page.locator(".product-card .card-brand").allTextContents();
  expect(brands.length).toBeGreaterThan(0);
  expect(brands.every(brand => /^(HP|Dell)$/i.test(brand))).toBe(true);
  expect(await page.evaluate(() => (window as Window & { browseSession?: string }).browseSession)).toBe("same-document");

  await page.getByRole("link", { name: "Next page", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator(".results-count")).toContainText("25–48");
  await expect(page.getByRole("link", { name: "Remove HP filter", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).not.toHaveURL(/page=2/);
  await expect(sidebar.getByRole("checkbox", { name: "HP", exact: true })).toBeChecked();
  await expect(sidebar.getByRole("checkbox", { name: "Dell", exact: true })).toBeChecked();
  await page.getByRole("link", { name: "Remove Dell filter", exact: true }).click();
  await expect(page).not.toHaveURL(/brand=Dell/);
  await page.goBack();
  await expect(sidebar.getByRole("checkbox", { name: "Dell", exact: true })).toBeChecked();
  await page.reload();
  await expect(sidebar.getByRole("checkbox", { name: "HP", exact: true })).toBeChecked();
  await expect(sidebar.getByRole("checkbox", { name: "Dell", exact: true })).toBeChecked();
});

test("category archives narrow to children and can broaden without losing other choices", async ({ page }) => {
  await page.goto("/product-category/pcs-desktops/?brand=HP&view=list");
  await expect(page.locator(".subcategory-links a").first()).toHaveAttribute("href", /brand=HP.*view=list/);
  const sidebar = page.locator(".catalogue-sidebar");
  const child = sidebar.locator(".category-choice").first();
  const href = await child.getAttribute("href");
  const childSlug = new URL(href!, "http://localhost").searchParams.get("category");
  expect(childSlug).toBeTruthy();
  await child.click();
  await expect(page).toHaveURL(url => url.pathname === "/product-category/pcs-desktops/" && url.searchParams.get("category") === childSlug);
  await expect(page.locator(".product-list")).toBeVisible();
  await expect(page).toHaveURL(/brand=HP/);
  await sidebar.getByRole("navigation", { name: "Category filter path" }).getByRole("link", { name: "All products", exact: true }).click();
  await expect(page).toHaveURL(url => url.pathname === "/shop/" && !url.searchParams.has("category"));
  await expect(page).toHaveURL(/brand=HP/);
  await expect(page.locator(".product-list")).toBeVisible();
});

test("live search keeps focus and scroll position; reset cancels a queued query", async ({ page }) => {
  await page.goto("/shop/?category=projectors");
  await page.locator("#catalogue-tools").evaluate(el => el.scrollIntoView({ block: "start", behavior: "instant" }));
  const search = page.getByRole("searchbox", { name: "Search the collection" });
  const before = await page.evaluate(() => scrollY);
  await search.fill("Epson");
  await expect(page).toHaveURL(/q=Epson/);
  await expect(page.locator("#catalogue-product-results")).toHaveAttribute("aria-busy", "false");
  await expect(search).toBeFocused();
  expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThan(30);
  await search.fill("unfinished-search");
  await page.getByRole("link", { name: "Clear all", exact: true }).click();
  await expect(page).toHaveURL(/\/shop\/$/);
  // Wait past the debounce interval to prove reset cannot resurrect the draft.
  await page.waitForTimeout(650);
  await expect(search).toHaveValue("");
  await expect(page).toHaveURL(/\/shop\/$/);
});

test("price validation and mobile drawer remain usable at the smallest viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/shop/?min=0&max=10000");
  const trigger = page.getByRole("button", { name: "Filters", exact: true });
  await trigger.click();
  const dialog = page.locator(".filter-dialog");
  const min = dialog.getByLabel("Minimum (KES)");
  await min.fill("20000");
  await dialog.getByRole("button", { name: "Set price range" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Minimum price");
  await expect(page).toHaveURL(/min=0/);
  const bottom = dialog.locator(".filter-dialog-bottom");
  expect((await bottom.boundingBox())!.y + (await bottom.boundingBox())!.height).toBeLessThanOrEqual(641);
  await dialog.getByRole("link", { name: "Include all prices", exact: true }).click();
  await expect(page).not.toHaveURL(/min=|max=/);
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.locator("summary").filter({ hasText: "Pricing" }).click();
  await expect(dialog.getByRole("link", { name: "Request pricing", exact: true })).toBeVisible();
  await expect(dialog.getByLabel("Minimum (KES)")).toHaveCount(0);
});
