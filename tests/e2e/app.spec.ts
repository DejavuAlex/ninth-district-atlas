import { expect, test } from "@playwright/test";

test("首页、地图、人物和时间线可以交互", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "灾变之后，秩序重写" })).toBeVisible();

  await page.getByRole("link", { name: "探索地图" }).click();
  await expect(page).toHaveURL(/\/map$/);
  await expect(page.locator("#map")).toBeInViewport();

  await page.getByRole("button", { name: "查看川府" }).click();
  await expect(page.getByRole("heading", { name: "川府" })).toBeVisible();
  await expect(page.locator(".detail-panel > p").filter({ hasText: "秦禹后期立足、扩军和建立川府系的核心地盘。" })).toBeVisible();
  await expect(page.getByText("地图场景提示词")).toBeVisible();

  await page.getByRole("link", { name: "人物关系" }).click();
  await expect(page).toHaveURL(/\/characters$/);
  await page.getByLabel("搜索人物、别名或身份").fill("秦禹");
  await page.getByRole("button", { name: /秦禹/ }).first().click();
  await expect(page.locator(".profile-card").getByRole("heading", { name: "秦禹" })).toBeVisible();
  await expect(page.getByText("人物形象提示词")).toBeVisible();
  await expect(page.locator(".relationship-summary").getByText("生死兄弟").first()).toBeVisible();

  await page.getByRole("link", { name: "故事时间线" }).click();
  await expect(page).toHaveURL(/\/timeline$/);
  await page.getByRole("button", { name: /落地川府与从龙之战/ }).click();
  await expect(page.getByRole("heading", { name: "落地川府与从龙之战" })).toBeVisible();
  await expect(page.getByText("百万亩粮仓和军队规模成为川府系向上攀登的基础。")).toBeVisible();
});
