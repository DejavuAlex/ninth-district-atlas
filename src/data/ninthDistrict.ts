import type { Character, LocationNode, NovelDataset } from "../types/novel";

const range = (startOrder: number, endOrder: number, label: string) => ({
  startOrder,
  endOrder,
  label
});

const relationshipIdsFor = (characterId: string, pairs: Array<[string, string]>) =>
  pairs.filter(([, id]) => id.includes(`:${characterId}:`) || id.endsWith(`:${characterId}`)).map(([id]) => id);

const relationshipPairs: Array<[string, string]> = [
  ["rel-qin-qi", "brotherhood:qin-yu:qi-lin"],
  ["rel-qin-cat", "brotherhood:qin-yu:lao-mao"],
  ["rel-qin-ma2", "ally:qin-yu:ma-lao-er"],
  ["rel-qin-yuan", "enemy:qin-yu:yuan-ke"],
  ["rel-qin-lin", "romance:qin-yu:lin-nianlei"],
  ["rel-qin-wudi", "political:qin-yu:wu-di"],
  ["rel-qin-guyan", "ally:qin-yu:gu-yan"],
  ["rel-qin-keke", "ally:qin-yu:ke-ke"],
  ["rel-qin-dong", "ally:qin-yu:lin-chengdong"],
  ["rel-qin-zhan", "ally:qin-yu:zhan-nan"],
  ["rel-qin-fu", "ally:qin-yu:fu-xiaohao"],
  ["rel-qin-lizhan", "ally:qin-yu:li-zhan"],
  ["rel-qin-daya", "ally:qin-yu:da-ya"],
  ["rel-qin-wutianyin", "ally:qin-yu:wu-tianyin"],
  ["rel-qin-fengyunian", "political:qin-yu:feng-yunian"],
  ["rel-qin-fengji", "rival:qin-yu:feng-ji"],
  ["rel-qin-xiang", "ally:qin-yu:xiang-zehao"],
  ["rel-qin-meng", "mentor:qin-yu:meng-xi"],
  ["rel-qin-libokang", "enemy:qin-yu:li-bokang"],
  ["rel-qin-xuyan", "ally:qin-yu:xu-yan"],
  ["rel-qin-kehua", "political:qin-yu:ke-hua"],
  ["rel-qin-he", "ally:qin-yu:he-dachuan"],
  ["rel-qin-zhou", "enemy:qin-yu:zhou-xingli"],
  ["rel-ma2-malaoye", "family:ma-lao-er:ma-lao-ye"],
  ["rel-ma2-cat", "ally:ma-lao-er:lao-mao"],
  ["rel-wudi-guyan", "political:wu-di:gu-yan"],
  ["rel-daya-lizhan", "brotherhood:da-ya:li-zhan"],
  ["rel-meng-he", "ally:meng-xi:he-dachuan"],
  ["rel-libokang-fengji", "political:li-bokang:feng-ji"],
  ["rel-xiang-guyan", "ally:xiang-zehao:gu-yan"]
];

const buildMapPrompt = (location: Omit<LocationNode, "mapPrompt">) =>
  `${location.name}区域街道风貌画面生成提示词：${location.summary}${location.atmosphere}。世界观设定为灾变之后、持续数十年的“冰封期”末世，气候极寒阴冷、资源匮乏、秩序半崩坏。画面重点表现该区域真实的街道风貌：高密度破败楼群、湿冷阴暗的街巷、积水残雪与泥泞地面、临时搭建的棚屋与集装箱、缠绕的电线、老旧霓虹与应急灯、监控杆与警戒线，远处是雾气笼罩的高楼轮廓。写实电影质感、低饱和冷色调、夜晚或阴天、地面潮湿反光，无文字、无人物特写、16:9。`;

const buildCharacterPrompt = (character: Omit<Character, "relationshipIds" | "imagePrompt">) =>
  `${character.name}，第九特区人物形象设定图，身份是${character.role}，气质体现${character.traits.join("、")}。世界观为灾变后的冰封末世，气候极寒、资源匮乏。写实电影质感的半身像，穿着耐寒粗粝的多层旧衣物、围巾或风衣，低饱和冷色调，背景是阴冷潮湿的破败城区虚化氛围，无文字、竖版。`;

const character = (item: Omit<Character, "relationshipIds" | "imagePrompt">): Omit<Character, "imagePrompt"> => ({
  ...item,
  relationshipIds: relationshipIdsFor(item.id, relationshipPairs)
});

const rawNinthDistrict: Omit<NovelDataset, "locations" | "characters"> & {
  locations: Array<Omit<LocationNode, "mapPrompt">>;
  characters: Array<Omit<Character, "imagePrompt">>;
} = {
  id: "ninth-district",
  title: "第九特区",
  author: "伪戒",
  premise:
    "灾变之后，资源稀缺、区域割裂、秩序重建。秦禹从待规划区进入第九特区，在警务、黑街、军政和战场之间一步步建立自己的力量。",
  factions: [
    { id: "planned-zone", name: "待规划区流民", summary: "秩序边缘的人群，靠交易、帮派和临时规则求生。", color: "#9f7a4d" },
    { id: "songjiang-police", name: "松江警务系统", summary: "第九特区内维持秩序的官方力量，也是秦禹早期进入权力结构的入口。", color: "#5f7f9d" },
    { id: "black-street", name: "黑街势力", summary: "松江地下秩序的集合，利益、义气和暴力在这里混杂。", color: "#c45532" },
    { id: "ma-family", name: "马家", summary: "以马老爷子和马老二为代表的江湖力量，和秦禹早期结盟。", color: "#d29b4c" },
    { id: "yuan-family", name: "袁家", summary: "袁克背后的家族势力，是秦禹早期最直接的对手。", color: "#8e3f32" },
    { id: "wu-line", name: "吴系", summary: "围绕吴迪等人形成的政治资源，与秦禹多次互相借力。", color: "#6e8f6a" },
    { id: "gu-line", name: "顾系", summary: "以顾言和顾总督相关资源为核心的军政力量。", color: "#7b78a8" },
    { id: "chuanfu", name: "川府系", summary: "秦禹后期立足的核心地盘，逐渐从地方力量扩展成军事集团。", color: "#b4663c" },
    { id: "feng-line", name: "冯系", summary: "冯玉年、冯济相关势力，贯穿权谋和战局转换。", color: "#7d5b45" },
    { id: "chen-line", name: "陈系", summary: "南沪和外部政治博弈中的重要一方，与川府阶段产生多次交集。", color: "#476e73" },
    { id: "eu-zone", name: "欧盟一区力量", summary: "后期外部战局的重要压力来源，推动战争从区域冲突走向国际化。", color: "#576f9e" },
    { id: "military-intel", name: "军情系统", summary: "后期暗战、潜入、营救和心理战的关键力量。", color: "#a27c61" }
  ],
  locations: [
    { id: "planning-zone", name: "待规划区", kind: "wasteland", x: 95, y: 46, summary: "秦禹出身和故事起点所在的无政府边缘地带。", atmosphere: "贫瘠、粗粝、没有稳定规则。", factionIds: ["planned-zone"], eventIds: ["event-prologue", "event-yuan-ke-end"] },
    { id: "ninth-district", name: "第九特区", kind: "district", x: 88, y: 30, summary: "灾变后重建秩序的区域，也是身份、粮食和权力的入口。", atmosphere: "秩序表面稳定，底层竞争残酷。", factionIds: ["songjiang-police", "wu-line"], eventIds: ["event-qin-enters", "event-public-order"] },
    { id: "songjiang", name: "松江", kind: "city", x: 91, y: 33, summary: "秦禹早期扎根的核心城市，警务、黑街和政治利益在此交织。", atmosphere: "城市秩序和地下秩序并行。", sceneImage: "/scenes/songjiang.png", factionIds: ["songjiang-police", "black-street"], eventIds: ["event-police-team", "event-songjiang-return", "event-songjiang-takeover"] },
    { id: "black-street", name: "黑街", kind: "street", x: 94, y: 38, summary: "秦禹、老猫和马家频繁活动的灰色地带。", atmosphere: "饭局、码牌、枪声和人情并存。", factionIds: ["black-street", "ma-family"], eventIds: ["event-black-street", "event-ma-alliance"] },
    { id: "tuzha-street", name: "土渣街", kind: "street", x: 86, y: 40, summary: "早期冲突集中爆发的街区，秦禹从这里切入地下规则。", atmosphere: "低矮、拥挤、一步错就会被吞掉。", factionIds: ["black-street"], eventIds: ["event-tuzha-street", "event-three-parties"] },
    { id: "jiangzhou", name: "江州", kind: "city", x: 80, y: 47, summary: "早期江湖交易和后期乱局都反复牵动的重要城市。", atmosphere: "商路、家族和江湖人情交错。", factionIds: ["ma-family", "black-street"], eventIds: ["event-jiangzhou", "event-jiangzhou-chaos"] },
    { id: "fengbei", name: "奉北", kind: "city", x: 84, y: 24, summary: "权力圈层和警务政治的重要节点，秦禹多次被卷入。", atmosphere: "表面规矩森严，背后棋局密集。", factionIds: ["wu-line", "feng-line"], eventIds: ["event-fengbei", "event-pharma"] },
    { id: "changji", name: "长吉", kind: "city", x: 78, y: 22, summary: "从江湖斗争走向军事行动的关键城市之一。", atmosphere: "道路、驻防和突袭成为新的语言。", factionIds: ["gu-line", "chuanfu"], eventIds: ["event-changji", "event-sword-changji"] },
    { id: "nanhu", name: "南沪", kind: "city", x: 74, y: 50, summary: "南方巨头聚集的政治舞台，智囊和派系交锋频繁。", atmosphere: "会所、会议和暗线共同推动局势。", factionIds: ["chen-line", "military-intel"], eventIds: ["event-nanhu", "event-nanhu-fire"] },
    { id: "chuanfu", name: "川府", kind: "frontier", x: 77, y: 42, summary: "秦禹后期立足、扩军和建立川府系的核心地盘。", atmosphere: "粮仓、生活镇和军队让秩序重新落地。", factionIds: ["chuanfu"], eventIds: ["event-chuanfu-entry", "event-chuanfu-war", "event-salt-island"] },
    { id: "five-zone", name: "五区", kind: "district", x: 66, y: 60, summary: "妖魔鬼怪齐聚的外部区域，牵动边境和外交压力。", atmosphere: "利益更复杂，合作和背叛更快切换。", factionIds: ["eu-zone", "chen-line"], eventIds: ["event-five-zone"] },
    { id: "seven-zone", name: "七区", kind: "district", x: 88, y: 56, summary: "后期奔袭和驻防团冲突的重要区域。", atmosphere: "边境紧绷，局部冲突随时升级。", factionIds: ["military-intel"], eventIds: ["event-seven-zone-raid"] },
    { id: "eight-zone", name: "八区", kind: "district", x: 70, y: 33, summary: "后期战局介入者，影响九区和川府的政治平衡。", atmosphere: "高层会议和军事压力共同落子。", factionIds: ["gu-line", "feng-line"], eventIds: ["event-eight-zone"] },
    { id: "eu-first-zone", name: "欧盟一区", kind: "frontier", x: 16, y: 42, summary: "外部势力代表区域，推动故事进入更大尺度的冲突。", atmosphere: "规则不同，谈判和军事威慑并行。", factionIds: ["eu-zone"], eventIds: ["event-eu-zone"] },
    { id: "old-triangle", name: "老三角", kind: "frontier", x: 73, y: 67, summary: "后期目光聚集的边境地带，军情和战场压力交织。", atmosphere: "潮湿、混乱、到处是临时阵线。", factionIds: ["military-intel", "chuanfu"], eventIds: ["event-old-triangle"] },
    { id: "bar-city", name: "巴尔城", kind: "battlefield", x: 58, y: 56, summary: "北伐阶段的重要攻坚目标，城市攻防成为大结局前的焦点。", atmosphere: "炮火、围城和心理战压到极限。", factionIds: ["eu-zone", "chuanfu"], eventIds: ["event-bar-city"] },
    { id: "yemen", name: "耶门", kind: "frontier", x: 50, y: 82, summary: "结尾阶段外部谈判和再赴战场的落点之一。", atmosphere: "远离故土，却仍被华区战局牵动。", factionIds: ["military-intel", "eu-zone"], eventIds: ["event-yemen"] },
    { id: "red-dan", name: "红丹战场", kind: "battlefield", x: 66, y: 76, summary: "最终决战附近的象征性战场，承接北伐后的最后冲锋。", atmosphere: "疲惫、牺牲和最后的国仇家恨集中爆发。", factionIds: ["chuanfu", "military-intel"], eventIds: ["event-final-charge"] }
  ],
  arcs: [
    { id: "arc-survival-entry", title: "从待规划区进入九区", chapterRange: range(1, 80, "序章至第七十九章"), summary: "秦禹买身份进入第九特区，从底层生存者变成警务体系中的新面孔。", keyEvents: ["event-prologue", "event-qin-enters", "event-police-team"], featuredLocations: ["planning-zone", "ninth-district", "songjiang"], featuredCharacters: ["qin-yu", "qi-lin", "lao-mao"] },
    { id: "arc-black-street", title: "黑街立足与马家结盟", chapterRange: range(81, 220, "第八十章至第二一八章"), summary: "秦禹在土渣街和黑街不断碰撞，逐渐明白钱、权和人情如何决定命运。", keyEvents: ["event-tuzha-street", "event-black-street", "event-ma-alliance"], featuredLocations: ["tuzha-street", "black-street", "jiangzhou"], featuredCharacters: ["qin-yu", "ma-lao-er", "ma-lao-ye", "lao-mao"] },
    { id: "arc-fengbei-crime", title: "人口线索与奉北棋局", chapterRange: range(221, 420, "第二一九章至第四零零章"), summary: "人口贩卖、奉北圈层和袁克压力把秦禹推入更深的权力局。", keyEvents: ["event-human-trade", "event-sixth-floor", "event-fengbei"], featuredLocations: ["fengbei", "songjiang"], featuredCharacters: ["qin-yu", "yuan-ke", "fu-xiaohao", "feng-yunian"] },
    { id: "arc-wu-tianyin", title: "吴天胤浮出水面", chapterRange: range(421, 620, "第四零一章至第六二零章"), summary: "吴天胤的极端选择和袁克的结局，让松江黑白两道重新洗牌。", keyEvents: ["event-wu-tianyin-search", "event-songjiang-return", "event-yuan-ke-end"], featuredLocations: ["songjiang", "planning-zone"], featuredCharacters: ["qin-yu", "wu-tianyin", "yuan-ke", "qi-lin"] },
    { id: "arc-trade-routes", title: "松江交易线扩张", chapterRange: range(621, 880, "第六二一章至第八八二章"), summary: "货、路、人和客户开始形成网络，秦禹从办案者变成资源组织者。", keyEvents: ["event-yaoguang", "event-wu-escape", "event-port-deal"], featuredLocations: ["songjiang", "jiangzhou"], featuredCharacters: ["qin-yu", "lin-chengdong", "zhan-nan", "wu-tianyin"] },
    { id: "arc-nanhu-changji", title: "南沪暗流与长吉战火", chapterRange: range(881, 1120, "第八八三章至第一一二五章"), summary: "南沪巨头、长吉战场和内部改旗易帜让故事从江湖买卖进入军政冲突。", keyEvents: ["event-nanhu", "event-changji", "event-south-fire"], featuredLocations: ["nanhu", "changji"], featuredCharacters: ["qin-yu", "gu-yan", "wu-di", "li-zhan"] },
    { id: "arc-pharma-layout", title: "药业集团与权力布局", chapterRange: range(1121, 1280, "第一一二六章至第一二八五章"), summary: "药业、借钱、布局和临走前安排，显示秦禹已经学会用制度和资本做局。", keyEvents: ["event-pharma", "event-lay-before-leave", "event-chuanfu-entry"], featuredLocations: ["fengbei", "chuanfu"], featuredCharacters: ["qin-yu", "ke-ke", "wu-di", "lin-nianlei"] },
    { id: "arc-chuanfu-rising", title: "落地川府与从龙之战", chapterRange: range(1281, 1526, "第一二八六章至第一五二六章"), summary: "秦禹进入川府，从远山生活镇到百万亩粮仓，开始建立自己的地盘和军队。", keyEvents: ["event-far-mountain", "event-chuanfu-war", "event-grain-army"], featuredLocations: ["chuanfu"], featuredCharacters: ["qin-yu", "da-ya", "xiang-zehao", "ke-ke"] },
    { id: "arc-border-rescue", title: "边境风波与营救暗战", chapterRange: range(1527, 1768, "第一五二七章至第一七六八章"), summary: "自来水厂营救、七区奔袭和边境屠杀，让川府系在外部压力中快速成熟。", keyEvents: ["event-water-plant", "event-seven-zone-raid", "event-border-massacre", "event-five-zone"], featuredLocations: ["seven-zone", "nanhu", "old-triangle", "five-zone"], featuredCharacters: ["qin-yu", "li-zhan", "da-ya", "ke-ke"] },
    { id: "arc-military-expansion", title: "军事扩张与川军插旗", chapterRange: range(1769, 2004, "第一七六九章至第二零零四章"), summary: "孟玺、何大川和大牙等人进入更大的军事舞台，川府系完成从地方势力到军政集团的跃迁。", keyEvents: ["event-mengxi-appears", "event-eu-armor", "event-salt-island"], featuredLocations: ["chuanfu", "eu-first-zone"], featuredCharacters: ["qin-yu", "meng-xi", "he-dachuan", "da-ya"] },
    { id: "arc-nine-eight-politics", title: "九区阴云与八区介入", chapterRange: range(2005, 2248, "第二零零五章至第二二四八章"), summary: "九区、八区和奉北局势牵动各方，秦禹在政治介入和军事行动之间继续扩张。", keyEvents: ["event-songjiang-takeover", "event-eight-zone", "event-mokambi"], featuredLocations: ["ninth-district", "eight-zone", "fengbei"], featuredCharacters: ["qin-yu", "meng-xi", "feng-ji", "gu-yan"] },
    { id: "arc-foreign-chaos", title: "异地乱局与军情暗线", chapterRange: range(2249, 2408, "第二二四九章至第二四零八章"), summary: "莫甘比、商业纠纷和军情通道，把秦禹一方拖进更复杂的外部局面。", keyEvents: ["event-jiangzhou-chaos", "event-russian-conflict", "event-intel-channel"], featuredLocations: ["jiangzhou", "old-triangle"], featuredCharacters: ["qin-yu", "meng-xi", "li-bokang", "xu-yan"] },
    { id: "arc-final-war", title: "南沪烽火与最终北伐", chapterRange: range(2409, 2685, "第二四零九章至第二六八五章"), summary: "李伯康的计划、南沪炮火、巴尔城攻坚和北伐推进，将所有派系推向终局。", keyEvents: ["event-li-bokang-plan", "event-nanhu-fire", "event-north-expedition", "event-bar-city"], featuredLocations: ["nanhu", "bar-city", "red-dan"], featuredCharacters: ["qin-yu", "li-bokang", "feng-ji", "da-ya"] },
    { id: "arc-spring", title: "故人月影与春暖花开", chapterRange: range(2686, 2743, "第二六八六章至第二七五零章"), summary: "战后余波、耶门落地、最后冲锋和故人重逢，让故事从硝烟回到人的选择。", keyEvents: ["event-yemen", "event-final-charge", "event-spring"], featuredLocations: ["yemen", "red-dan"], featuredCharacters: ["qin-yu", "xiang-zehao", "li-zhan", "xu-yan"] }
  ],
  events: [
    { id: "event-prologue", title: "灾变后的待规划区", chapterRange: range(1, 1, "序章 七宗罪"), locationId: "planning-zone", characterIds: ["qin-yu"], factionIds: ["planned-zone"], summary: "灾变改变土地、粮食和人心，秦禹从无政府区走向九区身份交易。", impact: "奠定全书的废土秩序和底层生存逻辑。" },
    { id: "event-qin-enters", title: "秦禹初入第九特区", chapterRange: range(2, 18, "第一章至第十七章"), locationId: "ninth-district", characterIds: ["qin-yu", "li-fugui"], factionIds: ["planned-zone", "songjiang-police"], summary: "秦禹通过身份和工作机会进入九区，开始接触新的城市规则。", impact: "主角完成从区外流民到区内办事者的身份转换。" },
    { id: "event-police-team", title: "三组关系成形", chapterRange: range(7, 39, "第七章至第三十八章"), locationId: "songjiang", characterIds: ["qin-yu", "qi-lin", "lao-mao"], factionIds: ["songjiang-police"], summary: "秦禹进入警务小组，与齐麟、老猫等人形成早期互信。", impact: "兄弟线和警务线成为前期主轴。" },
    { id: "event-public-order", title: "九区众生相显露", chapterRange: range(18, 45, "第十七章至第四十五章"), locationId: "ninth-district", characterIds: ["qin-yu", "lao-mao"], factionIds: ["songjiang-police", "black-street"], summary: "警务、街面和底层人物共同展示九区的现实规则。", impact: "秦禹看到法律之外还有利益和人情。" },
    { id: "event-tuzha-street", title: "土渣街风起", chapterRange: range(10, 42, "第九章至第四十一章"), locationId: "tuzha-street", characterIds: ["qin-yu", "yuan-ke"], factionIds: ["black-street", "yuan-family"], summary: "土渣街冲突把秦禹推到袁克和地下势力面前。", impact: "早期敌对关系明朗，秦禹开始以硬手段求生。" },
    { id: "event-three-parties", title: "三家齐聚土渣街", chapterRange: range(41, 42, "第四十一章前后"), locationId: "tuzha-street", characterIds: ["qin-yu", "ma-lao-er", "yuan-ke"], factionIds: ["black-street", "ma-family", "yuan-family"], summary: "多方势力在土渣街码牌，街面冲突背后有更复杂的靠山。", impact: "秦禹意识到黑街不是单点斗狠，而是多家利益互相压制。" },
    { id: "event-black-street", title: "黑街双坑", chapterRange: range(45, 120, "第四十五章至第一百二十章"), locationId: "black-street", characterIds: ["qin-yu", "lao-mao", "ma-lao-er"], factionIds: ["black-street", "ma-family"], summary: "秦禹和老猫在黑街吃亏也设局，逐渐摸清地下秩序。", impact: "黑街成为秦禹积累人脉和风险的第一个舞台。" },
    { id: "event-ma-alliance", title: "马家关系建立", chapterRange: range(75, 218, "第七十五章至第二一八章"), locationId: "black-street", characterIds: ["qin-yu", "ma-lao-er", "ma-lao-ye"], factionIds: ["ma-family", "black-street"], summary: "马老二与马老爷子让秦禹接触到另一种江湖规则。", impact: "秦禹获得能对抗袁家的地下盟友。" },
    { id: "event-human-trade", title: "人口贩卖线索出现", chapterRange: range(240, 270, "第二四零章至第二六九章"), locationId: "songjiang", characterIds: ["qin-yu", "fu-xiaohao"], factionIds: ["songjiang-police"], summary: "秦禹听闻人口贩子线索，案件背后牵出更复杂的利益网。", impact: "警务线从街面纠纷进入更黑暗的犯罪链条。" },
    { id: "event-sixth-floor", title: "第六层血拼", chapterRange: range(317, 323, "第三一七章至第三二三章"), locationId: "songjiang", characterIds: ["qin-yu", "qi-lin", "lao-mao"], factionIds: ["songjiang-police"], summary: "几名核心人物在封闭空间里正面搏命，兄弟配合经受考验。", impact: "秦禹小队的战斗默契和凶悍形象被强化。" },
    { id: "event-fengbei", title: "赶往奉北", chapterRange: range(397, 403, "第三九七章至第四零三章"), locationId: "fengbei", characterIds: ["qin-yu", "feng-yunian", "lao-mao"], factionIds: ["feng-line", "wu-line"], summary: "秦禹进入奉北圈层，开始面对更高层级的政治和人情。", impact: "故事从松江街面进入上层权力空间。" },
    { id: "event-wu-tianyin-search", title: "寻找吴天胤", chapterRange: range(477, 483, "第四七七章至第四八三章"), locationId: "songjiang", characterIds: ["qin-yu", "wu-tianyin"], factionIds: ["black-street", "songjiang-police"], summary: "吴天胤走向极端后，黑白两道同时寻找他的踪迹。", impact: "个人悲剧转化为松江权力洗牌的导火索。" },
    { id: "event-songjiang-return", title: "杀回松江", chapterRange: range(553, 581, "第五五三章至第五八一章"), locationId: "songjiang", characterIds: ["qin-yu", "qi-lin", "wu-tianyin"], factionIds: ["songjiang-police", "black-street"], summary: "秦禹一方重新杀回松江，在北站等节点爆发激战。", impact: "秦禹从被动应对转为主动夺回局面。" },
    { id: "event-yuan-ke-end", title: "待规划区斩袁克", chapterRange: range(617, 620, "第六一七章至第六二零章"), locationId: "planning-zone", characterIds: ["qin-yu", "yuan-ke"], factionIds: ["yuan-family", "planned-zone"], summary: "袁克的命运在待规划区终结，早期最大敌手退出舞台。", impact: "秦禹完成前期复仇和清障，松江进入新阶段。" },
    { id: "event-yaoguang", title: "耀光交易线开启", chapterRange: range(637, 643, "第六三七章至第六四三章"), locationId: "songjiang", characterIds: ["qin-yu", "lin-chengdong", "zhan-nan"], factionIds: ["black-street", "songjiang-police"], summary: "秦禹看货、交易、入驻新渠道，资源组织能力开始显现。", impact: "他不再只是办案，而是经营人和货的网络。" },
    { id: "event-wu-escape", title: "吴天胤消失", chapterRange: range(717, 723, "第七一七章至第七二三章"), locationId: "jiangzhou", characterIds: ["wu-tianyin", "qin-yu"], factionIds: ["planned-zone", "black-street"], summary: "交易完成后临检突至，吴天胤相关线索在逃亡中断开。", impact: "外部江湖线继续悬置，为后续再起埋下伏笔。" },
    { id: "event-jiangzhou", title: "双星耀江州", chapterRange: range(55, 65, "第五十五章至第六十四章"), locationId: "jiangzhou", characterIds: ["qin-yu", "ma-lao-er"], factionIds: ["ma-family", "black-street"], summary: "秦禹和马家线进入江州，和当地利益发生正面碰撞。", impact: "江州成为秦禹走出松江街面的第一个重要外部节点。" },
    { id: "event-port-deal", title: "港口多方博弈", chapterRange: range(879, 883, "第八七九章至第八八三章"), locationId: "jiangzhou", characterIds: ["qin-yu", "lin-chengdong", "zhan-nan"], factionIds: ["black-street", "ma-family"], summary: "港口露面后，多股势力围绕条件和利益继续拉扯。", impact: "秦禹的资源局从松江延伸到更广的商路。" },
    { id: "event-nanhu", title: "南沪巨头聚集", chapterRange: range(1061, 1111, "第一零六六章至第一一一一章"), locationId: "nanhu", characterIds: ["qin-yu", "wu-di", "gu-yan"], factionIds: ["wu-line", "gu-line", "chen-line"], summary: "南沪成为巨头汇聚之地，秦禹被迫在各方之间寻找落点。", impact: "南方政治线开始影响秦禹的整体布局。" },
    { id: "event-changji", title: "马踏长吉", chapterRange: range(1037, 1054, "第一零四零章至第一零五四章"), locationId: "changji", characterIds: ["qin-yu", "gu-yan", "li-zhan"], factionIds: ["gu-line", "chuanfu"], summary: "长吉方向爆发军事行动，内部改旗易帜后进入大战前夜。", impact: "江湖冲突正式升级为成建制的战场较量。" },
    { id: "event-sword-changji", title: "剑指长吉", chapterRange: range(2058, 2071, "第二零六二章至第二零七一章"), locationId: "changji", characterIds: ["qin-yu", "gu-yan", "feng-ji"], factionIds: ["gu-line", "feng-line"], summary: "后期局势再度指向长吉，驻防和入驻失败让矛盾升级。", impact: "长吉从早期战场变成后期权力重新分配的关键点。" },
    { id: "event-south-fire", title: "南面火海", chapterRange: range(1042, 1047, "第一零四六章至第一零四七章"), locationId: "changji", characterIds: ["li-zhan", "da-ya"], factionIds: ["gu-line"], summary: "南面战火扩大，少数兵力面对更大规模压力。", impact: "军事能力和指挥判断开始决定角色生死。" },
    { id: "event-pharma", title: "药业集团落子", chapterRange: range(1121, 1128, "第一一二六章至第一一二八章"), locationId: "fengbei", characterIds: ["qin-yu", "ke-ke", "wu-di"], factionIds: ["wu-line"], summary: "药业集团成为新的利益承载物，资本和权力比枪火更隐蔽。", impact: "秦禹学会用组织和产业抵抗单纯暴力。" },
    { id: "event-lay-before-leave", title: "临走前布局", chapterRange: range(1197, 1206, "第一二零二章至第一二零六章"), locationId: "fengbei", characterIds: ["qin-yu", "ke-ke"], factionIds: ["wu-line", "chuanfu"], summary: "秦禹在离开前处理资金、人情和后手，为下一阶段做准备。", impact: "前期人脉被转化为可持续的布局能力。" },
    { id: "event-chuanfu-entry", title: "落地川府", chapterRange: range(1279, 1288, "第一二八四章至第一二八八章"), locationId: "chuanfu", characterIds: ["qin-yu", "xiang-zehao"], factionIds: ["chuanfu"], summary: "秦禹进入川府，面对远山生活镇和新地盘的现实问题。", impact: "全书核心地盘转换，秦禹从城市斗争走向建制扩张。" },
    { id: "event-far-mountain", title: "远山生活镇冲突", chapterRange: range(1288, 1368, "第一二八八章至第一三六八章"), locationId: "chuanfu", characterIds: ["qin-yu", "da-ya"], factionIds: ["chuanfu"], summary: "远山生活镇矛盾集中爆发，秦禹调人、调枪、尝试谈判。", impact: "川府系的基层治理和军事威慑同时成形。" },
    { id: "event-chuanfu-war", title: "马踏川府", chapterRange: range(1311, 1344, "第一三一六章至第一三四四章"), locationId: "chuanfu", characterIds: ["qin-yu", "xiang-zehao", "da-ya"], factionIds: ["chuanfu"], summary: "川府风雨欲来，多方增兵，秦禹一方迎来关键硬仗。", impact: "秦禹开始以军政集团的方式处理地方冲突。" },
    { id: "event-grain-army", title: "粮仓与十万军", chapterRange: range(1519, 1526, "第一五二四章至第一五二六章"), locationId: "chuanfu", characterIds: ["qin-yu", "ke-ke"], factionIds: ["chuanfu"], summary: "百万亩粮仓和军队规模成为川府系向上攀登的基础。", impact: "资源、粮食和军队完成绑定，川府系进入上升通道。" },
    { id: "event-water-plant", title: "自来水厂营救", chapterRange: range(1597, 1608, "第一六零二章至第一六零八章"), locationId: "nanhu", characterIds: ["qin-yu", "li-zhan", "da-ya"], factionIds: ["military-intel", "chuanfu"], summary: "众人汇聚自来水厂，营救行动在枪战中推进到绝境。", impact: "暗战和正面火力交错，川府核心班底经受生死考验。" },
    { id: "event-seven-zone-raid", title: "奔袭七区驻防团", chapterRange: range(1667, 1672, "第一六七二章前后"), locationId: "seven-zone", characterIds: ["li-zhan", "da-ya"], factionIds: ["military-intel", "chuanfu"], summary: "奔袭行动剑指七区驻防力量，边境局势快速升温。", impact: "川府系具备跨区行动和主动打击能力。" },
    { id: "event-border-massacre", title: "边境风波升级", chapterRange: range(1677, 1688, "第一六八二章至第一六八八章"), locationId: "old-triangle", characterIds: ["qin-yu", "ke-ke"], factionIds: ["military-intel", "chuanfu"], summary: "边境屠杀引发众将规劝，可可看出新的契机。", impact: "人道惨剧转化为战略调整的理由。" },
    { id: "event-five-zone", title: "五区会议暗流", chapterRange: range(1738, 1743, "第一七四三章前后"), locationId: "five-zone", characterIds: ["qin-yu", "ke-ke"], factionIds: ["eu-zone", "chen-line", "chuanfu"], summary: "五区会议让外部势力和川府利益产生新的碰撞。", impact: "边境冲突被推向更复杂的跨区谈判和博弈。" },
    { id: "event-mengxi-appears", title: "孟玺进入棋局", chapterRange: range(1815, 1853, "第一八二零章至第一八五三章"), locationId: "chuanfu", characterIds: ["meng-xi", "he-dachuan", "qin-yu"], factionIds: ["chuanfu"], summary: "孟玺和何大川进入主线，匪气、谋略和军事需求结合。", impact: "川府系的谋士和野战力量得到补足。" },
    { id: "event-eu-armor", title: "欧系装甲师压力", chapterRange: range(1921, 1928, "第一九二六章至第一九二八章"), locationId: "eu-first-zone", characterIds: ["da-ya", "li-zhan"], factionIds: ["eu-zone", "chuanfu"], summary: "欧系装甲力量出现，战斗进入更高强度和更大代价的阶段。", impact: "外部军事技术差距成为秦禹一方必须面对的问题。" },
    { id: "event-eu-zone", title: "出发欧盟一区", chapterRange: range(1656, 1661, "第一六六一章前后"), locationId: "eu-first-zone", characterIds: ["qin-yu", "ke-hua"], factionIds: ["eu-zone", "military-intel"], summary: "外部力量的规则和压力进入主线，秦禹阵营需要面对不同体系。", impact: "故事视野从华区内部扩展到更复杂的外部秩序。" },
    { id: "event-salt-island", title: "川军插旗盐岛", chapterRange: range(1997, 2004, "第二零零一章至第二零零四章"), locationId: "chuanfu", characterIds: ["qin-yu", "da-ya", "meng-xi"], factionIds: ["chuanfu"], summary: "战后川军插旗，重都门庭若市，川府系炙手可热。", impact: "秦禹的地方势力正式获得更大政治分量。" },
    { id: "event-songjiang-takeover", title: "一步步拿下松江", chapterRange: range(2077, 2084, "第二零八一章至第二零八四章"), locationId: "songjiang", characterIds: ["qin-yu", "feng-ji"], factionIds: ["chuanfu", "feng-line"], summary: "案件真相和匿名电话交织，松江控制权被逐步撬动。", impact: "早期起点城市被重新纳入秦禹的权力版图。" },
    { id: "event-eight-zone", title: "八区介入", chapterRange: range(2179, 2183, "第二一八三章前后"), locationId: "eight-zone", characterIds: ["gu-yan", "qin-yu"], factionIds: ["gu-line", "feng-line"], summary: "八区力量介入，使九区和川府相关博弈再度升级。", impact: "区域战争被更高层级的政治力量左右。" },
    { id: "event-mokambi", title: "再回莫甘比", chapterRange: range(2238, 2248, "第二二四三章至第二二四八章"), locationId: "old-triangle", characterIds: ["qin-yu", "he-dachuan"], factionIds: ["military-intel"], summary: "外部区域激战和谈判并行，远在四区的朋友也被卷入。", impact: "秦禹阵营的影响力扩展到更复杂的海外局面。" },
    { id: "event-old-triangle", title: "目光聚集老三角", chapterRange: range(2425, 2432, "第二四三二章前后"), locationId: "old-triangle", characterIds: ["qin-yu", "xu-yan", "li-bokang"], factionIds: ["military-intel", "chuanfu"], summary: "多方目光转向老三角，军情、边境和战场压力汇聚。", impact: "老三角成为终局前暗线和明线交错的关键区域。" },
    { id: "event-jiangzhou-chaos", title: "江州乱", chapterRange: range(2136, 2445, "第二一四零章至第二四四五章"), locationId: "jiangzhou", characterIds: ["qin-yu", "meng-xi"], factionIds: ["black-street", "chuanfu"], summary: "江州在前后阶段多次出现乱局，商业和政治纠纷互相点燃。", impact: "旧江湖节点被新军政格局重新吞并。" },
    { id: "event-russian-conflict", title: "商业纠纷变冲突", chapterRange: range(2319, 2330, "第二三二六章至第二三三零章"), locationId: "old-triangle", characterIds: ["meng-xi", "li-bokang"], factionIds: ["military-intel"], summary: "商业纠纷迅速升级为群体冲突，幕后操盘者开始显形。", impact: "后期暗战不再只是军事行动，也包含舆论和商业外壳。" },
    { id: "event-intel-channel", title: "军情通道激战", chapterRange: range(2397, 2408, "第二四零四章至第二四零八章"), locationId: "old-triangle", characterIds: ["xu-yan", "li-zhan"], factionIds: ["military-intel", "chuanfu"], summary: "高危军情工作和通道内激战，把个人牺牲推到前台。", impact: "军情线成为最终战役前不可或缺的支撑。" },
    { id: "event-li-bokang-plan", title: "李伯康计划推进", chapterRange: range(2470, 2548, "第二四七七章至第二五四八章"), locationId: "nanhu", characterIds: ["li-bokang", "feng-ji", "qin-yu"], factionIds: ["feng-line", "military-intel"], summary: "李伯康的蓝图和计划不断推进，秦禹一方被迫应对更细密的局。", impact: "最终战争前，智谋对抗几乎和正面战场同等重要。" },
    { id: "event-nanhu-fire", title: "炮打南沪", chapterRange: range(2487, 2538, "第二四九四章至第二五三八章"), locationId: "nanhu", characterIds: ["qin-yu", "li-bokang"], factionIds: ["chen-line", "feng-line", "chuanfu"], summary: "南沪城内勾心斗角持续，炮火让政治斗争彻底军事化。", impact: "各派再难维持体面，终局冲突正式燃起。" },
    { id: "event-north-expedition", title: "兵出如龙北伐", chapterRange: range(2652, 2674, "第二六五九章至第二六七四章"), locationId: "red-dan", characterIds: ["qin-yu", "da-ya", "ke-hua"], factionIds: ["chuanfu", "military-intel"], summary: "战事再次升级，大牙被征召，北伐兵锋出动。", impact: "秦禹阵营从防守和局部争夺转向战略进攻。" },
    { id: "event-bar-city", title: "巴尔城破", chapterRange: range(2653, 2685, "第二六六零章至第二六八五章"), locationId: "bar-city", characterIds: ["qin-yu", "da-ya", "li-zhan"], factionIds: ["chuanfu", "eu-zone"], summary: "巴尔城从诡异局面到兵围城破，攻坚成为北伐关键节点。", impact: "外部战线被打开，大结局前的军事目标相继完成。" },
    { id: "event-yemen", title: "落地耶门", chapterRange: range(2690, 2698, "第二六九七章至第二六九八章"), locationId: "yemen", characterIds: ["qin-yu", "xiang-zehao"], factionIds: ["military-intel", "eu-zone"], summary: "秦禹相关力量落地耶门，谈判和拒绝让局势继续紧绷。", impact: "战争后的外交和外部选择并没有立刻结束。" },
    { id: "event-final-charge", title: "再赴战场", chapterRange: range(2697, 2743, "第二七零四章至第二七五零章"), locationId: "red-dan", characterIds: ["xiang-zehao", "li-zhan", "xu-yan"], factionIds: ["chuanfu", "military-intel"], summary: "决战前夕再赴战场，最后冲锋中有人牺牲，有人完成使命。", impact: "个人命运和国族叙事在终局汇合。" },
    { id: "event-spring", title: "春暖花开", chapterRange: range(2743, 2743, "第二七五零章后尾声"), locationId: "ninth-district", characterIds: ["qin-yu", "lin-nianlei", "qi-lin", "lao-mao"], factionIds: ["chuanfu"], summary: "硝烟之后，故事以春暖花开的意象收束。", impact: "乱世中的牺牲和坚持最终回到人的生活。" }
  ],
  relationships: [
    { id: "rel-qin-qi", source: "qin-yu", target: "qi-lin", kind: "brotherhood", label: "生死兄弟", summary: "齐麟从早期患难一路跟随秦禹，是底层互信最深的兄弟线。", arcIds: ["arc-survival-entry", "arc-wu-tianyin"] },
    { id: "rel-qin-cat", source: "qin-yu", target: "lao-mao", kind: "brotherhood", label: "搭档兄弟", summary: "老猫用圆滑和义气补足秦禹的锋利，两人共同撑起早期警务线。", arcIds: ["arc-survival-entry", "arc-black-street"] },
    { id: "rel-qin-ma2", source: "qin-yu", target: "ma-lao-er", kind: "ally", label: "黑街盟友", summary: "马老二帮助秦禹进入黑街规则，也在多次行动中互相借力。", arcIds: ["arc-black-street", "arc-trade-routes"] },
    { id: "rel-qin-yuan", source: "qin-yu", target: "yuan-ke", kind: "enemy", label: "早期死敌", summary: "袁克是秦禹前期最明确的敌人，二人的冲突以待规划区终局收束。", arcIds: ["arc-black-street", "arc-wu-tianyin"] },
    { id: "rel-qin-lin", source: "qin-yu", target: "lin-nianlei", kind: "romance", label: "情感牵引", summary: "林念蕾代表秦禹在权谋和战争之外仍然珍惜的私人生活。", arcIds: ["arc-pharma-layout", "arc-spring"] },
    { id: "rel-qin-wudi", source: "qin-yu", target: "wu-di", kind: "political", label: "政治互借", summary: "吴迪与秦禹互相借势，既有人情也有清醒的利益计算。", arcIds: ["arc-pharma-layout", "arc-nine-eight-politics"] },
    { id: "rel-qin-guyan", source: "qin-yu", target: "gu-yan", kind: "ally", label: "军政盟友", summary: "顾言背后的资源让秦禹接触更高层级的军事政治。", arcIds: ["arc-nanhu-changji", "arc-nine-eight-politics"] },
    { id: "rel-qin-keke", source: "qin-yu", target: "ke-ke", kind: "ally", label: "战略搭档", summary: "可可多次从资源和布局角度补足秦禹，是川府阶段的重要智力支持。", arcIds: ["arc-pharma-layout", "arc-border-rescue"] },
    { id: "rel-qin-dong", source: "qin-yu", target: "lin-chengdong", kind: "ally", label: "交易线伙伴", summary: "林成栋参与秦禹的交易与资源网络，帮助松江线向外延伸。", arcIds: ["arc-trade-routes"] },
    { id: "rel-qin-zhan", source: "qin-yu", target: "zhan-nan", kind: "ally", label: "行动伙伴", summary: "展楠多次参与具体行动，是秦禹处理灰色事务的可靠人手。", arcIds: ["arc-trade-routes"] },
    { id: "rel-qin-fu", source: "qin-yu", target: "fu-xiaohao", kind: "ally", label: "案件线帮手", summary: "付小豪牵动前期案件和上供线索，帮助秦禹看见更深犯罪链。", arcIds: ["arc-fengbei-crime"] },
    { id: "rel-qin-lizhan", source: "qin-yu", target: "li-zhan", kind: "ally", label: "战场利刃", summary: "历战在军事和营救行动中承担硬突破角色。", arcIds: ["arc-border-rescue", "arc-spring"] },
    { id: "rel-qin-daya", source: "qin-yu", target: "da-ya", kind: "ally", label: "军事骨干", summary: "大牙的军事才能在川府阶段被不断运作和放大。", arcIds: ["arc-chuanfu-rising", "arc-final-war"] },
    { id: "rel-qin-wutianyin", source: "qin-yu", target: "wu-tianyin", kind: "ally", label: "乱世同路", summary: "吴天胤的经历极端而沉重，他和秦禹共享对底层残酷的理解。", arcIds: ["arc-wu-tianyin", "arc-trade-routes"] },
    { id: "rel-qin-fengyunian", source: "qin-yu", target: "feng-yunian", kind: "political", label: "奉北关系", summary: "冯玉年让秦禹进入奉北局面，双方关系包含扶持、试探和利益。", arcIds: ["arc-fengbei-crime"] },
    { id: "rel-qin-fengji", source: "qin-yu", target: "feng-ji", kind: "rival", label: "权力对手", summary: "冯济在后期局势中代表另一套利益选择，与秦禹多次对位。", arcIds: ["arc-nine-eight-politics", "arc-final-war"] },
    { id: "rel-qin-xiang", source: "qin-yu", target: "xiang-zehao", kind: "ally", label: "川府同盟", summary: "项择昊在川府和后期战局中承担重要军事政治角色。", arcIds: ["arc-chuanfu-rising", "arc-spring"] },
    { id: "rel-qin-meng", source: "qin-yu", target: "meng-xi", kind: "mentor", label: "识才用才", summary: "秦禹重用孟玺，把其狠辣思路转化为川府系的战术优势。", arcIds: ["arc-military-expansion", "arc-foreign-chaos"] },
    { id: "rel-qin-libokang", source: "qin-yu", target: "li-bokang", kind: "enemy", label: "终局智敌", summary: "李伯康以计划和心理战制造巨大压力，是后期最危险的智谋型对手之一。", arcIds: ["arc-foreign-chaos", "arc-final-war"] },
    { id: "rel-qin-xuyan", source: "qin-yu", target: "xu-yan", kind: "ally", label: "军情支点", summary: "许岩出现在后期军情线中，代表情报人员在暗处付出的代价。", arcIds: ["arc-foreign-chaos", "arc-spring"] },
    { id: "rel-qin-kehua", source: "qin-yu", target: "ke-hua", kind: "political", label: "外部提点", summary: "柯桦在终局前后提供提点和动作，影响北伐外围局势。", arcIds: ["arc-final-war"] },
    { id: "rel-qin-he", source: "qin-yu", target: "he-dachuan", kind: "ally", label: "草莽战友", summary: "何大川带着匪气和执行力加入川府体系，是孟玺线的重要搭档。", arcIds: ["arc-military-expansion", "arc-nine-eight-politics"] },
    { id: "rel-qin-zhou", source: "qin-yu", target: "zhou-xingli", kind: "enemy", label: "高层敌手", summary: "周兴礼代表更高层面的政治阻力，与秦禹阵营在大局上相互牵制。", arcIds: ["arc-final-war"] },
    { id: "rel-ma2-malaoye", source: "ma-lao-er", target: "ma-lao-ye", kind: "family", label: "马家传承", summary: "马老爷子提供老江湖根基，马老二承担年轻一代的冲锋。", arcIds: ["arc-black-street"] },
    { id: "rel-ma2-cat", source: "ma-lao-er", target: "lao-mao", kind: "ally", label: "黑街搭档", summary: "马老二和老猫在黑街事务中常以不同方式帮秦禹拆局。", arcIds: ["arc-black-street", "arc-trade-routes"] },
    { id: "rel-wudi-guyan", source: "wu-di", target: "gu-yan", kind: "political", label: "上层互通", summary: "吴迪和顾言分别代表不同资源入口，共同拓宽秦禹的上升空间。", arcIds: ["arc-nanhu-changji", "arc-nine-eight-politics"] },
    { id: "rel-daya-lizhan", source: "da-ya", target: "li-zhan", kind: "brotherhood", label: "战场配合", summary: "大牙和历战在军事行动中互为锋刃，承担高风险任务。", arcIds: ["arc-border-rescue", "arc-final-war"] },
    { id: "rel-meng-he", source: "meng-xi", target: "he-dachuan", kind: "ally", label: "匪首与谋士", summary: "孟玺和何大川一谋一动，把草莽力量纳入川府战局。", arcIds: ["arc-military-expansion"] },
    { id: "rel-libokang-fengji", source: "li-bokang", target: "feng-ji", kind: "political", label: "后期合谋", summary: "李伯康和冯济在后期战局中互相利用，给秦禹制造连续压力。", arcIds: ["arc-final-war"] },
    { id: "rel-xiang-guyan", source: "xiang-zehao", target: "gu-yan", kind: "ally", label: "军政协同", summary: "项择昊和顾言共同支撑秦禹后期在军政层面的协同。", arcIds: ["arc-chuanfu-rising", "arc-spring"] }
  ],
  characters: [
    character({ id: "qin-yu", name: "秦禹", aliases: ["秦老黑", "禹少"], factionIds: ["songjiang-police", "black-street", "chuanfu"], firstSeen: range(1, 2, "序章至第一章"), role: "主角，川府系核心", profile: "从待规划区走出的青年，凭狠劲、判断力和组织能力不断向上。", story: "他先在松江警务和黑街之间求生，随后经营交易线、进入奉北和南沪棋局，最终在川府建立自己的军事政治力量。", traits: ["冷静", "能忍", "重情义", "善于借势"], locationIds: ["planning-zone", "ninth-district", "songjiang", "chuanfu", "nanhu", "bar-city"] }),
    character({ id: "qi-lin", name: "齐麟", aliases: ["麒麟"], factionIds: ["songjiang-police", "chuanfu"], firstSeen: range(1, 37, "序章至第三十六章"), role: "秦禹早期兄弟", profile: "从艰难处境中被逼着成长的伙伴，和秦禹有很深的患难基础。", story: "齐麟早期在松江线中经历失去和转变，之后成为秦禹阵营中值得托付的人。", traits: ["忠诚", "坚韧", "敏感"], locationIds: ["songjiang", "ninth-district"] }),
    character({ id: "lao-mao", name: "老猫", aliases: ["猫哥"], factionIds: ["songjiang-police", "black-street"], firstSeen: range(7, 40, "第七章至第四十章"), role: "警务搭档，兄弟线核心", profile: "圆滑、会做人，也能在关键时刻顶上去。", story: "老猫陪秦禹走过松江和黑街早期乱局，用人情和经验弥补秦禹的锋芒。", traits: ["圆滑", "义气", "机敏"], locationIds: ["songjiang", "black-street"] }),
    character({ id: "ma-lao-er", name: "马老二", aliases: ["二哥"], factionIds: ["ma-family", "black-street"], firstSeen: range(75, 76, "第七十五章至第七十六章"), role: "马家年轻一代", profile: "黑街中的奇人，讲面子也敢下狠手。", story: "他和秦禹从互相试探到结盟，帮助秦禹理解并使用地下规则。", traits: ["豪横", "讲义气", "会办事"], locationIds: ["black-street", "jiangzhou"] }),
    character({ id: "ma-lao-ye", name: "马老爷子", aliases: ["马老"], factionIds: ["ma-family"], firstSeen: range(14, 15, "第十四章"), role: "老江湖", profile: "马家的根基人物，代表旧江湖的经验和分量。", story: "他在早期为马家和秦禹关系提供底色，使黑街线不只是年轻人的斗狠。", traits: ["老辣", "稳重"], locationIds: ["black-street"] }),
    character({ id: "yuan-ke", name: "袁克", aliases: [], factionIds: ["yuan-family"], firstSeen: range(40, 41, "第四十章"), role: "前期主要敌手", profile: "依托家族和资源压迫秦禹，是松江早期冲突的核心反派。", story: "袁克多次设局、施压和反扑，最终在待规划区迎来结局。", traits: ["阴狠", "自负", "资源充足"], locationIds: ["songjiang", "planning-zone"] }),
    character({ id: "li-fugui", name: "李富贵", aliases: [], factionIds: ["planned-zone"], firstSeen: range(2, 3, "第二章至第三章"), role: "早期身份交易相关人物", profile: "连接待规划区和九区身份生意的小人物。", story: "他帮助展示身份、钱和生存机会如何在灾变后变成商品。", traits: ["市侩", "现实"], locationIds: ["planning-zone", "ninth-district"] }),
    character({ id: "lin-nianlei", name: "林念蕾", aliases: [], factionIds: ["wu-line", "chuanfu"], firstSeen: range(1121, 1205, "第一一二六章至第一二零五章"), role: "秦禹情感线重要人物", profile: "她把秦禹从战争和权谋中拉回私人情感。", story: "林念蕾在中后期与秦禹关系加深，是乱世中少数稳定的情感牵引。", traits: ["清醒", "温柔", "有主见"], locationIds: ["fengbei", "ninth-district"] }),
    character({ id: "wu-di", name: "吴迪", aliases: [], factionIds: ["wu-line"], firstSeen: range(608, 608, "第六零八章"), role: "政治资源入口", profile: "有谋略和现实判断的上层人物。", story: "吴迪多次表态或运作，为秦禹打开更高层级的局面。", traits: ["理性", "精明", "懂权衡"], locationIds: ["fengbei", "nanhu"] }),
    character({ id: "gu-yan", name: "顾言", aliases: [], factionIds: ["gu-line"], firstSeen: range(760, 760, "第七六零章"), role: "军政盟友", profile: "名字本身就有分量，背后牵动更大的资源。", story: "顾言在秦禹进入军政层面后成为重要盟友，影响长吉、八区和后期战局。", traits: ["有背景", "果断", "讲合作"], locationIds: ["changji", "eight-zone"] }),
    character({ id: "ke-ke", name: "可可", aliases: [], factionIds: ["chuanfu", "wu-line"], firstSeen: range(436, 436, "第四三六章"), role: "资源和布局型伙伴", profile: "善于从利益、机会和风险中找到突破口。", story: "可可在药业、川府和边境阶段多次提供关键判断，是秦禹阵营的智力支点。", traits: ["敏锐", "务实", "敢布局"], locationIds: ["fengbei", "chuanfu", "old-triangle"] }),
    character({ id: "lin-chengdong", name: "林成栋", aliases: [], factionIds: ["black-street"], firstSeen: range(649, 649, "第六四九章"), role: "交易线伙伴", profile: "中庸谨慎，但能在交易和资源网络中发挥作用。", story: "林成栋参与秦禹的货路和交易线，让松江利益网络更稳定。", traits: ["谨慎", "务实"], locationIds: ["songjiang", "jiangzhou"] }),
    character({ id: "zhan-nan", name: "展楠", aliases: [], factionIds: ["songjiang-police", "black-street"], firstSeen: range(655, 655, "第六五五章"), role: "行动人员", profile: "能在灰色事务中压住局面的人。", story: "展楠参与交易线和街面事务，承担秦禹阵营中的执行角色。", traits: ["强硬", "可靠"], locationIds: ["songjiang"] }),
    character({ id: "fu-xiaohao", name: "付小豪", aliases: [], factionIds: ["songjiang-police"], firstSeen: range(238, 239, "第二三八章"), role: "案件线人物", profile: "前期案件和利益输送线中的关键人。", story: "付小豪让秦禹接触到更深的犯罪链条，也推动奉北前后的变化。", traits: ["机灵", "现实"], locationIds: ["songjiang", "fengbei"] }),
    character({ id: "li-zhan", name: "历战", aliases: [], factionIds: ["chuanfu", "military-intel"], firstSeen: range(555, 555, "第五五五章"), role: "战场尖刀", profile: "能打硬仗、敢接高危任务的军事骨干。", story: "历战从中期行动到最终战场不断承担高风险任务，是秦禹阵营的锋刃。", traits: ["勇猛", "直接", "抗压"], locationIds: ["seven-zone", "old-triangle", "red-dan"] }),
    character({ id: "da-ya", name: "大牙", aliases: [], factionIds: ["chuanfu"], firstSeen: range(257, 258, "第二五七章"), role: "军事指挥和骨干", profile: "从早期来电到后期军事才能被运作，是川府战场线重要人物。", story: "大牙在川府扩军和北伐阶段不断被推到前台，承担从战术到指挥的职责。", traits: ["能打", "会带兵", "忠诚"], locationIds: ["chuanfu", "bar-city", "red-dan"] }),
    character({ id: "wu-tianyin", name: "吴天胤", aliases: ["胤哥"], factionIds: ["planned-zone", "black-street"], firstSeen: range(481, 481, "第四八一章"), role: "极端乱世人物", profile: "被时代和亲情逼到极端的人物。", story: "吴天胤的线展示底层人在失去退路后的爆发，也让秦禹重新审视规则。", traits: ["狠", "孤独", "重情"], locationIds: ["songjiang", "jiangzhou"] }),
    character({ id: "feng-yunian", name: "冯玉年", aliases: ["老冯"], factionIds: ["feng-line"], firstSeen: range(383, 383, "第三八三章"), role: "奉北线人物", profile: "身处奉北权力圈，懂得用规则和人情支招。", story: "冯玉年让秦禹更深入接触奉北上层，也体现政治保护伞的重要性。", traits: ["老练", "会支招"], locationIds: ["fengbei"] }),
    character({ id: "feng-ji", name: "冯济", aliases: [], factionIds: ["feng-line"], firstSeen: range(2070, 2074, "第二零七四章"), role: "后期政治对手", profile: "在后期局势中不断寻找自身处境和利益出口。", story: "冯济的选择多次影响八区、九区和最终战局，是秦禹后期必须处理的对手。", traits: ["精明", "摇摆", "重利益"], locationIds: ["eight-zone", "nanhu"] }),
    character({ id: "xiang-zehao", name: "项择昊", aliases: [], factionIds: ["chuanfu", "gu-line"], firstSeen: range(1560, 1565, "第一五六五章"), role: "川府军事政治人物", profile: "在川府和最终战局中承担重要军事角色。", story: "项择昊从面见秦禹到最终请战，体现川府系内部的担当和战场选择。", traits: ["坚定", "有担当"], locationIds: ["chuanfu", "red-dan", "yemen"] }),
    character({ id: "meng-xi", name: "孟玺", aliases: [], factionIds: ["chuanfu"], firstSeen: range(1815, 1820, "第一八二零章"), role: "川府谋士", profile: "心黑手狠，善于把复杂局面拆成可执行的狠招。", story: "孟玺进入秦禹视野后，多次进谏和布局，帮助川府系在后期战争中占据主动。", traits: ["狠辣", "聪明", "敢赌"], locationIds: ["chuanfu", "old-triangle", "jiangzhou"] }),
    character({ id: "li-bokang", name: "李伯康", aliases: [], factionIds: ["feng-line", "military-intel"], firstSeen: range(2279, 2284, "第二二八四章"), role: "后期智谋型对手", profile: "幕后操盘能力强，计划细密，能制造持续心理压力。", story: "李伯康的蓝图、计划和后期疲态构成终局前最强的智谋对抗线。", traits: ["缜密", "阴狠", "擅长心理战"], locationIds: ["nanhu", "old-triangle"] }),
    character({ id: "xu-yan", name: "许岩", aliases: ["老许"], factionIds: ["military-intel"], firstSeen: range(2646, 2653, "第二六四六章至第二六五三章"), role: "军情线人物", profile: "后期军情和暗线行动中的重要支点。", story: "许岩在最终阶段承担情报和行动压力，他的出现让暗战代价更具体。", traits: ["沉稳", "隐忍", "可靠"], locationIds: ["old-triangle", "red-dan"] }),
    character({ id: "ke-hua", name: "柯桦", aliases: [], factionIds: ["military-intel", "eu-zone"], firstSeen: range(2647, 2654, "第二六五四章"), role: "终局外部推手", profile: "在北伐前后提供提点并参与抢人等关键动作。", story: "柯桦推动最终阶段的外围变化，让战局在细节上出现转折。", traits: ["敏锐", "果断"], locationIds: ["bar-city", "eu-first-zone"] }),
    character({ id: "he-dachuan", name: "何大川", aliases: [], factionIds: ["chuanfu"], firstSeen: range(1815, 1820, "第一八二零章"), role: "草莽军事力量", profile: "带有匪气的执行者，能把孟玺的想法落到行动里。", story: "何大川在川府后期与孟玺共同形成草莽和谋略结合的支线。", traits: ["粗粝", "敢打", "执行力强"], locationIds: ["chuanfu", "old-triangle"] }),
    character({ id: "zhou-xingli", name: "周兴礼", aliases: ["老周"], factionIds: ["feng-line"], firstSeen: range(2700, 2727, "第二七零七章至第二七二七章"), role: "终局高层对手", profile: "后期棋局中以高层政治手段落子的对手。", story: "周兴礼在最终阶段以政治手段影响战场，体现乱世高层博弈的冷酷。", traits: ["老辣", "冷静", "善落子"], locationIds: ["red-dan", "eight-zone"] })
  ],
  themes: [
    {
      id: "theme-order",
      title: "秩序是废墟里长出来的",
      insight: "灾变没收了文明，却没有取消人对秩序的渴望。",
      detail: "从待规划区的丛林法则到第九特区的身份与配给，秩序不是天降的恩赐，而是被一群普通人用交易、规则和暴力一点点重新立起来的。它脆弱、肮脏、充满妥协，却是乱世里唯一能让人喘口气的东西。它提醒我们：稳定从来不是理所当然，而是有人在替你扛着。",
      anchor: "arc-survival-entry"
    },
    {
      id: "theme-choice",
      title: "人是被选择塑造的",
      insight: "时代给的是处境，命运由一次次选择写成。",
      detail: "秦禹没有主角光环，他只是比别人更早想清楚：要什么、肯付什么代价。同样的乱世，有人沦为人口贩子，有人成了护着兄弟的刀。小说反复把人推到岔路口，告诉你环境会限制选项，但按下哪一个，始终是你自己的手。",
      anchor: "arc-black-street"
    },
    {
      id: "theme-bottom",
      title: "底层不是背景板",
      insight: "每一个微不足道的人，都有自己要拼命守住的东西。",
      detail: "卖身求活的女人、断后惨死的阿宏、被亲情逼到极端的吴天胤，他们不是推动情节的工具，而是这个世界真实的重量。作者让我们看见：当资源稀缺到极限，尊严会变得昂贵，但仍有人愿意为它付账。读懂他们，才读懂这部书的悲悯。",
      anchor: "arc-wu-tianyin"
    },
    {
      id: "theme-power",
      title: "权力是有利息的借款",
      insight: "每一份向上爬的力量，都在背面记着要还的账。",
      detail: "从黑街码牌到川府十万军，秦禹的每一次壮大都伴随责任、敌人和无法回头的代价。权力让他能保护更多人，也让他离最初那个只想带兄弟吃口饱饭的少年越来越远。小说没有美化权力，而是冷静地算清它的利息：你掌控得越多，能自由选择的就越少。",
      anchor: "arc-chuanfu-rising"
    },
    {
      id: "theme-brotherhood",
      title: "义气是乱世的硬通货",
      insight: "信任比金钱更稀缺，也比金钱更值钱。",
      detail: "齐麟、老猫、马老二，这些名字撑起了秦禹冰冷算计之外的体温。在一个人人自保的世界里，愿意替你守夜、替你断后的人，才是真正的资产。但小说也不天真：义气会被利益考验，会被背叛刺穿，正因如此，那些始终没散的关系才格外动人。",
      anchor: "arc-trade-routes"
    },
    {
      id: "theme-spring",
      title: "向着春暖花开走",
      insight: "所有的厮杀，最终都是为了有人能好好活着。",
      detail: "故事以血与火铺路，却以春暖花开收束。打了近四十年的仗，赢来的不是更大的权力，而是让普通人重新过上能种花、能等天亮的日子。它留给读者的启发或许是：宏大的胜利只有落回一个个具体的人身上，才算真正有意义。",
      anchor: "arc-spring"
    }
  ]
};

export const ninthDistrict: NovelDataset = {
  ...rawNinthDistrict,
  locations: rawNinthDistrict.locations.map((location) => ({
    ...location,
    mapPrompt: buildMapPrompt(location)
  })),
  characters: rawNinthDistrict.characters.map((item) => ({
    ...item,
    imagePrompt: buildCharacterPrompt(item)
  }))
};
