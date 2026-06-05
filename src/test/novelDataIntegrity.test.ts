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
      const hasEvent = ninthDistrict.events.some((event) => event.locationId === location.id);
      const hasCharacter = ninthDistrict.characters.some((character) => character.locationIds.includes(location.id));
      expect(hasEvent || hasCharacter, location.name).toBe(true);
    }

    const allVisibleText = collectStrings(ninthDistrict);
    expect(allVisibleText.filter((text) => forbiddenDash.test(text))).toEqual([]);
  });
});
