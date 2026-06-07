import type { Character, LocationNode, NovelDataset } from "../types/novel";

const range = (startOrder: number, endOrder: number, label: string) => ({
  startOrder,
  endOrder,
  label
});

type CharacterInput = Omit<Character, "imagePrompt" | "appearance" | "relationshipIds" | "tier"> & {
  tier?: "main" | "supporting";
};

const buildMapPrompt = (location: Omit<LocationNode, "mapPrompt" | "scene">, scene: string) =>
  `${location.name}区域街道风貌画面生成提示词：${location.summary}${location.atmosphere} 区域特征：${scene} 世界观为灾变后的冰封极寒末世（资源紧张、气候严寒、常年积雪），但各区域的秩序与风貌差异明显，不必一律破败：有的繁华体面、有的肃整有序、有的才真正混乱荒废。请按该区域的特征刻画其独特街区轮廓与空间层次。写实电影质感、低饱和冷色调、阴天或夜晚、地面常见积雪或潮湿反光，无文字、无人物特写、16:9。`;

const buildCharacterPrompt = (
  character: Omit<Character, "relationshipIds" | "imagePrompt" | "appearance">,
  appearance: string
) =>
  `${character.name}，第九特区人物形象设定图，身份是${character.role}，气质体现${character.traits.join("、")}。外貌·神态·服装：${appearance} 世界观为灾变后的冰封极寒末世、资源匮乏；采用小说角色立绘风格、半写实数字插画/概念美术，偏插画质感而非真人照片；低饱和冷色调、电影感侧光、半身像、背景为阴冷潮湿的破败城区虚化氛围，无文字、竖版。负面：真人摄影、照片写实、3D渲染真人脸、糖水色、Q版卡通、与人物性格不符的干净光鲜。`;

const appearances: Record<string, string> = {
  "qin-yu":
    "身材高大壮硕的青年，本是眉目清俊，却因常年算计与厮杀而眼神锐利沉稳、不怒自威；利落短发、下颌带风霜；身着深色耐磨长风衣、内搭高领，整体克制冷硬，嘴角偶有一丝难以察觉的笑意。",
  "qi-lin":
    "瘦削的年轻人，眉宇间是隐忍与倔强，眼神带着过早成熟的疲惫与警惕；乱短发，颈上厚围巾、身穿洗旧的夹克，手背有冻裂的痕迹，神态略显紧绷。",
  "lao-mao":
    "圆脸、面带市井圆滑笑意的中年男人，眼神活络机灵；松垮的旧皮夹克配围巾，叼着或夹着烟的随意姿态，透着一股能在街面上吃得开的油滑。",
  "ma-lao-er":
    "体格壮硕、面相凶悍带江湖气的男人，短须或络腮，眉眼带狠、笑起来却很张扬；黑色皮衣或厚呢大衣、戴金属配饰，姿态豪横霸道。",
  "ma-lao-ye":
    "年长的老江湖，花白头发、皱纹深刻，眼神老辣沉静、不动声色；身着厚实的中式棉袄或长呢衣，背手而立，神态威严稳重。",
  "yuan-ke":
    "衣着考究体面的反派，呢大衣配皮手套、发型整齐油亮；面相阴鸷、嘴角带轻蔑，眼神倨傲冷漠，透着资源在手的傲慢。",
  "li-fugui":
    "市侩现实的中年小人物，身形偏矮或瘦小，穿不合身的旧西装与棉服；脸上堆着算计的谄媚笑，搓着手，眼神滴溜乱转。",
  "lin-nianlei":
    "清秀沉静的年轻女性，眼神温柔却有主见；长发束起、几缕散落，身着素净保暖的针织衫或呢大衣，神态从容温和，带一点疏离。",
  "wu-di":
    "干练的青年男性，深色大衣或合体西装；面相精明、眼神含权衡，神态沉稳内敛，举手投足都是上层人的分寸。",
  "gu-yan":
    "气场强硬、带军政气质的男人，身着挺括的深色军政风大衣；面相端正冷峻、眼神果断，站姿笔直，自带压迫感。",
  "ke-ke":
    "二十出头的明艳女子，本名于瑾年、小名可可；一头披肩长发、红唇大眼，眉宇间既有少女的俏皮又有商场上的精明锋芒。身着剪裁利落的呢绒长风衣、过膝长靴，身段妖娆而气场从容；神态聪慧沉着，似笑非笑间藏着算计与决断，是子承父业、白手做到药业集团一把手的女强人。",
  "lin-chengdong":
    "稳重低调的中年男人，穿普通的深色外套；面相温吞谨慎、眼神不张扬，神态内敛务实，不起眼却可靠。",
  "zhan-nan":
    "壮实硬朗的行动派，短发、面相方正；身着战术夹克与多口袋装备，眼神强硬专注，神态干脆利落。",
  "fu-xiaohao":
    "机灵的年轻人，眼神滑溜活络；一身街头风的旧夹克、帽衫，姿态轻佻，透着混迹案件线的精明与现实。",
  "li-zhan":
    "体格强健的战场尖刀，寸头、脸上带旧伤疤；穿旧军装或战术装备，眼神凶悍冷硬、神态如出鞘的刀，肌肉与杀气分明。",
  "da-ya":
    "壮硕憨直的军中骨干，咧嘴时露出标志性的大牙、笑容豪爽；一身军绿战术服，眼神勇猛直率，透着能打能带兵的草莽劲。",
  "wu-tianyin":
    "偏瘦、眼神阴郁孤狠的男人，面带疲惫与决绝；身披破旧风衣，被亲情与时代逼到极端，神态孤独而狠厉。",
  "feng-yunian":
    "满头白发、身形清瘦却脊背挺直的老人，面容沟壑纵横、眼神刚正不阿；身着洗得发白的旧军大衣，手握一杆捡来的自动步枪，独立在北风口的风雪战场上，神态决绝而坦荡，是位至死不肯低头、无名而悲壮的老兵。",
  "feng-ji":
    "衣着体面的中年政客，面相精明却带犹疑；眼神在利益间摇摆算计，神态谨慎，透着进退两难的处境感。",
  "xiang-zehao":
    "端正刚毅的军政人物，挺括的军装大衣；面相坚毅、眼神坚定担当，站姿挺拔，是肯请战、扛事的那种人。",
  "meng-xi":
    "清瘦、面相阴鸷而精明的谋士，眼神带着算计的笑意；一身利落的深色衣装，神态狠辣聪明，像把复杂棋局拆成狠招的人。",
  "li-bokang":
    "外表儒雅、内里阴狠的中年对手，考究的深色大衣；眼神深沉缜密、不露声色，神态从容却令人压抑，擅长心理战。",
  "xu-yan":
    "精悍利落的男人，早年在黑街看管赌档、卖肉店，后成长为秦禹麾下的突袭尖刀；利落短发、面相精明带几分江湖狠气，眼神冷静果决；身着深色战术夹克或旧军装，神态沉着干练，是能带队从楼梯间杀进包厢、一梭子扫平对手的狠角色。",
  "ke-hua":
    "干练、带外部势力气质的人物，冷色制服或风衣；面相敏锐、眼神果断锐利，神态利落，透着终局推手的算计。",
  "he-dachuan":
    "粗豪壮实、满脸匪气与胡茬的草莽汉子；穿杂凑的旧军装，眼神凶悍直接、神态粗粝，是把谋士想法砸成行动的那种猛人。",
  "zhou-xingli":
    "年长威严的高层人物，挺括的军政大衣；面相沉静老辣、眼神深不可测，神态从容落子，气场压人。",
  "xiao-qi":
    "退伍军人气质的精悍男人，寸头、面相冷硬沉默，眼神锐利如猎手；身着低调的深色夹克或战术外套、随身带着狙击枪，神态镇定克制，是那种话不多却枪法致命的老兵。",
  "lao-li":
    "留着八字胡、精明老练的中年警务长官，面相沉稳、眼神里全是阅历与算计；身着挺括的深色警务制服或大衣，神态从容不迫，是那种笑眯眯却谁都算计不过的老狐狸。",
  "ye-zixiao":
    "梳着利落马尾、气场阴冷的黑道枭雄，面相棱角分明、眼神狠厉而从容；身着黑色皮夹克或风衣，舔唇浅笑间透着杀伐果断，是那种步伐不疾不徐却令人胆寒的狠角色。",
  "liuzi-shu":
    "面带刀疤却气质沉稳的江湖老者，相貌粗硬、眼神温厚内敛；身着朴实的深色外套，背微躬、声音浑厚，是那种看着凶、相处却极稳重可靠的马家老臣。",
  "xiao-bai":
    "土渣街混出来的年轻狠角，剃着扎眼的寸头、面相桀骜不驯，眼神里全是街头的狠劲；身着街头风的皮夹克或运动服，姿态张扬挑衅，是那种一言不合就动刀、谁都不放在眼里的悍勇小兄弟。",
  "ye-lin":
    "气质出众、眉目清明的成熟女性，妆容利落、神态从容自信；身着剪裁考究的旗袍或职业风衣，举手投足都是风月场与商场历练出的分寸感，是那种笑意得体却让人不敢小看的当家老板娘。"
};

const character = (item: CharacterInput): Omit<Character, "imagePrompt" | "appearance" | "relationshipIds"> => ({
  ...item,
  tier: item.tier ?? "main"
});

const locationScenes: Record<string, string> = {
  "planning-zone":
    "无政府的边缘废土，秦禹与吴天胤等人挣命的起点：残破公路、锈蚀残骸、人口贩子与零散棚户散落在冰封荒原上；这里几乎没有秩序，买卖人命、丛林法则横行，是最典型、最荒凉的灾后废墟。",
  "ninth-district":
    "九区·东城，相对成型、有秩序的特区门户：高大壁垒、检查站与配给点环绕，凭身份和粮票才能立足；街道冷硬却运转有序、岗哨规整，比区外废土体面太多，是无数人挤破头想进来的‘里面’。",
  "songjiang":
    "一区·松江，秦禹扎根的特区核心都市：老旧高楼与立交天桥层叠、招牌与霓虹密集、地面终年湿滑反光；警务、黑街与政治利益在同一条街上交织，明面秩序之下是码牌、交易与枪声的地下暗流。",
  "black-street":
    "松江的黑街灰色地带，秦禹、老猫与马家厮混之处：密集的旧街、饭馆、码牌赌档与窄巷半明半暗交错，饭局上谈生意、桌底下见血，人情、义气与暴力在这里混作一团，市井气最浓。",
  "tuzha-street":
    "土渣街，松江最底层的棚户旧街：铁皮、集装箱与临时摊档紧贴，巷子狭窄泥泞、一步错就会被吞掉；贫困拥挤、龙蛇混杂，是秦禹切入地下规则、踩着三哥往上爬的起步之地。",
  "jiangzhou":
    "江州，以商路与家族为底色的繁华城市：老字号、码头与会馆林立，李家等家族与江湖规矩盘根错节；街上车马熙攘、生意往来不断，并不破败，反而是难得热闹体面的商埠。",
  "fengbei":
    "奉北，权力圈层云集之地：街面规整、官味厚重，办公楼、会所与岗哨密布；表面规矩森严，背地里却是圈子、人情与棋局密织，秦禹屡屡被卷入其中的上层博弈场。",
  "changji":
    "四区·川北一线的长吉，军事色彩渐重的城市：检查站、驻防营地与运输线交错，‘马踏长吉’的硝烟未远；街区紧绷肃杀，是故事从江湖斗争转入成建制战争的拐点。",
  "nanhu":
    "二区·南沪，南方财阀与政治的光鲜舞台：会所、写字楼与霓虹气派现代，巨头、智囊与派系在此云集；街景繁华体面，光鲜表面下却是智谋暗战与炮火随时引爆的暗流。",
  "chuanfu":
    "川府·川府城，秦禹真正立足的后方根据地：百万亩粮仓、生活镇与连片军营，秩序在这里重新落地；街镇相对安稳、有炊烟与人气，是与区外废土截然不同的‘家底’所在。",
  "five-zone":
    "五区·川南基地，妖魔鬼怪齐聚的外部区域：势力混杂、街面鱼龙混杂，灰色而繁忙；在边境与外交压力下，这里既做着各路生意，也潜伏着随时翻脸的暗战。",
  "seven-zone":
    "七区·南境城，边境驻防色彩浓重的区域：驻防团、工事与铁丝网层层环绕，奔袭与拉锯不断；街区终年紧绷，冲突随时可能在街口骤然升级。",
  "eight-zone":
    "八区·边境线，军政气息浓厚的辖区：街面相对规整肃整，高层会议与军事压力在此交汇；秩序之中暗藏张力，是牵动九区与川府政治平衡的关键落子之处。",
  "eu-first-zone":
    "海外·欧盟一区，外部强权的代表区域：规则不同、相对现代有序，建筑与街道整洁而陌生；欧系装甲与谈判威慑并存，冷硬疏离，是把战争推向更大尺度的外部压力源。",
  "old-triangle":
    "老三角·贸星枢纽，潮湿混乱的边境三角地带：临时阵线、铁丝网与营地犬牙交错，泥泞而紧张；各方势力在此短兵相接，是后期军情与战场反复绞杀的灰色战区。",
  "bar-city":
    "巴尔城，北伐攻坚的城市战场：断壁残垣、弹坑与焦痕遍布，街道被炮火犁过；从诡异对峙到兵围城破，围城与巷战的硝烟是大结局前最惨烈的一幕。",
  "yemen":
    "耶门，远离故土的海外落点：异域街景与私人武装据点交错，陌生、戒备而临时；人在他乡，却仍被华区终局战事牢牢牵动，带着浓重的外乡疏离感。",
  "red-dan":
    "红丹战场，最终决战的象征性焦土：残骸与未熄的火光中满目疮痍；这里是北伐之后最后冲锋与牺牲的惨烈之地，国仇家恨在此集中爆发。",
  "liu-zone":
    "六区·北境堡垒，扼守北线的军事重镇：高墙、哨塔与连营依雪原而立，寒气逼人；这里肃整而戒备森严，是抵御外敌、控扼北方通道的边境堡垒。",
  "beifengkou":
    "北风口·莆汾哨站，反复拉锯的前沿火线：‘北风口炮声阵阵’，前沿小队在凛冽寒风中往来出没；哨站简陋、炮火不断，是直面外敌、出生入死的一线阵地。",
  "zangyuan":
    "藏源·垒山要塞，依山而建的物资枢纽：壁垒森严、扼守内陆通道，囤积着粮秣与军械；它是后方屯粮聚兵、支撑前线的命脉所在。",
  "yandao":
    "盐岛·盐业站，盛产盐与资源的海岛据点：盐场、码头与守军沿海岸铺开，海风咸冷；‘川军插旗、鲸吞盐岛’后，这里成为川府系重要的资源与财源。",
  "xiadao":
    "夏岛，全图最东端的远海孤岛：孤悬海外、人迹稀少，远离主战场；它是世界版图的边缘落点，苍茫海雾中透着被遗忘的荒寂。"
};

const rawNinthDistrict: Omit<NovelDataset, "locations" | "characters"> & {
  locations: Array<Omit<LocationNode, "mapPrompt" | "scene">>;
  characters: Array<Omit<Character, "imagePrompt" | "appearance" | "relationshipIds">>;
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
    { id: "feng-line", name: "冯系", summary: "冯玉年、冯济等冯家势力，贯穿权谋与战局转换；后期联合卢家、贺家勾结欧盟攻打北风口、出卖地区利益，最终被秦禹一方围剿崩盘。", color: "#7d5b45" },
    { id: "chen-line", name: "陈系", summary: "南沪和外部政治博弈中的重要一方，与川府阶段产生多次交集。", color: "#476e73" },
    { id: "eu-zone", name: "欧盟一区力量", summary: "后期外部战局的重要压力来源，推动战争从区域冲突走向国际化。", color: "#576f9e" },
    { id: "military-intel", name: "军情系统", summary: "后期暗战、潜入、营救和心理战的关键力量。", color: "#a27c61" }
  ],
  locations: [
    { id: "planning-zone", name: "待规划区", kind: "wasteland", x: 35, y: 34, summary: "秦禹出身和故事起点所在的无政府边缘地带。", atmosphere: "贫瘠、粗粝、没有稳定规则。", factionIds: ["planned-zone"], eventIds: ["event-prologue", "event-yuan-ke-end"] },
    { id: "ninth-district", name: "第九特区", kind: "district", x: 73, y: 38, summary: "九区（第九特区）：松江、奉北、长吉等城所在的核心特区，也是身份、粮食与权力的入口，与七区、八区并称三大区。", atmosphere: "秩序表面稳定，底层竞争残酷。", factionIds: ["songjiang-police", "wu-line"], eventIds: ["event-qin-enters", "event-public-order"] },
    { id: "songjiang", name: "松江", kind: "city", x: 72, y: 45, summary: "九区核心城市，秦禹早期扎根之地，警务、黑街与政治利益在此交织。", atmosphere: "城市秩序和地下秩序并行。", sceneImage: "/scenes/songjiang.webp", factionIds: ["songjiang-police", "black-street"], eventIds: ["event-police-team", "event-songjiang-return", "event-songjiang-takeover"] },
    { id: "black-street", name: "黑街", kind: "street", x: 66, y: 49, summary: "秦禹、老猫和马家频繁活动的灰色地带。", atmosphere: "饭局、码牌、枪声和人情并存。", factionIds: ["black-street", "ma-family"], eventIds: ["event-black-street", "event-ma-alliance"] },
    { id: "tuzha-street", name: "土渣街", kind: "street", x: 69, y: 53, summary: "早期冲突集中爆发的街区，秦禹从这里切入地下规则。", atmosphere: "低矮、拥挤、一步错就会被吞掉。", factionIds: ["black-street"], eventIds: ["event-tuzha-street", "event-three-parties"] },
    { id: "jiangzhou", name: "江州", kind: "city", x: 52, y: 68, summary: "七区一带的重要城市，早期江湖交易与后期乱局都反复牵动于此。", atmosphere: "商路、家族和江湖人情交错。", factionIds: ["ma-family", "black-street"], eventIds: ["event-jiangzhou", "event-jiangzhou-chaos"] },
    { id: "fengbei", name: "奉北", kind: "city", x: 75, y: 30, summary: "九区的权力圈层与警务政治重镇，秦禹多次被卷入上层棋局。", atmosphere: "表面规矩森严，背后棋局密集。", factionIds: ["wu-line", "feng-line"], eventIds: ["event-fengbei", "event-pharma"] },
    { id: "changji", name: "长吉", kind: "city", x: 66, y: 23, summary: "九区的关键城市，故事在此由江湖斗争转向军事行动。", atmosphere: "道路、驻防和突袭成为新的语言。", factionIds: ["gu-line", "chuanfu"], eventIds: ["event-changji", "event-sword-changji"] },
    { id: "nanhu", name: "南沪", kind: "city", x: 46, y: 64, summary: "七区的政治舞台，南方巨头聚集、智囊与派系交锋频繁。", atmosphere: "会所、会议和暗线共同推动局势。", factionIds: ["chen-line", "military-intel"], eventIds: ["event-nanhu", "event-nanhu-fire"] },
    { id: "chuanfu", name: "川府", kind: "frontier", x: 54, y: 41, summary: "川府特区（川府城）：紧邻八区、九区的独立特区，秦禹后期立足、扩军、建立川府系的根据地。", atmosphere: "粮仓、生活镇和军队让秩序重新落地。", factionIds: ["chuanfu"], eventIds: ["event-chuanfu-entry", "event-chuanfu-war"] },
    { id: "five-zone", name: "五区", kind: "district", x: 65, y: 82, summary: "五区：盐岛所在、妖魔鬼怪齐聚的外部区域，牵动边境与外交压力。", atmosphere: "利益更复杂，合作和背叛更快切换。", factionIds: ["eu-zone", "chen-line"], eventIds: ["event-five-zone"] },
    { id: "seven-zone", name: "七区", kind: "district", x: 56, y: 59, summary: "七区：南沪、江州所在的特区，与八区、九区并称三大区，后期奔袭与驻防团冲突频发。", atmosphere: "边境紧绷，局部冲突随时升级。", factionIds: ["military-intel"], eventIds: ["event-seven-zone-raid"] },
    { id: "eight-zone", name: "八区", kind: "district", x: 50, y: 21, summary: "八区：与七区、九区并称三大区，毗邻川府，是后期战局的关键介入者。", atmosphere: "高层会议和军事压力共同落子。", factionIds: ["gu-line", "feng-line"], eventIds: ["event-eight-zone"] },
    { id: "eu-first-zone", name: "欧盟一区", kind: "frontier", x: 6, y: 68, summary: "外部势力代表区域，推动故事进入更大尺度的冲突。", atmosphere: "规则不同，谈判和军事威慑并行。", factionIds: ["eu-zone"], eventIds: ["event-eu-zone"] },
    { id: "old-triangle", name: "老三角", kind: "frontier", x: 42, y: 37, summary: "后期目光聚集的边境地带，军情和战场压力交织。", atmosphere: "潮湿、混乱、到处是临时阵线。", factionIds: ["military-intel", "chuanfu"], eventIds: ["event-old-triangle"] },
    { id: "bar-city", name: "巴尔城", kind: "battlefield", x: 80, y: 84, summary: "北伐阶段的重要攻坚目标，城市攻防成为大结局前的焦点。", atmosphere: "炮火、围城和心理战压到极限。", factionIds: ["eu-zone", "chuanfu"], eventIds: ["event-bar-city"] },
    { id: "yemen", name: "耶门", kind: "frontier", x: 70, y: 94, summary: "结尾阶段外部谈判和再赴战场的落点之一。", atmosphere: "远离故土，却仍被华区战局牵动。", factionIds: ["military-intel", "eu-zone"], eventIds: ["event-yemen"] },
    { id: "red-dan", name: "红丹战场", kind: "battlefield", x: 64, y: 73, summary: "最终决战附近的象征性战场，承接北伐后的最后冲锋。", atmosphere: "疲惫、牺牲和最后的国仇家恨集中爆发。", factionIds: ["chuanfu", "military-intel"], eventIds: ["event-final-charge"] },
    { id: "liu-zone", name: "六区·北境堡垒", kind: "frontier", x: 54, y: 8, summary: "北方边境的堡垒辖区，是抵御外敌与控扼北线的军事重镇。", atmosphere: "高墙、哨塔与驻军，肃整而戒备森严。", factionIds: ["gu-line", "military-intel"], eventIds: [] },
    { id: "beifengkou", name: "北风口·莆汾哨站", kind: "battlefield", x: 34, y: 19, summary: "北风口一带的前沿哨站，炮声阵阵、小队往来，是反复拉锯的火线。", atmosphere: "寒风呼啸、炮火不断，前沿小队在此出生入死。", factionIds: ["chuanfu", "military-intel"], eventIds: [] },
    { id: "zangyuan", name: "藏源·垒山要塞", kind: "frontier", x: 39, y: 63, summary: "依山而建的要塞与物资枢纽，扼守内陆通道，是后方的屯粮聚兵之地。", atmosphere: "依山而立、壁垒森严，囤积着粮秣与军械。", factionIds: ["chuanfu"], eventIds: [] },
    { id: "yandao", name: "盐岛·盐业站", kind: "frontier", x: 73, y: 91, summary: "五区辖下盛产盐与资源的海岛据点，后期被川军一举插旗、鲸吞收编。", atmosphere: "盐场、码头与守军，海风咸冷、资源是这里的命脉。", factionIds: ["chuanfu", "chen-line"], eventIds: ["event-salt-island"] },
    { id: "xiadao", name: "夏岛", kind: "frontier", x: 95, y: 51, summary: "全图最东端的远海岛屿，孤悬海外、远离主战场的边陲之地。", atmosphere: "孤悬海上、人迹稀少，是世界边缘的最后落点。", factionIds: ["eu-zone"], eventIds: [] }
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
    { id: "event-salt-island", title: "川军插旗盐岛", chapterRange: range(1997, 2004, "第二零零一章至第二零零四章"), locationId: "yandao", characterIds: ["qin-yu", "da-ya", "meng-xi"], factionIds: ["chuanfu"], summary: "战后川军插旗，鲸吞盐岛，川府系炙手可热。", impact: "秦禹的地方势力正式获得更大政治分量。" },
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
    { id: "rel-qin-keke", source: "qin-yu", target: "ke-ke", kind: "ally", label: "供货商·战略搭档", summary: "于瑾年（可可）最早是扶持秦禹起步的药品供货商，此后从走货商做到药业集团一把手，在资源、资本与布局上长期补足秦禹，是贯穿药业、川府与边境阶段的核心智囊。", arcIds: ["arc-pharma-layout", "arc-chuanfu-rising", "arc-border-rescue"] },
    { id: "rel-qin-dong", source: "qin-yu", target: "lin-chengdong", kind: "ally", label: "交易线伙伴", summary: "林成栋参与秦禹的交易与资源网络，帮助松江线向外延伸。", arcIds: ["arc-trade-routes"] },
    { id: "rel-qin-zhan", source: "qin-yu", target: "zhan-nan", kind: "ally", label: "行动伙伴", summary: "展楠多次参与具体行动，是秦禹处理灰色事务的可靠人手。", arcIds: ["arc-trade-routes"] },
    { id: "rel-qin-fu", source: "qin-yu", target: "fu-xiaohao", kind: "ally", label: "案件线帮手", summary: "付小豪牵动前期案件和上供线索，帮助秦禹看见更深犯罪链。", arcIds: ["arc-fengbei-crime"] },
    { id: "rel-qin-lizhan", source: "qin-yu", target: "li-zhan", kind: "ally", label: "战场利刃", summary: "历战在军事和营救行动中承担硬突破角色。", arcIds: ["arc-border-rescue", "arc-spring"] },
    { id: "rel-qin-daya", source: "qin-yu", target: "da-ya", kind: "ally", label: "军事骨干", summary: "大牙的军事才能在川府阶段被不断运作和放大。", arcIds: ["arc-chuanfu-rising", "arc-final-war"] },
    { id: "rel-qin-wutianyin", source: "qin-yu", target: "wu-tianyin", kind: "ally", label: "乱世同路", summary: "吴天胤的经历极端而沉重，他和秦禹共享对底层残酷的理解。", arcIds: ["arc-wu-tianyin", "arc-trade-routes"] },
    { id: "rel-qin-fengyunian", source: "qin-yu", target: "feng-yunian", kind: "mentor", label: "引路恩师", summary: "冯玉年是秦禹的引路人，教会他责任与担当；后期冯系勾结欧盟出卖地区利益，被秦禹一方围剿崩盘，恩义与立场在二人之间撕扯到最后。冯玉年至死不怨，化身无名志愿兵战死北风口。", arcIds: ["arc-fengbei-crime", "arc-final-war"] },
    { id: "rel-qin-fengji", source: "qin-yu", target: "feng-ji", kind: "rival", label: "权力对手", summary: "冯济在后期局势中代表另一套利益选择，与秦禹多次对位。", arcIds: ["arc-nine-eight-politics", "arc-final-war"] },
    { id: "rel-qin-xiang", source: "qin-yu", target: "xiang-zehao", kind: "ally", label: "川府同盟", summary: "项择昊在川府和后期战局中承担重要军事政治角色。", arcIds: ["arc-chuanfu-rising", "arc-spring"] },
    { id: "rel-qin-meng", source: "qin-yu", target: "meng-xi", kind: "mentor", label: "识才用才", summary: "秦禹重用孟玺，把其狠辣思路转化为川府系的战术优势。", arcIds: ["arc-military-expansion", "arc-foreign-chaos"] },
    { id: "rel-qin-libokang", source: "qin-yu", target: "li-bokang", kind: "enemy", label: "终局智敌", summary: "李伯康以计划和心理战制造巨大压力，是后期最危险的智谋型对手之一。", arcIds: ["arc-foreign-chaos", "arc-final-war"] },
    { id: "rel-qin-xuyan", source: "qin-yu", target: "xu-yan", kind: "ally", label: "突袭尖刀", summary: "徐洋从黑街马仔成长为秦禹麾下最锋利的突袭与军情骨干，长吉奔袭一战成名，长期承担最硬的潜入与攻坚任务。", arcIds: ["arc-foreign-chaos", "arc-spring"] },
    { id: "rel-qin-kehua", source: "qin-yu", target: "ke-hua", kind: "political", label: "外部提点", summary: "柯桦在终局前后提供提点和动作，影响北伐外围局势。", arcIds: ["arc-final-war"] },
    { id: "rel-qin-he", source: "qin-yu", target: "he-dachuan", kind: "ally", label: "草莽战友", summary: "何大川带着匪气和执行力加入川府体系，是孟玺线的重要搭档。", arcIds: ["arc-military-expansion", "arc-nine-eight-politics"] },
    { id: "rel-qin-zhou", source: "qin-yu", target: "zhou-xingli", kind: "enemy", label: "高层敌手", summary: "周兴礼代表更高层面的政治阻力，与秦禹阵营在大局上相互牵制。", arcIds: ["arc-final-war"] },
    { id: "rel-ma2-malaoye", source: "ma-lao-er", target: "ma-lao-ye", kind: "family", label: "马家传承", summary: "马老爷子提供老江湖根基，马老二承担年轻一代的冲锋。", arcIds: ["arc-black-street"] },
    { id: "rel-ma2-cat", source: "ma-lao-er", target: "lao-mao", kind: "ally", label: "黑街搭档", summary: "马老二和老猫在黑街事务中常以不同方式帮秦禹拆局。", arcIds: ["arc-black-street", "arc-trade-routes"] },
    { id: "rel-wudi-guyan", source: "wu-di", target: "gu-yan", kind: "political", label: "上层互通", summary: "吴迪和顾言分别代表不同资源入口，共同拓宽秦禹的上升空间。", arcIds: ["arc-nanhu-changji", "arc-nine-eight-politics"] },
    { id: "rel-daya-lizhan", source: "da-ya", target: "li-zhan", kind: "brotherhood", label: "战场配合", summary: "大牙和历战在军事行动中互为锋刃，承担高风险任务。", arcIds: ["arc-border-rescue", "arc-final-war"] },
    { id: "rel-meng-he", source: "meng-xi", target: "he-dachuan", kind: "ally", label: "匪首与谋士", summary: "孟玺和何大川一谋一动，把草莽力量纳入川府战局。", arcIds: ["arc-military-expansion"] },
    { id: "rel-libokang-fengji", source: "li-bokang", target: "feng-ji", kind: "political", label: "后期合谋", summary: "李伯康和冯济在后期战局中互相利用，给秦禹制造连续压力。", arcIds: ["arc-final-war"] },
    { id: "rel-xiang-guyan", source: "xiang-zehao", target: "gu-yan", kind: "ally", label: "军政协同", summary: "项择昊和顾言共同支撑秦禹后期在军政层面的协同。", arcIds: ["arc-chuanfu-rising", "arc-spring"] },
    { id: "rel-wty-zhenzhen", source: "wu-tianyin", target: "zhen-zhen", kind: "subordinate", label: "身边人", summary: "珍珍是最了解吴天胤的人，在他走向极端时始终在其身边。", arcIds: ["arc-wu-tianyin"] },
    { id: "rel-wty-ahong", source: "wu-tianyin", target: "a-hong", kind: "comrade", label: "断后兄弟", summary: "逃亡中阿宏惨死断后，换来吴天胤二人逃出生天。", arcIds: ["arc-trade-routes"] },
    { id: "rel-qin-ahong", source: "qin-yu", target: "a-hong", kind: "comrade", label: "交易线伙伴", summary: "阿宏曾在秦禹的货路与逃亡线上拼命，是被乱世吞掉的小人物。", arcIds: ["arc-trade-routes"] },
    { id: "rel-cat-along", source: "lao-mao", target: "a-long", kind: "friend", label: "松江旧识", summary: "阿龙曾一度火遍松江，是老猫熟络的街面人物。", arcIds: ["arc-survival-entry", "arc-black-street"] },
    { id: "rel-ma2-niqiu", source: "ma-lao-er", target: "lao-niqiu", kind: "ally", label: "黑街老滑头", summary: "老泥鳅在黑街游刃有余，与马老二同属地下江湖的老人。", arcIds: ["arc-black-street"] },
    { id: "rel-qin-leizi", source: "qin-yu", target: "lei-zi", kind: "subordinate", label: "凶悍打手团", summary: "雷子团队凶残能打，是秦禹一方可调用的暴力执行力量。", arcIds: ["arc-fengbei-crime", "arc-trade-routes"] },
    { id: "rel-qin-qiuwu", source: "qin-yu", target: "qiu-wu", kind: "friend", label: "南沪恩义", summary: "仇伍多次劝说与施恩，是秦禹在南沪线上的旧识与人情。", arcIds: ["arc-trade-routes", "arc-nanhu-changji"] },
    { id: "rel-qin-wangzongxiao", source: "qin-yu", target: "wang-zongxiao", kind: "rival", label: "王家博弈", summary: "龙城王家家主王宗孝与秦禹由对立到妥协，最终散财求活。", arcIds: ["arc-nanhu-changji", "arc-spring"] },
    { id: "rel-qin-yelin", source: "qin-yu", target: "ye-lin", kind: "subordinate", label: "接手故人资本", summary: "叶琳从喜乐宫老板娘走到台前，替秦禹接手并盘活故人留下的资本与产业，是经营层面的核心执行者。", arcIds: ["arc-final-war", "arc-spring"] },
    { id: "rel-qin-xiaoqi", source: "qin-yu", target: "xiao-qi", kind: "comrade", label: "最早的悍将", summary: "小祁是退伍狙击手，从待规划区起就是秦禹最早、最敢拼命的暴力班底，多次在生死关头持枪接应。", arcIds: ["arc-survival-entry", "arc-final-war"] },
    { id: "rel-qin-laoli", source: "qin-yu", target: "lao-li", kind: "mentor", label: "官面靠山", summary: "警务司长老李看中秦禹的质感，是他挤进特区警务系统、早期立足九区的引路人与官面靠山。", arcIds: ["arc-survival-entry", "arc-black-street"] },
    { id: "rel-qin-yezixiao", source: "qin-yu", target: "ye-zixiao", kind: "comrade", label: "枭雄悍将", summary: "没身份的黑道枭雄枭哥杀伐果断，一路与秦禹绑在一起，从街面火并打到甲板死守与北伐战场。", arcIds: ["arc-black-street", "arc-final-war"] },
    { id: "rel-maer-liuzishu", source: "ma-lao-er", target: "liuzi-shu", kind: "ally", label: "马家老臣", summary: "刘子叔跟着马家近十年、看着马老二长大，是稳住马家这条线的定海针。", arcIds: ["arc-black-street"] },
    { id: "rel-maer-xiaobai", source: "ma-lao-er", target: "xiao-bai", kind: "subordinate", label: "麾下悍刀", summary: "土渣街出身的小白狂悖难驯、敢打敢杀，是马老二手下最锋利也最难管的年轻打手，唯独服马老二。", arcIds: ["arc-black-street"] },
    { id: "rel-qin-fuzhen", source: "qin-yu", target: "fu-zhen", kind: "subordinate", label: "军中骨干", summary: "付震在后期决策、负伤与升官，是秦禹军政班底的中坚。", arcIds: ["arc-foreign-chaos", "arc-final-war"] },
    { id: "rel-meng-fuzhen", source: "meng-xi", target: "fu-zhen", kind: "comrade", label: "并肩共事", summary: "付震与孟玺在后期军务中多有配合。", arcIds: ["arc-foreign-chaos"] },
    { id: "rel-qin-jiangxiaolong", source: "qin-yu", target: "jiang-xiaolong", kind: "friend", label: "四区的朋友", summary: "远在四区的江小龙在关键时刻出手相助。", arcIds: ["arc-foreign-chaos"] },
    { id: "rel-qin-linyaozong", source: "qin-yu", target: "lin-yaozong", kind: "family", label: "翁婿", summary: "林耀宗（林总督）是秦禹的岳父，后期屡次示意他接过总督之位。", arcIds: ["arc-nine-eight-politics", "arc-spring"] },
    { id: "rel-lin-father", source: "lin-yaozong", target: "lin-nianlei", kind: "family", label: "父女", summary: "林念蕾出身林家，是连接秦禹与林耀宗的亲情纽带。", arcIds: ["arc-spring"] },
    { id: "rel-qin-luxiaofeng", source: "qin-yu", target: "lu-xiaofeng", kind: "rival", label: "港口角力", summary: "陆晓峰在港口博弈中提条件、谈利益，与秦禹一方暗中较量。", arcIds: ["arc-trade-routes"] },
    { id: "rel-qin-laojin", source: "qin-yu", target: "lao-jin", kind: "enemy", label: "远山地头蛇", summary: "老金原本逍遥，因挡了秦禹川府布局而迎来最惨的一天。", arcIds: ["arc-chuanfu-rising"] }
  ],
  characters: [
    character({ id: "qin-yu", name: "秦禹", aliases: ["秦老黑", "禹少"], factionIds: ["songjiang-police", "black-street", "chuanfu"], firstSeen: range(1, 2, "序章至第一章"), role: "主角，川府系核心", profile: "从待规划区走出的青年，凭狠劲、判断力和组织能力不断向上。", story: "他先在松江警务和黑街之间求生，随后经营交易线、进入奉北和南沪棋局，最终在川府建立自己的军事政治力量。", traits: ["冷静", "能忍", "重情义", "善于借势"], locationIds: ["planning-zone", "ninth-district", "songjiang", "chuanfu", "nanhu", "bar-city"] }),
    character({ id: "qi-lin", name: "齐麟", aliases: ["麒麟"], factionIds: ["songjiang-police", "chuanfu"], firstSeen: range(1, 37, "序章至第三十六章"), role: "秦禹早期兄弟", profile: "从艰难处境中被逼着成长的伙伴，和秦禹有很深的患难基础。", story: "齐麟早期在松江线中经历失去和转变，之后成为秦禹阵营中值得托付的人。", traits: ["忠诚", "坚韧", "敏感"], locationIds: ["songjiang", "ninth-district"] }),
    character({ id: "lao-mao", name: "老猫", aliases: ["猫哥"], factionIds: ["songjiang-police", "black-street"], firstSeen: range(7, 40, "第七章至第四十章"), role: "警务搭档，兄弟线核心", profile: "圆滑、会做人，也能在关键时刻顶上去。", story: "老猫陪秦禹走过松江和黑街早期乱局，用人情和经验弥补秦禹的锋芒。", traits: ["圆滑", "义气", "机敏"], locationIds: ["songjiang", "black-street"] }),
    character({ id: "ma-lao-er", name: "马老二", aliases: ["二哥"], factionIds: ["ma-family", "black-street"], firstSeen: range(75, 76, "第七十五章至第七十六章"), role: "马家年轻一代", profile: "黑街中的奇人，讲面子也敢下狠手。", story: "他和秦禹从互相试探到结盟，帮助秦禹理解并使用地下规则。", traits: ["豪横", "讲义气", "会办事"], locationIds: ["black-street", "jiangzhou"] }),
    character({ id: "ma-lao-ye", name: "马老爷子", aliases: ["马老"], factionIds: ["ma-family"], firstSeen: range(14, 15, "第十四章"), role: "老江湖", profile: "马家的根基人物，代表旧江湖的经验和分量。", story: "他在早期为马家和秦禹关系提供底色，使黑街线不只是年轻人的斗狠。", traits: ["老辣", "稳重"], locationIds: ["black-street"] }),
    character({ id: "yuan-ke", name: "袁克", aliases: [], factionIds: ["yuan-family"], firstSeen: range(40, 41, "第四十章"), role: "前期主要敌手", profile: "依托家族和资源压迫秦禹，是松江早期冲突的核心反派。", story: "袁克多次设局、施压和反扑，最终在待规划区迎来结局。", traits: ["阴狠", "自负", "资源充足"], locationIds: ["songjiang", "planning-zone"] }),
    character({ id: "li-fugui", name: "李富贵", aliases: [], tier: "supporting", factionIds: ["planned-zone"], firstSeen: range(2, 3, "第二章至第三章"), role: "早期身份交易相关人物", profile: "连接待规划区和九区身份生意的小人物。", story: "他帮助展示身份、钱和生存机会如何在灾变后变成商品。", traits: ["市侩", "现实"], locationIds: ["planning-zone", "ninth-district"] }),
    character({ id: "lin-nianlei", name: "林念蕾", aliases: [], factionIds: ["wu-line", "chuanfu"], firstSeen: range(1121, 1205, "第一一二六章至第一二零五章"), role: "秦禹情感线重要人物", profile: "她把秦禹从战争和权谋中拉回私人情感。", story: "林念蕾在中后期与秦禹关系加深，是乱世中少数稳定的情感牵引。", traits: ["清醒", "温柔", "有主见"], locationIds: ["fengbei", "ninth-district"] }),
    character({ id: "wu-di", name: "吴迪", aliases: [], factionIds: ["wu-line"], firstSeen: range(608, 608, "第六零八章"), role: "政治资源入口", profile: "有谋略和现实判断的上层人物。", story: "吴迪多次表态或运作，为秦禹打开更高层级的局面。", traits: ["理性", "精明", "懂权衡"], locationIds: ["fengbei", "nanhu"] }),
    character({ id: "gu-yan", name: "顾言", aliases: [], factionIds: ["gu-line"], firstSeen: range(760, 760, "第七六零章"), role: "军政盟友", profile: "名字本身就有分量，背后牵动更大的资源。", story: "顾言在秦禹进入军政层面后成为重要盟友，影响长吉、八区和后期战局。", traits: ["有背景", "果断", "讲合作"], locationIds: ["changji", "eight-zone", "liu-zone"] }),
    character({ id: "ke-ke", name: "于瑾年", aliases: ["可可", "于总"], factionIds: ["chuanfu", "wu-line"], firstSeen: range(57, 57, "第五十七章"), role: "药业供货商 · 药业集团一把手", profile: "本名于瑾年、小名可可：从松江药品走货起家的精明女商人，子承父业、几个哥哥都不如她；后成长为药业集团（天成宝丰）总经理、副总裁，是秦禹阵营最重要的资源与布局支点。", story: "可可初登场是松江一带做药品走货的供货商，红唇大眼、能喝善谈，开口就是‘我于瑾年三个字就是质量的保证’。她子承父业、心思缜密，先期款不到五成绝不放货，却也最早看准并扶持了起步阶段的秦禹。此后她从走货商一路做到药业集团一把手，被称作‘于总’，是集团里唯一真正懂经营的人，带头操办慈善与产业布局，把秦禹阵营的人情和资本拧成一股绳。她在长吉市场布局、与职业经理人卢伟德的博弈中据理力争，也曾被苏庸主导的奉北经侦署突袭抓捕，秦禹倾尽全力反击营救。她敏锐、务实、敢落子，是贯穿药业、川府与边境多个阶段的智力核心。", traits: ["精明缜密", "能言善断", "务实敢布局", "外柔内刚"], locationIds: ["songjiang", "fengbei", "chuanfu", "old-triangle"] }),
    character({ id: "lin-chengdong", name: "林成栋", aliases: [], factionIds: ["black-street"], firstSeen: range(649, 649, "第六四九章"), role: "交易线伙伴", profile: "中庸谨慎，但能在交易和资源网络中发挥作用。", story: "林成栋参与秦禹的货路和交易线，让松江利益网络更稳定。", traits: ["谨慎", "务实"], locationIds: ["songjiang", "jiangzhou"] }),
    character({ id: "zhan-nan", name: "展楠", aliases: [], factionIds: ["songjiang-police", "black-street"], firstSeen: range(655, 655, "第六五五章"), role: "行动人员", profile: "能在灰色事务中压住局面的人。", story: "展楠参与交易线和街面事务，承担秦禹阵营中的执行角色。", traits: ["强硬", "可靠"], locationIds: ["songjiang"] }),
    character({ id: "fu-xiaohao", name: "付小豪", aliases: [], factionIds: ["songjiang-police"], firstSeen: range(238, 239, "第二三八章"), role: "案件线人物", profile: "前期案件和利益输送线中的关键人。", story: "付小豪让秦禹接触到更深的犯罪链条，也推动奉北前后的变化。", traits: ["机灵", "现实"], locationIds: ["songjiang", "fengbei"] }),
    character({ id: "li-zhan", name: "历战", aliases: [], factionIds: ["chuanfu", "military-intel"], firstSeen: range(555, 555, "第五五五章"), role: "战场尖刀", profile: "能打硬仗、敢接高危任务的军事骨干。", story: "历战从中期行动到最终战场不断承担高风险任务，是秦禹阵营的锋刃。", traits: ["勇猛", "直接", "抗压"], locationIds: ["seven-zone", "old-triangle", "red-dan", "beifengkou"] }),
    character({ id: "da-ya", name: "大牙", aliases: [], factionIds: ["chuanfu"], firstSeen: range(257, 258, "第二五七章"), role: "军事指挥和骨干", profile: "从早期来电到后期军事才能被运作，是川府战场线重要人物。", story: "大牙在川府扩军和北伐阶段不断被推到前台，承担从战术到指挥的职责。", traits: ["能打", "会带兵", "忠诚"], locationIds: ["chuanfu", "bar-city", "red-dan"] }),
    character({ id: "wu-tianyin", name: "吴天胤", aliases: ["胤哥"], factionIds: ["planned-zone", "black-street"], firstSeen: range(481, 481, "第四八一章"), role: "极端乱世人物", profile: "被时代和亲情逼到极端的人物。", story: "吴天胤的线展示底层人在失去退路后的爆发，也让秦禹重新审视规则。", traits: ["狠", "孤独", "重情"], locationIds: ["songjiang", "jiangzhou"] }),
    character({ id: "feng-yunian", name: "冯玉年", aliases: ["老冯", "冯喷子", "冯署长"], factionIds: ["feng-line"], firstSeen: range(383, 383, "第三八三章"), role: "九区警务署长 · 秦禹的引路人", profile: "二战区冯家子弟，曾是九区主城区警务署长，外号‘冯喷子’：刚正不阿、疾恶如仇，是秦禹起步时的引路人，最终以无名志愿兵身份战死北风口。", story: "冯玉年受家族蒙荫年少居要职，却以刚直敢言、总在会上炮轰不公闻名，因此得了‘冯喷子’的外号。秦禹起步时全靠他帮衬，从只想自保的待规划区青年成长为有责任感的人，正是他一手教出来的。二十余年后，他已是满头白发的老人，而冯系却联合卢家、贺家勾结欧盟攻打北风口、出卖地区利益。他坚决反对，却夹在徒弟秦禹与养育自己的家族之间，拼命周旋仍无力回天。冯系最终被秦禹一方围剿、彻底崩盘，族人死的死、流离的流离。他不怨秦禹，也不依附任何人；北风口被俄六区自由党攻打时，他拿着捡来的步枪当了一名志愿兵，没有官职、没有家族光环，战斗到了最后一刻。死后兜里分文没有，没人认出这个战死的老兵，就是当年风光一时的冯署长。", traits: ["刚正不阿", "疾恶如仇", "重情重义", "悲剧宿命"], locationIds: ["ninth-district", "fengbei", "beifengkou"] }),
    character({ id: "feng-ji", name: "冯济", aliases: [], factionIds: ["feng-line"], firstSeen: range(2070, 2074, "第二零七四章"), role: "后期政治对手", profile: "在后期局势中不断寻找自身处境和利益出口。", story: "冯济的选择多次影响八区、九区和最终战局，是秦禹后期必须处理的对手。", traits: ["精明", "摇摆", "重利益"], locationIds: ["eight-zone", "nanhu"] }),
    character({ id: "xiang-zehao", name: "项择昊", aliases: [], factionIds: ["chuanfu", "gu-line"], firstSeen: range(1560, 1565, "第一五六五章"), role: "川府军事政治人物", profile: "在川府和最终战局中承担重要军事角色。", story: "项择昊从面见秦禹到最终请战，体现川府系内部的担当和战场选择。", traits: ["坚定", "有担当"], locationIds: ["chuanfu", "red-dan", "yemen"] }),
    character({ id: "meng-xi", name: "孟玺", aliases: [], factionIds: ["chuanfu"], firstSeen: range(1815, 1820, "第一八二零章"), role: "川府谋士", profile: "心黑手狠，善于把复杂局面拆成可执行的狠招。", story: "孟玺进入秦禹视野后，多次进谏和布局，帮助川府系在后期战争中占据主动。", traits: ["狠辣", "聪明", "敢赌"], locationIds: ["chuanfu", "old-triangle", "jiangzhou"] }),
    character({ id: "li-bokang", name: "李伯康", aliases: [], factionIds: ["feng-line", "military-intel"], firstSeen: range(2279, 2284, "第二二八四章"), role: "后期智谋型对手", profile: "幕后操盘能力强，计划细密，能制造持续心理压力。", story: "李伯康的蓝图、计划和后期疲态构成终局前最强的智谋对抗线。", traits: ["缜密", "阴狠", "擅长心理战"], locationIds: ["nanhu", "old-triangle"] }),
    character({ id: "xu-yan", name: "徐洋", aliases: [], factionIds: ["chuanfu", "military-intel"], firstSeen: range(241, 241, "第二四一章"), role: "川府突袭尖刀 · 军情骨干", profile: "早年是裴德勇手下看管赌档、卖肉店的头号马仔，后投入秦禹阵营，一路打成令对手胆寒的突袭与军情骨干。", story: "徐洋出身黑街，原本只管区内赌档和声色生意，眼光精、心思活。投靠秦禹后他迅速成长为最锋利的一把尖刀：长吉一役，他带突袭小队从楼梯间杀出，一梭子自动步把守在包厢门口的安保尽数扫倒，‘马踏长吉’一击易手。此后他长期承担突袭、潜入与军情通道的高危任务，在最终战役里再赴战场，是秦禹军事暗线上不可或缺的硬手。", traits: ["精明", "冷静", "果决", "敢打硬仗"], locationIds: ["jiangzhou", "changji", "old-triangle", "red-dan"] }),
    character({ id: "ke-hua", name: "柯桦", aliases: [], factionIds: ["military-intel", "eu-zone"], firstSeen: range(2647, 2654, "第二六五四章"), role: "终局外部推手", profile: "在北伐前后提供提点并参与抢人等关键动作。", story: "柯桦推动最终阶段的外围变化，让战局在细节上出现转折。", traits: ["敏锐", "果断"], locationIds: ["bar-city", "eu-first-zone", "xiadao"] }),
    character({ id: "he-dachuan", name: "何大川", aliases: [], factionIds: ["chuanfu"], firstSeen: range(1815, 1820, "第一八二零章"), role: "草莽军事力量", profile: "带有匪气的执行者，能把孟玺的想法落到行动里。", story: "何大川在川府后期与孟玺共同形成草莽和谋略结合的支线。", traits: ["粗粝", "敢打", "执行力强"], locationIds: ["chuanfu", "old-triangle", "zangyuan"] }),
    character({ id: "zhou-xingli", name: "周兴礼", aliases: ["老周"], factionIds: ["feng-line"], firstSeen: range(2700, 2727, "第二七零七章至第二七二七章"), role: "终局高层对手", profile: "后期棋局中以高层政治手段落子的对手。", story: "周兴礼在最终阶段以政治手段影响战场，体现乱世高层博弈的冷酷。", traits: ["老辣", "冷静", "善落子"], locationIds: ["red-dan", "eight-zone"] }),
    character({ id: "zhen-zhen", name: "珍珍", aliases: [], tier: "supporting", factionIds: ["planned-zone", "black-street"], firstSeen: range(553, 553, "第五五三章"), role: "吴天胤身边人", profile: "最了解吴天胤的女人，在他被亲情与时代逼到绝路时始终守在身边。", story: "珍珍见证了吴天胤被亲情与时代逼到绝路的全过程，是这条悲剧线的温度。", traits: ["痴情", "隐忍"], locationIds: ["songjiang"] }),
    character({ id: "a-hong", name: "阿宏", aliases: [], tier: "supporting", factionIds: ["planned-zone", "black-street"], firstSeen: range(721, 721, "第七二一章"), role: "交易线断后者", profile: "性子仗义的底层硬汉，在一次逃亡中主动为同伴断后，最终惨死。", story: "阿宏之死是乱世吞噬底层的缩影，也让秦禹与吴天胤的线更显沉重。", traits: ["仗义", "硬气"], locationIds: ["songjiang", "jiangzhou"] }),
    character({ id: "a-long", name: "阿龙", aliases: [], tier: "supporting", factionIds: ["black-street"], firstSeen: range(20, 20, "第二十章"), role: "松江街面人物", profile: "靠胆子和狠劲一度火遍松江街面的地下人物，张扬好斗。", story: "阿龙代表松江早期街面的浮沉，是黑街生态的一个注脚。", traits: ["张扬", "好斗"], locationIds: ["songjiang", "black-street"] }),
    character({ id: "lao-niqiu", name: "老泥鳅", aliases: [], tier: "supporting", factionIds: ["black-street"], firstSeen: range(25, 25, "第二十五章"), role: "黑街老滑头", profile: "在黑街混迹多年、油滑世故、滑不留手的老牌地下人物。", story: "老泥鳅靠经验和油滑在地下江湖周旋，是黑街规则的活样本。", traits: ["油滑", "精明"], locationIds: ["black-street", "tuzha-street"] }),
    character({ id: "lei-zi", name: "雷子", aliases: [], tier: "supporting", factionIds: ["black-street"], firstSeen: range(19, 19, "第十九章"), role: "凶悍打手团首", profile: "手底下带着一支凶残能打的雷子团队，专干脏活硬仗的打手头目。", story: "雷子团队是秦禹一方可调动的暴力执行力量，干脏活、打硬仗。", traits: ["凶悍", "能打"], locationIds: ["songjiang", "tuzha-street"] }),
    character({ id: "qiu-wu", name: "仇伍", aliases: [], tier: "supporting", factionIds: ["chen-line"], firstSeen: range(709, 709, "第七零九章"), role: "南沪智囊", profile: "善于审时度势、讲恩义又会劝说的南沪幕后智囊人物。", story: "仇伍多次以劝说与恩情影响秦禹的南沪线，是人情棋局里的关键一子。", traits: ["善谋", "重恩义"], locationIds: ["nanhu"] }),
    character({ id: "wang-zongxiao", name: "王宗孝", aliases: [], tier: "supporting", factionIds: ["chen-line"], firstSeen: range(1041, 1041, "第一零四一章"), role: "龙城王家家主", profile: "和蔼可亲的表象下精于盘算的龙城王家掌门，能屈能伸。", story: "王家与秦禹由对立到妥协，最终散尽家财、低头求活躲过一劫。", traits: ["精算", "能屈能伸"], locationIds: ["planning-zone"] }),
    character({ id: "ye-lin", name: "叶琳", aliases: [], factionIds: ["black-street", "chuanfu"], firstSeen: range(237, 237, "第二三七章"), role: "喜乐宫老板娘 · 故人资本掌舵者", profile: "气质出众、深谙路面规矩的喜乐宫女老板，传言是韩三千的旧人；后为秦禹接手并盘活故人资本，成为经营核心。", story: "叶琳是喜乐宫的当家老板娘，眉目清明、气质出众，外界传言她是韩三千的旧人。她懂规矩、有分寸，初见秦禹便言明‘路面的规矩不会差，以后慢慢接触’。此后她从风月场的老板娘一步步走到台前，替秦禹接手并盘活故人留下的资本与产业，是把刀光剑影换算成账面实力的关键经营者。", traits: ["有气质", "懂规矩", "精于经营", "外柔内韧"], locationIds: ["songjiang", "nanhu", "chuanfu"] }),
    character({ id: "xiao-qi", name: "小祁", aliases: [], factionIds: ["planned-zone", "chuanfu", "military-intel"], firstSeen: range(1, 9, "第一章前后"), role: "退伍狙击手 · 秦禹最早的悍将", profile: "服役出身、枪法冷硬的狙击手，从待规划区跟着秦禹一路杀出来，是其最早也最可靠的暴力班底。", story: "小祁当过兵、办事老练，从待规划区时期就跟在秦禹身边，是最早的核心打手。秦禹在松江遇袭重伤时，他带队驾车持狙强行接应、果断扫尾；此后多年枪不离手，从街面火并打到边境战场，直到后川府时代才半退休，偶尔在军情部门客串讲师。他话不多，关键时刻却永远顶在最前。", traits: ["冷静", "枪法精准", "忠诚", "敢拼命"], locationIds: ["planning-zone", "songjiang", "old-triangle", "red-dan"] }),
    character({ id: "lao-li", name: "老李", aliases: ["李司", "李司长"], factionIds: ["songjiang-police"], firstSeen: range(1, 1, "第一章"), role: "特区警务司长 · 秦禹的官面靠山", profile: "留着八字胡、比猴还精的警务司长，是秦禹挤进特区警务系统的引路人和官面靠山。", story: "老李是特区警务系统的李司长，岁数不小、人精似的，连袁克几番拉拢都被他装傻挡回。秦禹靠一颗钻石的‘礼节’和一身质感入了他的眼，从此在警司里有了罩着自己的人，气不顺时连袁克都敢骂。老李看人极准、进退有度，是秦禹早期立足九区不可或缺的那只老狐狸。", traits: ["老练", "精明", "看人极准", "进退有度"], locationIds: ["ninth-district", "songjiang"] }),
    character({ id: "ye-zixiao", name: "叶子枭", aliases: ["枭哥"], factionIds: ["black-street", "chuanfu", "military-intel"], firstSeen: range(58, 58, "第五十八章"), role: "黑道枭雄 · 秦禹的悍将", profile: "梳着马尾、没有身份的黑道枭雄，杀伐果断、步伐从容，是秦禹阵营里最凶悍的一把利刃。", story: "叶子枭外号枭哥，是个没身份的狠人，一句‘有人就干掉他’道尽他的杀伐果断。他原打算在松江干完事就留下经营生意，却一路与秦禹绑在一起，从街面火并打到死守甲板、北伐战场。到后川府时代，他和小祁等老炮一样逐渐老去、半退休，偶尔在军情部门客串讲师，是贯穿全书的暴力核心之一。", traits: ["杀伐果断", "从容狠辣", "重义", "悍勇"], locationIds: ["songjiang", "black-street", "old-triangle", "red-dan"] }),
    character({ id: "liuzi-shu", name: "刘子叔", aliases: [], factionIds: ["ma-family", "black-street"], firstSeen: range(76, 76, "第七十六章"), role: "马家老臣", profile: "跟着马家老马近十年、看着马老二长大的忠诚老臣，脸上有疤却沉稳浑厚、不摆江湖架子。", story: "刘子叔是马家的老人，跟着马老二的父亲老马将近十年，可以说是看着马老二长大的。他脸上有一道显眼的疤、看着凶，说话却声音浑厚、谦和稳重，从不摆江湖前辈的架子。马家行事时他常在旁稳住局面、出言相劝，是黑街马家这条线上最让人放心的定海针。", traits: ["沉稳", "忠诚", "老成", "顾全大局"], locationIds: ["black-street", "jiangzhou"] }),
    character({ id: "xiao-bai", name: "小白", aliases: ["土渣街大娃"], factionIds: ["ma-family", "black-street"], firstSeen: range(607, 607, "第六零七章"), role: "马家悍勇打手", profile: "土渣街出身、自称‘大娃’的马家新锐打手，狂悖难驯、敢打敢杀，只服马老二。", story: "小白是土渣街混出来的狠角色，曾在喜乐宫一刀砍翻文永刚，是马老二手下新晋的悍勇小兄弟。他性子狂得没边，连刘子叔有时都驾驭不了，唯独马老二一开口骂，他立马不敢吭声。仗着一身狠劲在黑街横冲直撞，是马家年轻一代里最锋利也最难管的一把刀。", traits: ["狂悖", "悍勇", "敢打敢杀", "认主"], locationIds: ["tuzha-street", "black-street"] }),
    character({ id: "fu-zhen", name: "付震", aliases: [], tier: "supporting", factionIds: ["chuanfu", "military-intel"], firstSeen: range(2295, 2295, "第二二九五章"), role: "军中骨干", profile: "肯拼敢扛、在后期负责决策与执行的军政班底中坚力量。", story: "付震在后期决策、负伤、升官，是秦禹军政班底里成长起来的中坚。", traits: ["果断", "肯拼"], locationIds: ["old-triangle", "red-dan"] }),
    character({ id: "jiang-xiaolong", name: "江小龙", aliases: [], tier: "supporting", factionIds: ["military-intel"], firstSeen: range(2147, 2147, "第二一四七章"), role: "四区外援", profile: "远在四区、为人仗义，在秦禹受困海外时关键时刻出手相助的朋友。", story: "江小龙在秦禹海外受困时出手相助，是异地战线上的一份助力。", traits: ["仗义", "果敢"], locationIds: ["old-triangle"] }),
    character({ id: "lin-yaozong", name: "林耀宗", aliases: ["林总督"], tier: "supporting", factionIds: ["chuanfu", "gu-line"], firstSeen: range(1438, 1438, "第一四三八章"), role: "总督，秦禹岳父", profile: "稳坐高位、施政有方的总督级人物，也是秦禹的岳父。", story: "林耀宗后期屡次示意秦禹接过总督之位，是连接权力顶层与亲情的人物。", traits: ["稳健", "有格局"], locationIds: ["chuanfu", "ninth-district"] }),
    character({ id: "lu-xiaofeng", name: "陆晓峰", aliases: [], tier: "supporting", factionIds: ["chen-line"], firstSeen: range(871, 871, "第八七一章"), role: "港口博弈一方", profile: "心思缜密又重利、善于在港口博弈中提条件谈价码的利益方。", story: "陆晓峰在港口博弈中与各方周旋，是商路暗战里的一枚棋子。", traits: ["谨慎", "重利"], locationIds: ["jiangzhou"] }),
    character({ id: "lao-jin", name: "老金", aliases: [], tier: "supporting", factionIds: ["chuanfu"], firstSeen: range(1325, 1325, "第一三二五章"), role: "远山地头蛇", profile: "原本在远山过着逍遥日子、欺软怕硬的地方地头蛇人物。", story: "老金因挡了秦禹川府布局而迎来最惨的一天，是地方势力被收编的缩影。", traits: ["市侩", "倒霉"], locationIds: ["chuanfu"] })
  ],
  highlights: [
    { id: "hl-prologue", title: "七宗罪与买命入区", phase: "turf", chapterRange: range(1, 8, "序章至第七章"), locationId: "planning-zone", characterIds: ["qin-yu", "qi-lin"], hook: "一纸身份，一条人命，换一张进‘里面’的门票。", description: "冰封末世的待规划区，人口可买卖、人命如草芥，丛林法则是唯一的规矩。秦禹用一个买来的身份混进第九特区，从一个只想活下去的底层青年，一步步踩进警务体系的边缘。", significance: "全书的起点，奠定了极寒末世下‘先活下去、再谈对错’的底层生存基调，也埋下秦禹日后责任感的种子。" },
    { id: "hl-black-street", title: "踩着三哥往上爬", phase: "turf", chapterRange: range(5, 80, "第四章至第七十九章"), locationId: "black-street", characterIds: ["qin-yu", "lao-mao"], hook: "三坎子，阎王跳，黑街的规矩是用拳头和脑子一起换来的。", description: "土渣街与黑街的烂泥里，秦禹靠着狠劲、算计和一点运气立足。‘踩着三哥往上爬’，他逐渐摸清钱、权与人情如何在这片灰色地带决定一个人的死活。", significance: "秦禹完成从生存者到棋手的第一次蜕变，黑街的市井厮杀是他全部权谋的训练场。" },
    { id: "hl-ma-alliance", title: "黑街立足与马家结盟", phase: "turf", chapterRange: range(81, 220, "第八十章至第二一八章"), locationId: "black-street", characterIds: ["qin-yu", "ma-lao-er", "ma-lao-ye"], hook: "江湖不是打打杀杀，是人情世故。", description: "秦禹在黑街不断碰撞，最终与盘踞一方的马家达成结盟。马老二的豪横、马老爷子的老辣，让他第一次见识到成型势力的运转逻辑，也获得了向上爬的第一块跳板。", significance: "标志秦禹从单打独斗走向结盟整合，街面势力的合纵连横自此展开。" },
    { id: "hl-zhan-yuanke", title: "待规划区斩袁克", phase: "turf", chapterRange: range(617, 620, "第六一七章至第六二零章"), locationId: "planning-zone", characterIds: ["qin-yu", "yuan-ke"], hook: "先把人救出来，再亲手了结他。", description: "秦禹先营救袁克，又在待规划区将这个曾经高高在上、傲慢冷漠的反派彻底了结。恩怨在荒原的风雪里一刀两断，松江的黑白两道就此重新洗牌。", significance: "早期最大的反派落幕，秦禹的手段与决断升级，故事正式从街面斗争迈向更高层的权力博弈。" },
    { id: "hl-wu-tianyin", title: "吴天胤浮出水面", phase: "turf", chapterRange: range(481, 620, "第四八一章至第六二零章"), locationId: "songjiang", characterIds: ["qin-yu", "wu-tianyin"], hook: "被亲情与时代逼到绝路的人，会做出什么？", description: "黑白两道全力寻找吴天胤，这个眼神阴郁孤狠的男人逐渐浮出水面。他被亲情与时代逼到极端，每一步选择都带着决绝与孤独，成为照见秦禹的一面镜子。", significance: "吴天胤的极端命运，是全书‘乱世里人如何选择’这一立意的第一次重锤式呈现。" },

    { id: "hl-fengbei", title: "踏入奉北棋局", phase: "faction", chapterRange: range(400, 420, "第四零零章前后"), locationId: "fengbei", characterIds: ["qin-yu", "feng-yunian"], hook: "从松江的街口，走进奉北的会客厅。", description: "在引路人冯玉年的帮衬下，秦禹火速赶往奉北，第一次真正踏入上层权力圈。人口线索、圈层人情与高层棋局交织，街面的拳头逻辑在这里换成了规矩与分寸。", significance: "故事从江湖买卖升级为政治博弈，也铺垫了冯玉年这条贯穿始终的恩义暗线。" },
    { id: "hl-chuanfu-army", title: "百万亩粮仓，从龙之战", phase: "faction", chapterRange: range(1520, 1526, "第一五二五章至第一五二六章"), locationId: "chuanfu", characterIds: ["qin-yu", "da-ya", "xiang-zehao"], hook: "百万亩粮仓，十万军，炮筒向北，从龙之战打响。", description: "秦禹落地川府，从远山生活镇一路经营到百万亩粮仓、十万雄兵。炮筒向北，从龙之战正式打响，他终于不再寄人篱下，而是拥有了真正属于自己的地盘与军队。", significance: "全书最关键的势力跃迁：秦禹由资源组织者升级为割据一方的军政集团核心。" },
    { id: "hl-salt-island", title: "川军插旗，鲸吞盐岛", phase: "faction", chapterRange: range(1997, 2004, "第二零零一章至第二零零四章"), locationId: "yandao", characterIds: ["qin-yu", "da-ya", "meng-xi"], hook: "战旗插上海岛的那一刻，川府系炙手可热。", description: "剑指盐岛，川军一举插旗、鲸吞这座盛产盐与资源的海岛据点。战后重都门庭若市，川府系的政治分量水涨船高，地方势力正式获得更大的话语权。", significance: "川府系从地方武装迈向军政集团的标志性战果，势力版图大幅扩张。" },
    { id: "hl-nanhu-fire", title: "炮打南沪，政治军事化", phase: "faction", chapterRange: range(2487, 2538, "第二四九四章至第二五三八章"), locationId: "nanhu", characterIds: ["qin-yu", "li-bokang"], hook: "当谈判桌掀翻，剩下的只有炮火。", description: "李伯康的计划步步推进，南沪城内勾心斗角不断。炮火最终让所有政治斗争彻底军事化，各派再难维持体面，终局冲突由此正式燃起。", significance: "智谋暗战与正面战场合流，标志故事从派系博弈滑向全面战争的临界点。" },

    { id: "hl-changji", title: "马踏长吉", phase: "war", chapterRange: range(1049, 1066, "第一零五四章至第一零七一章"), locationId: "changji", characterIds: ["qin-yu", "xu-yan"], hook: "酒杯还没放下，自动步已经扫进了包厢。", description: "长吉星耀酒店的包厢里，对手们正举杯庆祝即将拿下新乡。徐洋带着突袭小队从楼梯间杀出，一梭子自动步把守在门口的安保连枪都没拔出就尽数扫倒。雷霆一击之下，长吉易手。", significance: "全书最具压迫感的奔袭名场面之一，宣告秦禹一方已具备跨区域的硬核军事打击力。" },
    { id: "hl-massacre", title: "老三角屠杀·芽会生活村", phase: "war", chapterRange: range(1677, 1683, "第一六八二章至第一六八三章"), locationId: "old-triangle", characterIds: ["qin-yu", "li-zhan"], hook: "四台机枪冲着手无寸铁的民众开火。", description: "五区军官因麾下士兵被杀而丧失理智，军车冲进芽会生活村，机枪对着围拢上来的平民展开毫无人性的屠杀。民众却没有退缩，用土枪、土炮和劣质燃烧瓶死守家园，硬是打出了战损，展现出老三角地区惊人的凝聚力与韧性。", significance: "全书最直白的战争残酷一幕，也是民族血性与平民苦难的集中爆发，让‘战争’二字第一次有了血肉的重量。" },
    { id: "hl-north-expedition", title: "兵出如龙，三十万北伐出关", phase: "war", chapterRange: range(2667, 2674, "第二六七四章"), locationId: "beifengkou", characterIds: ["qin-yu", "da-ya"], hook: "三十万人的吼声，惊天地，席卷北国。", description: "西伯无人区的进攻线上，三大战区、三十万部队整装待发。秦禹的声音在全频道扩音器里响彻：‘请保我华夏未来百年无战事，进攻！’十八个炮团组成三角炮群，配合火箭军用弹药雨清洗敌军防区，装甲集群直扑敌方弧形防线。", significance: "全书最恢弘的史诗级战争动员，秦禹从枭雄彻底升格为民族武装的统帅，国战正式开启。" },
    { id: "hl-bar-city", title: "巴尔城破·毒气与渗透小队的牺牲", phase: "war", chapterRange: range(2677, 2685, "第二六八四章至第二六八五章"), locationId: "bar-city", characterIds: ["qin-yu", "wu-tianyin"], hook: "三百五十人冲进去，最后吊出来的只有三十几个。", description: "渗透小队为炸毁敌军大仓血战巴尔城，付震一组三百五十人，最后撤离时只剩三十余人，且近半是伤兵。被废墟压住的老魏不愿拖累战友，用脖颈撞向钢筋当场自尽，只留下一句‘替我活着’。毒气弹笼罩了七成城区，付震在直升机上俯瞰战场，第一次失声痛哭。", significance: "全书最惨烈的城市攻坚战，把战争的代价与个体的牺牲写到极致，是终局前最沉重的一笔。" },
    { id: "hl-feng-death", title: "无名的志愿兵·冯玉年战死北风口", phase: "war", chapterRange: range(2667, 2700, "北伐·北风口战役"), locationId: "beifengkou", characterIds: ["qin-yu", "feng-yunian"], hook: "战死老兵的兜里分文没有，没人认得他曾是风光的冯署长。", description: "当年刚正不阿的‘冯喷子’、九区警务署长冯玉年，已是满头白发的老人。冯系勾结欧盟出卖地区利益、被徒弟秦禹一方围剿崩盘，他夹在恩义与家族之间无力回天。北风口被自由党攻打时，他不怨不附，拿着一杆捡来的步枪当了一名无名志愿兵，战斗到最后一刻。死后无人识得这个老兵，就是当年权倾一方的冯署长。", significance: "全书最催泪的悲剧，把‘大势之下，个人意志何其渺小’写到骨子里，也是秦禹身上最深的一道暗伤。" },
    { id: "hl-final-charge", title: "一直在冲锋路上的上将", phase: "war", chapterRange: range(2736, 2743, "第二七四三章"), locationId: "red-dan", characterIds: ["qin-yu", "xiang-zehao"], hook: "硝烟散尽，他仍走在冲锋的路上。", description: "北伐之后的最后冲锋与战后余波，将所有牺牲与坚持收束于一处。从待规划区买命求生的青年，到一直走在冲锋路上的上将，秦禹用一整部书的厮杀，换来了三大区的安宁。", significance: "故事的终章，让宏大的战争重新回到‘人的选择’，完成全书立意的最终闭环。" }
  ],
  journey: [
    { locationId: "planning-zone", title: "待规划区·起点", caption: "从无人区的流民开始挣命，买命求生、丛林法则中活下来。" },
    { locationId: "ninth-district", title: "踏入第九特区", caption: "用一颗钻石的‘礼节’入了李司的眼，挤进九区警务系统。" },
    { locationId: "songjiang", title: "扎根松江", caption: "在警务与黑街之间求生，街面的拳头与人情成了第一课。" },
    { locationId: "black-street", title: "黑街立足", caption: "结盟马家、火并对手，在黑街这片灰色地带站稳脚跟。" },
    { locationId: "jiangzhou", title: "江州周旋", caption: "江湖买卖与家族博弈交错，人脉与货源一步步铺开。" },
    { locationId: "fengbei", title: "奉北棋局", caption: "从松江街面走进奉北会客厅，第一次踏入上层权力圈。" },
    { locationId: "nanhu", title: "南沪博弈", caption: "南方巨头与智囊交锋，江湖买卖升级为政治博弈。" },
    { locationId: "changji", title: "马踏长吉", caption: "突袭小队一击易手，故事从江湖斗争转向军事行动。" },
    { locationId: "chuanfu", title: "落地川府", caption: "从远山生活镇到百万亩粮仓，建起根据地、扩军成势。" }
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
  locations: rawNinthDistrict.locations.map((location) => {
    const scene = locationScenes[location.id] ?? location.summary;
    return {
      ...location,
      scene,
      mapPrompt: buildMapPrompt(location, scene)
    };
  }),
  characters: rawNinthDistrict.characters.map((item) => {
    const appearance = appearances[item.id] ?? item.profile;
    const relationshipIds = rawNinthDistrict.relationships
      .filter((relationship) => relationship.source === item.id || relationship.target === item.id)
      .map((relationship) => relationship.id);
    return {
      ...item,
      appearance,
      relationshipIds,
      imagePrompt: buildCharacterPrompt(item, appearance)
    };
  })
};
