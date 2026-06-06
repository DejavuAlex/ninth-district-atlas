# 《第九特区》交互式设定地图

> 把伪戒的长篇小说《第九特区》，做成一张可以交互探索的「世界 · 人物 · 剧情」地图。

灾变之后、持续数十年的「冰封期」极寒末世。本项目用一个静态单页应用，把全书的世界地图、人物档案、人物关系、故事时间线、重点情节与立意，整合成可点击、可检索、可动态演示的网页。

在线地址：部署于 Vercel（推送 `main` 自动发布）。

## ✨ 功能一览

- **设定地图 `/map`**：以全球中文版地图为底图，按原文订正各特区归属（松江/奉北/长吉属九区、南沪/江州属七区、七·八·九区并称三大区等），点击任意据点查看场景图、简介、氛围、关键事件与相关人物。
- **崛起之路（动态路线）**：在地图上一键播放秦禹「从无人区发家 → 第九特区 → 松江 → 黑街 → 江州 → 奉北 → 南沪 → 长吉 → 落地川府」的动态轨迹，金色路线逐段绘制，秦禹头像沿途移动，并实时显示每一站的标题与剧情说明。
- **人物关系 `/characters`**：主要/次要人物分组展示；主要人物配立绘头像，可查看身份、性格、故事、首次出现、所属势力与直接关系；支持按姓名/别名/身份搜索与势力筛选。
- **故事时间线 `/timeline`**：按剧情阶段（arc）梳理事件脉络。
- **重点情节 `/highlights`**：地区争斗 / 派系争斗 / 战争残酷三阶段的名场面，每个情节预留短视频位（把成片放进 `public/videos/<id>.mp4` 即自动嵌入）。
- **小说立意 `/themes`** 与 **资料索引 `/sources`**。

## 🧱 技术栈

- Vite + React + TypeScript（静态 SPA，前端路由用 History API）
- 图标：`@phosphor-icons/react`
- 测试：Vitest（单元）+ Playwright（端到端）
- 数据校验脚本：`tsx`

## 📁 目录结构

```
第九特区/
├── src/
│   ├── data/ninthDistrict.ts     # 全部内容的唯一数据源（地点/人物/关系/事件/重点情节/崛起之路/立意）
│   ├── types/novel.ts            # 数据模型类型定义
│   ├── components/               # WorldMap、CharacterPanel、RelationshipGraph、Highlights、Timeline 等
│   ├── lib/novelFilters.ts       # 搜索与筛选逻辑
│   └── styles.css                # 全站样式
├── public/
│   ├── scenes/<地点id>.png        # 地点场景图 + world-map.png（地图底图）
│   └── portraits/<人物id>.png     # 人物立绘
├── assets/                       # 原始出图素材（中文命名），人工放置后同步到 public/
│   ├── 人物/<中文名>.png
│   └── 地区/<中文名>.png
├── prompts/                      # 由 export:prompts 生成的配图提示词
│   ├── characters/<人物id>.md     # 仅主要人物
│   ├── locations/<地点id>.md
│   └── world-map.md              # 地图底图提示词（含正确的区域归属）
├── scripts/
│   ├── validate-novel-data.mjs   # 数据完整性校验
│   └── export-prompts.mjs        # 由数据导出配图提示词
└── tests/e2e/app.spec.ts         # Playwright 端到端用例
```

## 🚀 本地开发

```bash
npm install
npm run dev          # 启动开发服务器（默认 http://localhost:5173）
```

常用命令：

| 命令 | 说明 |
| --- | --- |
| `npm run build` | 类型检查并打包（`tsc -b && vite build`） |
| `npm run test` | 运行单元测试（Vitest） |
| `npm run test:e2e` | 运行端到端测试（Playwright） |
| `npm run validate:data` | 校验数据完整性（引用是否存在、坐标是否越界等） |
| `npm run export:prompts` | 由数据导出配图提示词到 `prompts/`（仅为主要人物出图） |

## 🖼️ 配图与素材工作流

1. 用 `prompts/` 下对应的提示词在出图工具中生成图片。
2. 把成图放入 `assets/人物/<中文名>.png` 或 `assets/地区/<中文名>.png`。
3. 按「中文名 → 英文 id」复制到前端实际读取的路径：
   - 人物：`public/portraits/<人物id>.png`
   - 场景：`public/scenes/<地点id>.png`
   - 地图底图：`public/scenes/world-map.png`
4. 前端按 id 自动加载，缺图时显示占位。**次要人物不出图、不生成提示词。**

## ✏️ 内容如何修改

所有内容都集中在 `src/data/ninthDistrict.ts`，修改后请运行 `npm run validate:data` 与 `npm run test`：

- **新增/修改人物**：在 `characters` 中增改 `character({...})`；`tier: "supporting"` 表示次要人物（前端不出头像、不生成提示词）。主要人物的外貌提示词维护在 `appearances` 记录里。
- **新增/修改地点**：在 `locations` 中增改节点，`x`/`y` 为地图上的百分比坐标（对齐 `public/scenes/world-map.png` 的标注）。
- **崛起之路路线**：编辑 `journey` 数组（有序的 `{ locationId, title, caption }`），地图上的动态路线会随之改变。
- **重点情节**：编辑 `highlights` 数组。
- 注意：所有文案统一使用中文标点（、，：。），不要使用破折号 `—`/`–`，否则数据校验会失败。

## ☁️ 部署

- 仓库：`github.com/DejavuAlex/ninth-district-atlas`
- Vercel：Root Directory 设为 `第九特区`，推送到 `main` 自动构建并发布。

---

数据与人物、地名均来自小说《第九特区》（作者：伪戒），本项目仅用于阅读体验与可视化展示。
