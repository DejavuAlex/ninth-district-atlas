// 把 assets/ 下的中文命名 PNG 素材转换为 public/ 下的 WebP（按英文 id），
// 大幅减小体积、加快国内加载。需要系统已安装 cwebp（brew install webp）。
//
//   npm run optimize:images
//
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PORTRAITS = {
  "付小豪": "fu-xiaohao", "厉战": "li-zhan", "孟玺": "meng-xi", "林成栋": "lin-chengdong",
  "顾言": "gu-yan", "何大川": "he-dachuan", "可可": "ke-ke", "小白": "xiao-bai",
  "秦禹": "qin-yu", "马老二": "ma-lao-er", "冯济": "feng-ji", "吴天胤": "wu-tianyin",
  "徐洋": "xu-yan", "老李": "lao-li", "马老爷子": "ma-lao-ye", "冯玉年": "feng-yunian",
  "吴迪": "wu-di", "李伯康": "li-bokang", "林念蕾": "lin-nianlei", "项择昊": "xiang-zehao",
  "齐麟": "qi-lin", "刘子叔": "liuzi-shu", "大牙": "da-ya", "老猫": "lao-mao", "叶琳": "ye-lin",
  "叶子枭": "ye-zixiao", "周兴礼": "zhou-xingli"
};

const SCENES = {
  "8区": "eight-zone", "七区": "seven-zone", "北风口": "beifengkou", "南沪": "nanhu",
  "土渣街": "tuzha-street", "夏岛": "xiadao", "奉北": "fengbei", "川府": "chuanfu",
  "待规划区": "planning-zone", "松江": "songjiang", "欧盟一区": "eu-first-zone", "盐岛": "yandao",
  "第九特区": "ninth-district", "第九特区地图": "world-map", "红丹战场": "red-dan",
  "耶门": "yemen", "藏源": "zangyuan", "长吉": "changji", "黑街": "black-street",
  "老三角": "old-triangle", "巴尔城": "bar-city", "五区": "five-zone"
};

const QUALITY = "82";

function ensureCwebp() {
  try {
    execFileSync("cwebp", ["-version"], { stdio: "ignore" });
  } catch {
    console.error("未找到 cwebp，请先安装：brew install webp（macOS）/ apt install webp（Linux）");
    process.exit(1);
  }
}

function convertGroup(srcDir, outDir, mapping) {
  mkdirSync(outDir, { recursive: true });
  let ok = 0;
  let before = 0;
  let after = 0;
  for (const [cn, id] of Object.entries(mapping)) {
    const src = resolve(root, srcDir, `${cn}.png`);
    if (!existsSync(src)) continue;
    const out = resolve(outDir, `${id}.webp`);
    execFileSync("cwebp", ["-quiet", "-q", QUALITY, src, "-o", out]);
    before += statSync(src).size;
    after += statSync(out).size;
    ok += 1;
  }
  return { ok, before, after };
}

function removeStalePng(dir) {
  if (!existsSync(dir)) return 0;
  let removed = 0;
  for (const file of readdirSync(dir)) {
    if (file.toLowerCase().endsWith(".png")) {
      rmSync(resolve(dir, file));
      removed += 1;
    }
  }
  return removed;
}

ensureCwebp();
const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`;

const p = convertGroup("assets/人物", resolve(root, "public/portraits"), PORTRAITS);
const s = convertGroup("assets/地区", resolve(root, "public/scenes"), SCENES);
const removed = removeStalePng(resolve(root, "public/portraits")) + removeStalePng(resolve(root, "public/scenes"));

console.log(`人物：${p.ok} 张  场景：${s.ok} 张  → WebP`);
console.log(`体积：${mb(p.before + s.before)} → ${mb(p.after + s.after)}`);
console.log(`已清理旧 PNG：${removed} 个`);
