import { describe, expect, it } from "vitest";
import { ninthDistrict } from "../data/ninthDistrict";
import {
  filterByArc,
  getCharacterById,
  getEventsForLocation,
  getRelationshipsForCharacter,
  searchNovel
} from "../lib/novelFilters";

describe("小说检索工具", () => {
  it("按 id 获取人物", () => {
    expect(getCharacterById(ninthDistrict, "qin-yu")?.name).toBe("秦禹");
    expect(getCharacterById(ninthDistrict, "missing")).toBeNull();
  });

  it("按地点获取事件", () => {
    const events = getEventsForLocation(ninthDistrict, "songjiang");
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => event.locationId === "songjiang")).toBe(true);
  });

  it("按人物获取双向关系", () => {
    const relationships = getRelationshipsForCharacter(ninthDistrict, "qin-yu");
    expect(relationships.length).toBeGreaterThan(10);
    expect(relationships.every((item) => item.source === "qin-yu" || item.target === "qin-yu")).toBe(true);
  });

  it("按剧情阶段筛选关联数据", () => {
    const result = filterByArc(ninthDistrict, "arc-chuanfu-rising");
    expect(result?.arc.title).toContain("川府");
    expect(result?.events.length).toBeGreaterThan(0);
    expect(result?.characters.some((character) => character.name === "秦禹")).toBe(true);
    expect(result?.locations.some((location) => location.name === "川府")).toBe(true);
    expect(filterByArc(ninthDistrict, "missing")).toBeNull();
  });

  it("搜索人物、别名、地点、势力和事件", () => {
    expect(searchNovel(ninthDistrict, "秦老黑").characters.map((item) => item.name)).toContain("秦禹");
    expect(searchNovel(ninthDistrict, "松江").locations.map((item) => item.name)).toContain("松江");
    expect(searchNovel(ninthDistrict, "川府系").factions.map((item) => item.name)).toContain("川府系");
    expect(searchNovel(ninthDistrict, "巴尔城破").events.map((item) => item.title)).toContain("巴尔城破");
    expect(searchNovel(ninthDistrict, "   ")).toEqual({ characters: [], locations: [], factions: [], events: [] });
  });
});
