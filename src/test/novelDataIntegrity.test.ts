import { describe, expect, it } from "vitest";
import { ninthDistrict } from "../data/ninthDistrict";

const forbiddenDash = /[—–]/;

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe("《第九特区》结构化数据", () => {
  it("达到首版内容覆盖量", () => {
    expect(ninthDistrict.arcs.length).toBeGreaterThanOrEqual(10);
    expect(ninthDistrict.locations.length).toBeGreaterThanOrEqual(12);
    expect(ninthDistrict.characters.length).toBeGreaterThanOrEqual(18);
    expect(ninthDistrict.relationships.length).toBeGreaterThanOrEqual(25);
    expect(ninthDistrict.events.length).toBeGreaterThanOrEqual(35);
  });

  it("所有引用都指向存在的数据", () => {
    const characterIds = new Set(ninthDistrict.characters.map((item) => item.id));
    const locationIds = new Set(ninthDistrict.locations.map((item) => item.id));
    const factionIds = new Set(ninthDistrict.factions.map((item) => item.id));
    const eventIds = new Set(ninthDistrict.events.map((item) => item.id));

    for (const relationship of ninthDistrict.relationships) {
      expect(characterIds.has(relationship.source), relationship.id).toBe(true);
      expect(characterIds.has(relationship.target), relationship.id).toBe(true);
    }

    for (const event of ninthDistrict.events) {
      expect(locationIds.has(event.locationId), event.id).toBe(true);
      event.characterIds.forEach((id) => expect(characterIds.has(id), event.id).toBe(true));
      event.factionIds.forEach((id) => expect(factionIds.has(id), event.id).toBe(true));
    }

    for (const arc of ninthDistrict.arcs) {
      arc.keyEvents.forEach((id) => expect(eventIds.has(id), arc.id).toBe(true));
      arc.featuredLocations.forEach((id) => expect(locationIds.has(id), arc.id).toBe(true));
      arc.featuredCharacters.forEach((id) => expect(characterIds.has(id), arc.id).toBe(true));
    }

    const arcIds = new Set(ninthDistrict.arcs.map((arc) => arc.id));
    expect(ninthDistrict.themes.length).toBeGreaterThanOrEqual(6);
    for (const theme of ninthDistrict.themes) {
      expect(theme.insight.length, theme.id).toBeGreaterThan(8);
      expect(theme.detail.length, theme.id).toBeGreaterThan(40);
      expect(arcIds.has(theme.anchor), theme.id).toBe(true);
    }

    const appearances = ninthDistrict.characters.map((character) => character.appearance);
    appearances.forEach((text, index) => expect(text.length, ninthDistrict.characters[index].id).toBeGreaterThan(20));
    expect(new Set(appearances).size, "每个人物的外貌应当互不相同").toBe(ninthDistrict.characters.length);

    const scenes = ninthDistrict.locations.map((location) => location.scene);
    scenes.forEach((text, index) => expect(text.length, ninthDistrict.locations[index].id).toBeGreaterThan(20));
    expect(new Set(scenes).size, "每个地点的区域特征应当互不相同").toBe(ninthDistrict.locations.length);

    const validPhases = new Set(["turf", "faction", "war"]);
    expect(ninthDistrict.highlights.length).toBeGreaterThanOrEqual(12);
    const highlightIds = ninthDistrict.highlights.map((item) => item.id);
    expect(new Set(highlightIds).size, "重点情节 id 应当唯一").toBe(highlightIds.length);
    for (const highlight of ninthDistrict.highlights) {
      expect(validPhases.has(highlight.phase), highlight.id).toBe(true);
      expect(locationIds.has(highlight.locationId), highlight.id).toBe(true);
      expect(highlight.characterIds.length, highlight.id).toBeGreaterThan(0);
      highlight.characterIds.forEach((id) => expect(characterIds.has(id), highlight.id).toBe(true));
      expect(highlight.hook.length, highlight.id).toBeGreaterThan(8);
      expect(highlight.description.length, highlight.id).toBeGreaterThan(40);
      expect(highlight.significance.length, highlight.id).toBeGreaterThan(15);
      expect(highlight.chapterRange.startOrder, highlight.id).toBeLessThanOrEqual(highlight.chapterRange.endOrder);
    }
    expect(validPhases.size).toBe(new Set(ninthDistrict.highlights.map((h) => h.phase)).size);
  });

  it("人物、地点和文案满足中文展示约束", () => {
    for (const character of ninthDistrict.characters) {
      expect(character.name).toMatch(/[\u4e00-\u9fff]/);
      expect(character.profile.length).toBeGreaterThan(12);
      expect(character.story.length).toBeGreaterThan(20);
      expect(character.imagePrompt.length).toBeGreaterThan(30);
      expect(character.imagePrompt).toContain(character.name);
      expect(character.traits.length).toBeGreaterThan(0);
    }

    for (const location of ninthDistrict.locations) {
      expect(location.x).toBeGreaterThanOrEqual(0);
      expect(location.x).toBeLessThanOrEqual(100);
      expect(location.y).toBeGreaterThanOrEqual(0);
      expect(location.y).toBeLessThanOrEqual(100);
      expect(location.mapPrompt.length).toBeGreaterThan(30);
      expect(location.mapPrompt).toContain(location.name);
      expect(location.mapPrompt).toContain("街道风貌");
      expect(location.mapPrompt).not.toContain("俯视地图");
      const hasEvent = ninthDistrict.events.some((event) => event.locationId === location.id);
      const hasCharacter = ninthDistrict.characters.some((character) => character.locationIds.includes(location.id));
      expect(hasEvent || hasCharacter, location.name).toBe(true);
    }

    const allVisibleText = collectStrings(ninthDistrict);
    expect(allVisibleText.filter((text) => forbiddenDash.test(text))).toEqual([]);
  });
});
