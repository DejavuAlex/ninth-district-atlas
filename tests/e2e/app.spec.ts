import { expect, test } from "@playwright/test";

test("首页、地图、人物和时间线可以交互", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "灾变之后，秩序重写" })).toBeVisible();

  await page.getByRole("link", { name: "探索地图" }).click();
  await expect(page).toHaveURL(/\/map$/);
  await expect(page.locator("#map")).toBeInViewport();

  await page.getByRole("button", { name: "查看川府" }).click();
  await expect(page.getByRole("heading", { name: "川府" })).toBeVisible();
  await expect(page.locator(".detail-panel").getByText("紧邻八区、九区的独立特区", { exact: false })).toBeVisible();

  await page.getByRole("button", { name: /播放秦禹的崛起之路/ }).click();
  await expect(page.locator(".route-caption")).toBeVisible();
  await expect(page.locator(".route-traveler")).toBeVisible();

  await page.getByRole("link", { name: "人物关系" }).click();
  await expect(page).toHaveURL(/\/characters$/);
  await page.getByLabel("搜索人物、别名或身份").fill("秦禹");
  await page.getByRole("button", { name: /秦禹/ }).first().click();
  await expect(page.locator(".profile-card").getByRole("heading", { name: "秦禹" })).toBeVisible();
  await expect(page.locator(".relationship-summary").getByText("生死兄弟").first()).toBeVisible();

  await page.locator(".profile-card .asset-zoom-trigger").click();
  await expect(page.locator(".asset-lightbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".asset-lightbox")).toHaveCount(0);

  await page.getByRole("link", { name: "小说立意" }).click();
  await expect(page).toHaveURL(/\/themes$/);
  await expect(page.getByRole("heading", { name: "向着春暖花开走" })).toBeVisible();

  await page.getByRole("link", { name: "重点情节" }).click();
  await expect(page).toHaveURL(/\/highlights$/);
  await expect(page.getByRole("heading", { name: "大势之下，众生的挣扎与抉择" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "马踏长吉" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "无名的志愿兵·冯玉年战死北风口" })).toBeVisible();

  await page.getByRole("link", { name: "故事时间线" }).click();
  await expect(page).toHaveURL(/\/timeline$/);
  await page.getByRole("tab", { name: /落地川府与从龙之战/ }).click();
  await expect(page.getByRole("heading", { name: "落地川府与从龙之战" })).toBeVisible();
  await expect(page.getByText("百万亩粮仓和军队规模成为川府系向上攀登的基础。")).toBeVisible();
});
