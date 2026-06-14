# 《第九特区》交互式小说地图

这是一个用 **vibe coding** 做出来的小说可视化尝试。

我看完《第九特区》之后，很喜欢里面的人物、地点和那些让人印象很深的情节。但长篇小说看完之后，很多细节会慢慢模糊：谁和谁是什么关系、某个地方发生过什么、某个角色后来走到了哪里，时间久了都容易忘。

所以我想试着用网页的方式，把这部小说里打动我的东西保存下来。它不是一个严肃的资料库，更像是一个可以随时打开的“小说记忆地图”：地图、人物、关系、时间线、原文摘录和动态立绘放在一起，让我以后再回头看时，能重新进入这个故事。

## 这个网站里有什么

- **世界地图**：把小说里的重要地点做成可点击地图，查看地点介绍、场景图、关联人物和关键事件。
- **人物档案**：展示主要人物的立绘、身份、故事、人物关系和原文语录。
- **动态立绘**：部分人物支持短视频动态立绘，先从秦禹开始尝试。
- **人物关系图**：用关系网络展示兄弟、盟友、对手、师徒等人物关系。
- **人物路线**：不只看秦禹，也能看吴天胤、齐麟、于瑾年、马老二、冯玉年等人的命运路线。
- **故事时间线**：按阶段整理重要事件，并加入原文摘录，帮助快速回忆剧情。
- **重点情节与小说立意**：把名场面和真正打动人的主题单独整理出来。

## 图片与提示词

项目中的**人物形象和地点图片均由 Image 2 生成**。

我在项目里保留了相关提示词，方便继续调整或重新生成素材：

- 人物与地点提示词来自结构化数据中的 `imagePrompt` / `mapPrompt`
- 动态立绘动作提示词见：`prompts/dynamic-portrait-motion-prompts.md`
- 视频录屏脚本见：`prompts/video-recording-script.md`

本地原始素材放在 `assets/` 目录，但这个目录不再提交到 git。仓库中只保留网站实际使用的优化后资源，例如 `public/portraits/`、`public/scenes/` 和 `public/portraits-motion/`。

## 项目结构

```text
src/
  components/        # 页面组件：地图、人物、关系图、时间线等
  data/              # 小说结构化数据
  lib/               # 搜索、筛选等工具函数
  test/              # 数据完整性与筛选测试

public/
  portraits/         # 人物 WebP 立绘
  scenes/            # 地点 WebP 场景图
  portraits-motion/  # 动态立绘视频

scripts/
  optimize-images.mjs        # 把本地 assets 素材转成 WebP
  validate-novel-data.mjs    # 校验结构化数据

tests/e2e/
  app.spec.ts        # Playwright 端到端测试
```

技术栈很简单：**Vite + React + TypeScript**，本质是一个静态 SPA。构建后可以部署到任何静态托管平台。

## 本地运行

```bash
npm install
npm run dev
```

默认访问：

```text
http://localhost:5173/
```

常用命令：

```bash
npm run build
npm run test
npm run test:e2e
npm run validate:data
npm run optimize:images
```

## 部署

构建产物在 `dist/`：

```bash
npm run build
```

可以部署到 Vercel、CloudBase、阿里云 OSS、腾讯云 COS，或任意 Nginx 静态站点。SPA 路由需要把未知路径回退到 `index.html`。

## 继续开发的方向

这个项目只是一个开始。你也可以在这个基础上继续发挥想象：

- 给更多人物加动态立绘或语音旁白
- 给重点情节加短视频片段或氛围音
- 做“按人物回顾剧情”的独立页面
- 加入更多原文摘录，让时间线更像读书笔记
- 做成其他小说的通用模板

我觉得 vibe coding 最有意思的地方就在这里：喜欢一个故事，不一定只能写读后感，也可以把它做成一个能点击、能探索、能反复打开的世界。

---

小说原作：《第九特区》  
作者：伪戒  
本项目仅用于个人阅读记录、可视化展示与技术学习。
