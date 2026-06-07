# 《第九特区》素材提示词

本目录存放用于生成配图的详细提示词，前端页面不再直接展示提示词，只展示城市与人物的介绍。

## 生成图片投放约定
- 地点场景图：生成后命名为 `<地点中文名>.png` 放入 `assets/地区/`。
- 人物形象图：生成后命名为 `<人物中文名>.png` 放入 `assets/人物/`。
- 运行 `npm run optimize:images` 自动按 id 转成 `public/scenes/<id>.webp`、`public/portraits/<id>.webp`（体积更小、国内加载更快）。
- 前端会按 id 自动加载对应 WebP 图片，缺失时显示占位。
- 仅为**主要人物**生成形象提示词与配图；次要人物在前端不展示头像，也不生成提示词。

## 地点提示词
- 待规划区 → `prompts/locations/planning-zone.md`（图片：`public/scenes/planning-zone.png`）
- 第九特区 → `prompts/locations/ninth-district.md`（图片：`public/scenes/ninth-district.png`）
- 松江 → `prompts/locations/songjiang.md`（图片：`public/scenes/songjiang.png`）
- 黑街 → `prompts/locations/black-street.md`（图片：`public/scenes/black-street.png`）
- 土渣街 → `prompts/locations/tuzha-street.md`（图片：`public/scenes/tuzha-street.png`）
- 江州 → `prompts/locations/jiangzhou.md`（图片：`public/scenes/jiangzhou.png`）
- 奉北 → `prompts/locations/fengbei.md`（图片：`public/scenes/fengbei.png`）
- 长吉 → `prompts/locations/changji.md`（图片：`public/scenes/changji.png`）
- 南沪 → `prompts/locations/nanhu.md`（图片：`public/scenes/nanhu.png`）
- 川府 → `prompts/locations/chuanfu.md`（图片：`public/scenes/chuanfu.png`）
- 五区 → `prompts/locations/five-zone.md`（图片：`public/scenes/five-zone.png`）
- 七区 → `prompts/locations/seven-zone.md`（图片：`public/scenes/seven-zone.png`）
- 八区 → `prompts/locations/eight-zone.md`（图片：`public/scenes/eight-zone.png`）
- 欧盟一区 → `prompts/locations/eu-first-zone.md`（图片：`public/scenes/eu-first-zone.png`）
- 老三角 → `prompts/locations/old-triangle.md`（图片：`public/scenes/old-triangle.png`）
- 巴尔城 → `prompts/locations/bar-city.md`（图片：`public/scenes/bar-city.png`）
- 耶门 → `prompts/locations/yemen.md`（图片：`public/scenes/yemen.png`）
- 红丹战场 → `prompts/locations/red-dan.md`（图片：`public/scenes/red-dan.png`）
- 六区·北境堡垒 → `prompts/locations/liu-zone.md`（图片：`public/scenes/liu-zone.png`）
- 北风口·莆汾哨站 → `prompts/locations/beifengkou.md`（图片：`public/scenes/beifengkou.png`）
- 藏源·垒山要塞 → `prompts/locations/zangyuan.md`（图片：`public/scenes/zangyuan.png`）
- 盐岛·盐业站 → `prompts/locations/yandao.md`（图片：`public/scenes/yandao.png`）
- 夏岛 → `prompts/locations/xiadao.md`（图片：`public/scenes/xiadao.png`）

## 人物提示词（主要人物）
- 秦禹 → `prompts/characters/qin-yu.md`（图片：`public/portraits/qin-yu.png`）
- 齐麟 → `prompts/characters/qi-lin.md`（图片：`public/portraits/qi-lin.png`）
- 老猫 → `prompts/characters/lao-mao.md`（图片：`public/portraits/lao-mao.png`）
- 马老二 → `prompts/characters/ma-lao-er.md`（图片：`public/portraits/ma-lao-er.png`）
- 马老爷子 → `prompts/characters/ma-lao-ye.md`（图片：`public/portraits/ma-lao-ye.png`）
- 袁克 → `prompts/characters/yuan-ke.md`（图片：`public/portraits/yuan-ke.png`）
- 林念蕾 → `prompts/characters/lin-nianlei.md`（图片：`public/portraits/lin-nianlei.png`）
- 吴迪 → `prompts/characters/wu-di.md`（图片：`public/portraits/wu-di.png`）
- 顾言 → `prompts/characters/gu-yan.md`（图片：`public/portraits/gu-yan.png`）
- 于瑾年 → `prompts/characters/ke-ke.md`（图片：`public/portraits/ke-ke.png`）
- 林成栋 → `prompts/characters/lin-chengdong.md`（图片：`public/portraits/lin-chengdong.png`）
- 展楠 → `prompts/characters/zhan-nan.md`（图片：`public/portraits/zhan-nan.png`）
- 付小豪 → `prompts/characters/fu-xiaohao.md`（图片：`public/portraits/fu-xiaohao.png`）
- 历战 → `prompts/characters/li-zhan.md`（图片：`public/portraits/li-zhan.png`）
- 大牙 → `prompts/characters/da-ya.md`（图片：`public/portraits/da-ya.png`）
- 吴天胤 → `prompts/characters/wu-tianyin.md`（图片：`public/portraits/wu-tianyin.png`）
- 冯玉年 → `prompts/characters/feng-yunian.md`（图片：`public/portraits/feng-yunian.png`）
- 冯济 → `prompts/characters/feng-ji.md`（图片：`public/portraits/feng-ji.png`）
- 项择昊 → `prompts/characters/xiang-zehao.md`（图片：`public/portraits/xiang-zehao.png`）
- 孟玺 → `prompts/characters/meng-xi.md`（图片：`public/portraits/meng-xi.png`）
- 李伯康 → `prompts/characters/li-bokang.md`（图片：`public/portraits/li-bokang.png`）
- 徐洋 → `prompts/characters/xu-yan.md`（图片：`public/portraits/xu-yan.png`）
- 柯桦 → `prompts/characters/ke-hua.md`（图片：`public/portraits/ke-hua.png`）
- 何大川 → `prompts/characters/he-dachuan.md`（图片：`public/portraits/he-dachuan.png`）
- 周兴礼 → `prompts/characters/zhou-xingli.md`（图片：`public/portraits/zhou-xingli.png`）
- 叶琳 → `prompts/characters/ye-lin.md`（图片：`public/portraits/ye-lin.png`）
- 小祁 → `prompts/characters/xiao-qi.md`（图片：`public/portraits/xiao-qi.png`）
- 老李 → `prompts/characters/lao-li.md`（图片：`public/portraits/lao-li.png`）
- 叶子枭 → `prompts/characters/ye-zixiao.md`（图片：`public/portraits/ye-zixiao.png`）
- 刘子叔 → `prompts/characters/liuzi-shu.md`（图片：`public/portraits/liuzi-shu.png`）
- 小白 → `prompts/characters/xiao-bai.md`（图片：`public/portraits/xiao-bai.png`）

## 次要人物（不出图、无提示词）
李富贵、珍珍、阿宏、阿龙、老泥鳅、雷子、仇伍、王宗孝、付震、江小龙、林耀宗、陆晓峰、老金
