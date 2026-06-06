import chapters from "../src/data/chapterIndex.generated.json" with { type: "json" };
import { ninthDistrict } from "../src/data/ninthDistrict.ts";

const forbiddenDash = /[—–]/;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function collectStrings(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
}

const characterIds = new Set(ninthDistrict.characters.map((item) => item.id));
const locationIds = new Set(ninthDistrict.locations.map((item) => item.id));
const factionIds = new Set(ninthDistrict.factions.map((item) => item.id));
const eventIds = new Set(ninthDistrict.events.map((item) => item.id));
const relationshipIds = new Set(ninthDistrict.relationships.map((item) => item.id));

assert(chapters.length > 2000, `章节数量异常：${chapters.length}`);
assert(ninthDistrict.arcs.length >= 10, "剧情阶段数量不足");
assert(ninthDistrict.locations.length >= 12, "地点数量不足");
assert(ninthDistrict.characters.length >= 18, "人物数量不足");
assert(ninthDistrict.relationships.length >= 25, "关系数量不足");
assert(ninthDistrict.events.length >= 35, "事件数量不足");

for (const relationship of ninthDistrict.relationships) {
  assert(characterIds.has(relationship.source), `关系 ${relationship.id} 的 source 不存在`);
  assert(characterIds.has(relationship.target), `关系 ${relationship.id} 的 target 不存在`);
}

for (const event of ninthDistrict.events) {
  assert(locationIds.has(event.locationId), `事件 ${event.id} 的地点不存在`);
  event.characterIds.forEach((id) => assert(characterIds.has(id), `事件 ${event.id} 的人物 ${id} 不存在`));
  event.factionIds.forEach((id) => assert(factionIds.has(id), `事件 ${event.id} 的势力 ${id} 不存在`));
}

for (const arc of ninthDistrict.arcs) {
  assert(arc.chapterRange.startOrder <= arc.chapterRange.endOrder, `阶段 ${arc.id} 章节范围错误`);
  arc.keyEvents.forEach((id) => assert(eventIds.has(id), `阶段 ${arc.id} 的事件 ${id} 不存在`));
  arc.featuredLocations.forEach((id) => assert(locationIds.has(id), `阶段 ${arc.id} 的地点 ${id} 不存在`));
  arc.featuredCharacters.forEach((id) => assert(characterIds.has(id), `阶段 ${arc.id} 的人物 ${id} 不存在`));
}

for (const character of ninthDistrict.characters) {
  assert(character.profile.length > 12, `人物 ${character.id} 简介过短`);
  assert(character.story.length > 20, `人物 ${character.id} 故事过短`);
  assert(character.imagePrompt.length > 30, `人物 ${character.id} 缺少形象提示词`);
  assert(character.traits.length > 0, `人物 ${character.id} 缺少特质`);
  character.factionIds.forEach((id) => assert(factionIds.has(id), `人物 ${character.id} 的势力 ${id} 不存在`));
  character.locationIds.forEach((id) => assert(locationIds.has(id), `人物 ${character.id} 的地点 ${id} 不存在`));
  character.relationshipIds.forEach((id) => assert(relationshipIds.has(id), `人物 ${character.id} 的关系 ${id} 不存在`));
}

for (const location of ninthDistrict.locations) {
  assert(location.x >= 0 && location.x <= 100, `地点 ${location.id} 的 x 坐标越界`);
  assert(location.y >= 0 && location.y <= 100, `地点 ${location.id} 的 y 坐标越界`);
  assert(location.mapPrompt.length > 30, `地点 ${location.id} 缺少地图提示词`);
  location.factionIds.forEach((id) => assert(factionIds.has(id), `地点 ${location.id} 的势力 ${id} 不存在`));
  location.eventIds.forEach((id) => assert(eventIds.has(id), `地点 ${location.id} 的事件 ${id} 不存在`));
}

assert(ninthDistrict.journey.length >= 5, "崛起之路节点数量不足");
for (const stop of ninthDistrict.journey) {
  assert(locationIds.has(stop.locationId), `崛起之路节点 ${stop.locationId} 的地点不存在`);
  assert(stop.title.length > 1, `崛起之路节点 ${stop.locationId} 缺少标题`);
  assert(stop.caption.length > 8, `崛起之路节点 ${stop.locationId} 描述过短`);
}

const sortedArcs = [...ninthDistrict.arcs].sort((a, b) => a.chapterRange.startOrder - b.chapterRange.startOrder);
assert(sortedArcs[0].chapterRange.startOrder === 1, "剧情阶段未从第一段开始");
assert(sortedArcs.at(-1).chapterRange.endOrder === chapters.length, "剧情阶段未覆盖到最后章节");

for (let index = 1; index < sortedArcs.length; index += 1) {
  const previous = sortedArcs[index - 1];
  const current = sortedArcs[index];
  assert(
    current.chapterRange.startOrder <= previous.chapterRange.endOrder + 1,
    `阶段 ${previous.id} 与 ${current.id} 之间存在未解释空档`
  );
}

const forbidden = collectStrings(ninthDistrict).filter((text) => forbiddenDash.test(text));
assert(forbidden.length === 0, `发现长破折号文案：${forbidden.join(" | ")}`);

console.log(`数据校验通过：${ninthDistrict.characters.length} 人物，${ninthDistrict.events.length} 事件，${chapters.length} 章节。`);
