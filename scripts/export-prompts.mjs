import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ninthDistrict } from "../src/data/ninthDistrict.ts";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const promptsRoot = resolve(projectRoot, "prompts");

const WORLD =
  "灾变之后、持续数十年的“冰封期”极寒末世。全球大面积冰封，资源极度匮乏，旧文明只剩废墟，新秩序在壁垒、特区与帮派之间艰难重建。整体基调阴冷、潮湿、压抑，但仍有人间烟火与挣扎求生的温度。";

const WORLD_SHARED =
  "灾变之后、持续数十年的“冰封期”极寒末世：全球大面积冰封、资源紧张、气候严寒、常年积雪。但不同区域的秩序与风貌差异很大：有的繁华体面、有的肃整有序、有的才真正混乱荒废，不要把每个地方都画成废墟。";

function locationPrompt(location) {
  return `# ${location.name}（${location.kind}）场景生成提示词

> 用途：生成 ${location.name} 的场景示意图。生成后命名为 \`${location.name}.png\` 放入 \`assets/地区/\`，再运行 \`npm run optimize:images\` 自动转成 \`public/scenes/${location.id}.webp\`。

## 画面主体
${location.name}：${location.summary}

## 本区域独有特征（重点刻画，与其它区域区分开）
${location.scene}

## 氛围
${location.atmosphere}

## 世界观（统一背景，但风貌按上面的区域特征走）
${WORLD_SHARED}

## 构图与镜头
- 中远景为主，能看清该区域**独特**的街区轮廓与空间层次；
- 可加入人物剪影、车辆、临时设施等点缀生活感，但不做人物特写；
- 画面信息向纵深推进，避免元素全部挤在前景。

## 光线与色调
- 阴天或夜晚，低饱和冷色调（青、钢蓝、冷灰）为主；
- 体面/繁华区域可多一些整洁灯光与霓虹，废土/无人区则冷硬荒凉、暖光稀少；
- 地面常见积雪或潮湿反光，空气中有薄雾或细雪。

## 风格
写实电影质感，厚重大气，体量感强，末世题材概念美术。

## 负面提示（Negative）
明亮晴朗、热带/沙漠暖调、卡通、低多边形、文字水印、人物正脸特写、画面元素拥挤平铺无层次、把体面区域也画成废墟。

## 输出参数
比例 16:9，高分辨率，电影级打光。
`;
}

function characterPrompt(character) {
  return `# ${character.name} 人物形象生成提示词

> 用途：生成 ${character.name} 的人物形象图。生成后命名为 \`${character.name}.png\` 放入 \`assets/人物/\`，再运行 \`npm run optimize:images\` 自动转成 \`public/portraits/${character.id}.webp\`。

## 人物身份
${character.role}${character.aliases.length ? `（别称：${character.aliases.join("、")}）` : ""}

## 性格与气质
${character.traits.join("、")}。${character.profile}

## 角色背景
${character.story}

## 世界观设定（务必体现）
${WORLD}

## 外貌 · 神态 · 服装（按人物性格定制，彼此区分）
${character.appearance}

## 构图与镜头
半身像或胸像，竖版；人物为绝对主体，背景为阴冷潮湿的破败城区虚化氛围。

## 光线与色调
低饱和冷色调，电影级侧光或伦勃朗光，突出面部结构与眼神。

## 风格
小说角色立绘 / 半写实数字插画 / 概念美术风格，偏插画质感而非真人照片；笔触与材质偏绘画感，可参考国产末世题材小说封面与角色设定图，避免写实摄影。

## 负面提示（Negative）
真人摄影、照片写实、3D 渲染真人脸、糖水色、Q 版卡通、文字水印、多余人物、暖色沙滩/热带背景、服装过于干净光鲜。

## 输出参数
比例 3:4（竖版），高分辨率。
`;
}

async function main() {
  await mkdir(resolve(promptsRoot, "locations"), { recursive: true });
  await mkdir(resolve(promptsRoot, "characters"), { recursive: true });

  for (const location of ninthDistrict.locations) {
    await writeFile(
      resolve(promptsRoot, "locations", `${location.id}.md`),
      locationPrompt(location),
      "utf8"
    );
  }
  for (const character of ninthDistrict.characters) {
    if (character.tier === "supporting") continue;
    await writeFile(
      resolve(promptsRoot, "characters", `${character.id}.md`),
      characterPrompt(character),
      "utf8"
    );
  }

  const mainCharacters = ninthDistrict.characters.filter((c) => c.tier !== "supporting");
  const supportingCharacters = ninthDistrict.characters.filter((c) => c.tier === "supporting");
  const indexLines = [
    "# 《第九特区》素材提示词",
    "",
    "本目录存放用于生成配图的详细提示词，前端页面不再直接展示提示词，只展示城市与人物的介绍。",
    "",
    "## 生成图片投放约定",
    "- 地点场景图：生成后命名为 `<地点中文名>.png` 放入 `assets/地区/`。",
    "- 人物形象图：生成后命名为 `<人物中文名>.png` 放入 `assets/人物/`。",
    "- 运行 `npm run optimize:images` 自动按 id 转成 `public/scenes/<id>.webp`、`public/portraits/<id>.webp`（体积更小、国内加载更快）。",
    "- 前端会按 id 自动加载对应 WebP 图片，缺失时显示占位。",
    "- 仅为**主要人物**生成形象提示词与配图；次要人物在前端不展示头像，也不生成提示词。",
    "",
    "## 地点提示词",
    ...ninthDistrict.locations.map((l) => `- ${l.name} → \`prompts/locations/${l.id}.md\`（图片：\`public/scenes/${l.id}.png\`）`),
    "",
    "## 人物提示词（主要人物）",
    ...mainCharacters.map((c) => `- ${c.name} → \`prompts/characters/${c.id}.md\`（图片：\`public/portraits/${c.id}.png\`）`),
    "",
    "## 次要人物（不出图、无提示词）",
    supportingCharacters.length
      ? supportingCharacters.map((c) => c.name).join("、")
      : "（暂无）",
    ""
  ];
  await writeFile(resolve(promptsRoot, "README.md"), indexLines.join("\n"), "utf8");

  console.log(
    `已导出提示词：${ninthDistrict.locations.length} 个地点，${mainCharacters.length} 个主要人物（跳过 ${supportingCharacters.length} 个次要人物）→ ${promptsRoot}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
