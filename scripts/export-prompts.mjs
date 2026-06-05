import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ninthDistrict } from "../src/data/ninthDistrict.ts";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const promptsRoot = resolve(projectRoot, "prompts");

const WORLD =
  "灾变之后、持续数十年的“冰封期”极寒末世。全球大面积冰封，资源极度匮乏，旧文明只剩废墟，新秩序在壁垒、特区与帮派之间艰难重建。整体基调阴冷、潮湿、压抑，但仍有人间烟火与挣扎求生的温度。";

const kindScene = {
  city: "高密度的破败都市街区，老旧高楼、立交与天桥层叠，密集的招牌与外挂管线，地面湿滑反光。",
  district: "成规模的辖区市镇，壁垒与检查站环绕，秩序与混乱在街口交界。",
  street: "低矮拥挤的旧街巷与棚户区，铁皮、集装箱与临时摊档紧贴，巷子深处藏着交易与暗流。",
  wasteland: "无政府的边缘废土，残破公路、锈蚀残骸与零星聚落散落在冰封荒原上。",
  frontier: "战略边境地带，驻防工事、铁丝网、瞭望塔与临时营地交错，气氛紧绷。",
  battlefield: "刚经历或正在交战的战场，断壁残垣、弹坑、焦痕与战争遗留物，硝烟未散。"
};

function locationPrompt(location) {
  return `# ${location.name}（${location.kind}）场景生成提示词

> 用途：生成 ${location.name} 的场景示意图。生成后请命名为 \`${location.id}.png\` 放入 \`public/scenes/\`，前端会自动显示。

## 画面主体
${location.name}的整体街道风貌与地貌特征：${location.summary}

## 环境与氛围
${location.atmosphere}
${kindScene[location.kind] ?? ""}

## 世界观设定（务必体现）
${WORLD}

## 构图与镜头
- 中远景为主，能看清该区域的街区轮廓与空间层次；
- 可加入人物剪影、车辆、临时设施等点缀生活感，但不做人物特写；
- 画面信息向纵深推进，避免元素全部挤在前景。

## 光线与色调
- 阴天或夜晚，低饱和冷色调（青、钢蓝、冷灰）为主，少量暖光（霓虹、应急灯、火光）点缀；
- 地面潮湿反光，空气中有薄雾或细雪。

## 视觉细节（按区域取舍）
破败楼群、外挂管线与电线、老旧霓虹与招牌、监控杆、警戒线、集装箱与棚屋、积水与残雪、锈蚀金属、涂鸦与弹痕。

## 风格
写实电影质感，厚重大气，体量感强，类似末世废土题材概念美术。

## 负面提示（Negative）
明亮晴朗、热带/沙漠暖调、卡通、低多边形、文字水印、人物正脸特写、画面元素拥挤平铺无层次。

## 输出参数
比例 16:9，高分辨率，电影级打光。
`;
}

function characterPrompt(character) {
  return `# ${character.name} 人物形象生成提示词

> 用途：生成 ${character.name} 的人物形象图。生成后请命名为 \`${character.id}.png\` 放入 \`public/portraits/\`，前端会自动显示。

## 人物身份
${character.role}${character.aliases.length ? `（别称：${character.aliases.join("、")}）` : ""}

## 性格与气质
${character.traits.join("、")}。${character.profile}

## 角色背景
${character.story}

## 世界观设定（务必体现）
${WORLD}

## 造型与服装
耐寒、粗粝、实用的多层旧衣物（风衣、夹克、围巾、护具等），带有使用磨损痕迹，符合极寒末世的生存状态与人物身份。

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
    await writeFile(
      resolve(promptsRoot, "characters", `${character.id}.md`),
      characterPrompt(character),
      "utf8"
    );
  }

  const indexLines = [
    "# 《第九特区》素材提示词",
    "",
    "本目录存放用于生成配图的详细提示词，前端页面不再直接展示提示词，只展示城市与人物的介绍。",
    "",
    "## 生成图片投放约定",
    "- 地点场景图：生成后命名为 `<地点id>.png`，放入 `public/scenes/`。",
    "- 人物形象图：生成后命名为 `<人物id>.png`，放入 `public/portraits/`。",
    "- 前端会按 id 自动加载对应图片，缺失时显示占位。",
    "",
    "## 地点提示词",
    ...ninthDistrict.locations.map((l) => `- ${l.name} → \`prompts/locations/${l.id}.md\`（图片：\`public/scenes/${l.id}.png\`）`),
    "",
    "## 人物提示词",
    ...ninthDistrict.characters.map((c) => `- ${c.name} → \`prompts/characters/${c.id}.md\`（图片：\`public/portraits/${c.id}.png\`）`),
    ""
  ];
  await writeFile(resolve(promptsRoot, "README.md"), indexLines.join("\n"), "utf8");

  console.log(
    `已导出提示词：${ninthDistrict.locations.length} 个地点，${ninthDistrict.characters.length} 个人物 → ${promptsRoot}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
