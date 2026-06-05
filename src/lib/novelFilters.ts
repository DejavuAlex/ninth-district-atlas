import type { ArcId, CharacterId, LocationId, NovelDataset } from "../types/novel";

const normalize = (value: string) => value.trim().toLowerCase();

export function getCharacterById(dataset: NovelDataset, id: CharacterId) {
  return dataset.characters.find((character) => character.id === id) ?? null;
}

export function getEventsForLocation(dataset: NovelDataset, id: LocationId) {
  return dataset.events.filter((event) => event.locationId === id);
}

export function getRelationshipsForCharacter(dataset: NovelDataset, id: CharacterId) {
  return dataset.relationships.filter((relationship) => relationship.source === id || relationship.target === id);
}

export function filterByArc(dataset: NovelDataset, id: ArcId) {
  const arc = dataset.arcs.find((item) => item.id === id) ?? null;
  if (!arc) return null;

  const eventIds = new Set(arc.keyEvents);
  const events = dataset.events.filter((event) => eventIds.has(event.id));
  const characterIds = new Set(events.flatMap((event) => event.characterIds).concat(arc.featuredCharacters));
  const locationIds = new Set(events.map((event) => event.locationId).concat(arc.featuredLocations));

  return {
    arc,
    events,
    characters: dataset.characters.filter((character) => characterIds.has(character.id)),
    locations: dataset.locations.filter((location) => locationIds.has(location.id)),
    relationships: dataset.relationships.filter(
      (relationship) => characterIds.has(relationship.source) && characterIds.has(relationship.target)
    )
  };
}

export function searchNovel(dataset: NovelDataset, rawQuery: string) {
  const query = normalize(rawQuery);
  if (!query) return { characters: [], locations: [], factions: [], events: [] };

  return {
    characters: dataset.characters.filter((item) =>
      [item.name, ...item.aliases, item.role, item.profile].some((value) => normalize(value).includes(query))
    ),
    locations: dataset.locations.filter((item) =>
      [item.name, item.summary, item.atmosphere].some((value) => normalize(value).includes(query))
    ),
    factions: dataset.factions.filter((item) => [item.name, item.summary].some((value) => normalize(value).includes(query))),
    events: dataset.events.filter((item) =>
      [item.title, item.summary, item.impact, item.chapterRange.label].some((value) => normalize(value).includes(query))
    )
  };
}
