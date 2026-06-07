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
│   ├── scenes/<地点id>.webp       # 地点场景图 + world-map.webp（地图底图）
│   └── portraits/<人物id>.webp    # 人物立绘
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
| `npm run optimize:images` | 把 `assets/` 下的 PNG 素材转成 `public/` 下的 WebP（体积更小、国内更快） |

## 🖼️ 配图与素材工作流

1. 用 `prompts/` 下对应的提示词在出图工具中生成图片。
2. 把成图（PNG）放入 `assets/人物/<中文名>.png` 或 `assets/地区/<中文名>.png`。
3. 运行 `npm run optimize:images`：按「中文名 → 英文 id」自动转成前端读取的 WebP：
   - 人物：`public/portraits/<人物id>.webp`
   - 场景：`public/scenes/<地点id>.webp`（地图底图为 `public/scenes/world-map.webp`）
4. 前端按 id 自动加载，缺图时显示占位。**次要人物不出图、不生成提示词。**

> WebP 体积约为 PNG 的 1/10（整套素材 96MB → 7MB），首屏与图片加载明显更快，对国内访问尤其重要。

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

### 🇨🇳 国内免翻墙部署

Vercel 的 CDN 在中国大陆访问不稳定（常需翻墙）。本项目是**纯静态站点**（`npm run build` 产出 `dist/`），可以托管到任意国内可访问的静态服务上。

> 重要：应用以根路径加载素材（`/scenes/...`、`/portraits/...`），必须部署在**域名/桶的根目录**，不能放在子路径（如 `xxx.github.io/仓库名/`）下。SPA 用 History 路由，需把「找不到的路径」回退到 `index.html`。

推荐三种方案（按上手难度）：

1. **阿里云 OSS / 腾讯云 COS 静态网站托管**（最简单、便宜）
   - 新建 Bucket → 开启「静态网站托管」，首页和**错误（404）页面都设为 `index.html`**（实现 SPA 回退）。
   - 设置 Bucket 为公共读，把 `dist/` 全部上传。
   - 用「静态网站托管 Endpoint」域名访问即可，国内可直接打开、无需备案；绑定自定义域名才需要 ICP 备案。

2. **腾讯云 CloudBase（云开发）静态托管**
   - 默认 `*.tcloudbaseapp.com` 域名国内可访问、自带 CDN，控制台上传 `dist/` 即可，支持 SPA 回退。

3. **国内轻量应用服务器 + Nginx**（最稳、最灵活）
   - 买一台国内轻量服务器，按 [`deploy/nginx.conf`](deploy/nginx.conf) 配置（已含 SPA 回退、gzip、缓存）。
   - 把 `dist/` 上传到 `root` 指向的目录，`nginx -s reload`。直接用公网 IP（`http://你的IP`）访问无需备案。

> 不推荐：GitHub Pages（子路径 + 国内不稳定）、Netlify / Cloudflare Pages（国内基本仍需翻墙）。

**提速建议**：素材图片已统一转为 WebP（整套约 7MB，`npm run optimize:images` 生成），构建产物 `dist/` 约 9~10MB，国内加载已较快。新增图片后记得重新运行该命令。

---

数据与人物、地名均来自小说《第九特区》（作者：伪戒），本项目仅用于阅读体验与可视化展示。
