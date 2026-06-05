export type NovelId = "ninth-district";

export type ArcId = string;
export type LocationId = string;
export type CharacterId = string;
export type FactionId = string;
export type EventId = string;

export interface ChapterRange {
  startOrder: number;
  endOrder: number;
  label: string;
}

export interface StoryArc {
  id: ArcId;
  title: string;
  chapterRange: ChapterRange;
  summary: string;
  keyEvents: EventId[];
  featuredLocations: LocationId[];
  featuredCharacters: CharacterId[];
}

export interface LocationNode {
  id: LocationId;
  name: string;
  kind: "wasteland" | "district" | "street" | "city" | "frontier" | "battlefield";
  x: number;
  y: number;
  summary: string;
  atmosphere: string;
  mapPrompt: string;
  sceneImage?: string;
  factionIds: FactionId[];
  eventIds: EventId[];
}

export interface NovelTheme {
  id: string;
  title: string;
  insight: string;
  detail: string;
  anchor: string;
}

export interface Faction {
  id: FactionId;
  name: string;
  summary: string;
  color: string;
}

export interface Character {
  id: CharacterId;
  name: string;
  aliases: string[];
  factionIds: FactionId[];
  firstSeen: ChapterRange;
  role: string;
  profile: string;
  story: string;
  imagePrompt: string;
  traits: string[];
  locationIds: LocationId[];
  relationshipIds: string[];
}

export interface Relationship {
  id: string;
  source: CharacterId;
  target: CharacterId;
  kind: "brotherhood" | "family" | "romance" | "ally" | "rival" | "mentor" | "enemy" | "political";
  label: string;
  summary: string;
  arcIds: ArcId[];
}

export interface StoryEvent {
  id: EventId;
  title: string;
  chapterRange: ChapterRange;
  locationId: LocationId;
  characterIds: CharacterId[];
  factionIds: FactionId[];
  summary: string;
  impact: string;
}

export interface NovelDataset {
  id: NovelId;
  title: string;
  author: string;
  premise: string;
  arcs: StoryArc[];
  locations: LocationNode[];
  factions: Faction[];
  characters: Character[];
  relationships: Relationship[];
  events: StoryEvent[];
  themes: NovelTheme[];
}
