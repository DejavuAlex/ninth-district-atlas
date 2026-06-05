import type { ComponentType } from "react";
import { Bank, Buildings, Compass, Crosshair, FlagBanner, Mountains, Path } from "@phosphor-icons/react";
import { getCharacterById, getEventsForLocation } from "../lib/novelFilters";
import type { CharacterId, LocationId, LocationNode, NovelDataset } from "../types/novel";

interface WorldMapProps {
  dataset: NovelDataset;
  selectedLocationId: LocationId | null;
  activeLocationIds: LocationId[];
  selectedCharacterId: CharacterId | null;
  onSelectLocation: (id: LocationId) => void;
  onSelectCharacter: (id: CharacterId) => void;
}

const kindIcon: Record<LocationNode["kind"], ComponentType<{ weight?: any; size?: number }>> = {
  city: Buildings,
  district: Bank,
  street: Path,
  wasteland: Mountains,
  frontier: FlagBanner,
  battlefield: Crosshair
};

const kindLabel: Record<LocationNode["kind"], string> = {
  city: "城市",
  district: "辖区",
  street: "街区",
  wasteland: "废土",
  frontier: "边境",
  battlefield: "战场"
};

// Ice landmass clusters (viewBox 1000 x 460), merged via the gooey filter
// into organic snow continents that echo the canonical 第九特区 global map.
const landCircles: Array<[number, number, number]> = [
  [150, 180, 52], [195, 200, 56], [160, 230, 44], [210, 160, 40], [120, 205, 36], [235, 215, 34],
  [510, 150, 46], [550, 170, 50], [580, 145, 38], [515, 195, 38], [560, 205, 36], [480, 175, 34],
  [150, 385, 46], [185, 400, 46], [140, 415, 36], [200, 375, 34], [170, 430, 30],
  [440, 290, 46], [475, 305, 48], [450, 335, 38], [490, 285, 34], [420, 320, 30], [505, 330, 28],
  [640, 270, 46], [680, 285, 50], [655, 310, 40], [700, 260, 36], [620, 300, 32],
  [680, 40, 42], [715, 55, 44], [740, 35, 34], [665, 62, 28], [700, 75, 26],
  [855, 250, 42], [890, 265, 44], [870, 290, 34], [905, 250, 30], [835, 275, 28],
  [680, 140, 46], [720, 158, 50], [695, 185, 38], [735, 135, 34], [655, 170, 30], [745, 180, 28],
  [885, 135, 44], [918, 155, 48], [898, 185, 36], [935, 140, 30], [870, 170, 30], [930, 190, 26],
  [968, 185, 18], [980, 198, 14],
  [715, 388, 18], [730, 398, 16],
  [820, 335, 16], [560, 400, 14], [300, 300, 12], [955, 300, 14], [610, 420, 14], [420, 420, 14], [770, 180, 16]
];

const terrainDots: Array<[number, number, number]> = [
  [170, 195, 7], [200, 210, 6], [150, 220, 5],
  [535, 170, 6], [555, 185, 5],
  [165, 395, 6], [185, 405, 5],
  [460, 305, 6], [445, 320, 5],
  [660, 285, 6], [680, 300, 5],
  [700, 55, 5], [715, 45, 4],
  [875, 265, 6], [890, 278, 5],
  [700, 158, 6], [718, 170, 5],
  [900, 158, 6], [915, 172, 5], [892, 178, 4]
];

const districtLabels = [
  { text: "一区", x: 16, y: 43 },
  { text: "二区", x: 53, y: 37 },
  { text: "三区", x: 16, y: 87 },
  { text: "四区", x: 46, y: 67 },
  { text: "五区", x: 66, y: 62 },
  { text: "六区", x: 70, y: 11 },
  { text: "七区", x: 88, y: 58 },
  { text: "八区", x: 70, y: 34 },
  { text: "九区", x: 91, y: 34 }
];

const placeLabels = [
  { text: "夏岛", x: 96, y: 41 },
  { text: "盐岛", x: 72, y: 86 },
  { text: "北风口", x: 87, y: 20 },
  { text: "藏源", x: 71, y: 47 },
  { text: "海洋", x: 28, y: 62 },
  { text: "海洋", x: 56, y: 90 },
  { text: "冰封区", x: 50, y: 14 },
  { text: "无人区", x: 38, y: 28 }
];

export function WorldMap({
  dataset,
  selectedLocationId,
  activeLocationIds,
  selectedCharacterId,
  onSelectLocation,
  onSelectCharacter
}: WorldMapProps) {
  const selectedLocation = dataset.locations.find((location) => location.id === selectedLocationId) ?? dataset.locations[0];
  const events = getEventsForLocation(dataset, selectedLocation.id);
  const relatedCharacters = dataset.characters.filter((character) => character.locationIds.includes(selectedLocation.id));
  const selectedCharacter = selectedCharacterId ? getCharacterById(dataset, selectedCharacterId) : null;

  return (
    <div className="world-map-layout">
      <div className="map-panel" aria-label="第九特区全球地图">
        <svg className="globe-map" viewBox="0 0 1000 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="oceanWash" cx="46%" cy="44%" r="70%">
              <stop offset="0" stopColor="#2f5f86" />
              <stop offset="0.55" stopColor="#1d4366" />
              <stop offset="1" stopColor="#0d2238" />
            </radialGradient>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
          <rect className="ocean" width="1000" height="460" fill="url(#oceanWash)" />
          <g className="graticule">
            {[125, 250, 375, 500, 625, 750, 875].map((gx) => (
              <line key={`gx${gx}`} x1={gx} y1="0" x2={gx} y2="460" />
            ))}
            {[92, 184, 276, 368].map((gy) => (
              <line key={`gy${gy}`} x1="0" y1={gy} x2="1000" y2={gy} />
            ))}
          </g>
          <g className="ice-shelf" filter="url(#goo)">
            {landCircles.map(([x, y, r], i) => (
              <circle key={`s${i}`} cx={x} cy={y} r={r + 14} />
            ))}
          </g>
          <g className="land-mass" filter="url(#goo)">
            {landCircles.map(([x, y, r], i) => (
              <circle key={`l${i}`} cx={x} cy={y} r={r} />
            ))}
          </g>
          <g className="terrain">
            {terrainDots.map(([x, y, r], i) => (
              <circle key={`t${i}`} cx={x} cy={y} r={r} />
            ))}
          </g>
        </svg>

        {districtLabels.map((label) => (
          <span key={label.text} className="globe-district" style={{ left: `${label.x}%`, top: `${label.y}%` }} aria-hidden="true">
            {label.text}
          </span>
        ))}
        {placeLabels.map((label) => (
          <span key={label.text + label.x} className="globe-place" style={{ left: `${label.x}%`, top: `${label.y}%` }} aria-hidden="true">
            {label.text}
          </span>
        ))}

        <div className="map-compass" aria-hidden="true">
          <Compass weight="duotone" size={26} />
          <span>N</span>
        </div>
        <div className="map-title-plate" aria-hidden="true">第九特区 · 全球地图</div>

        {dataset.locations.map((location) => {
          const Icon = kindIcon[location.kind] ?? Buildings;
          const isSelected = location.id === selectedLocation.id;
          const isActive = activeLocationIds.includes(location.id);
          const isCharacterLocation = selectedCharacter?.locationIds.includes(location.id) ?? false;
          return (
            <button
              key={location.id}
              className={`map-marker ${isSelected ? "is-selected" : ""} ${isActive ? "is-active" : ""} ${
                isCharacterLocation ? "is-character-location" : ""
              }`}
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              aria-label={`查看${location.name}`}
              onClick={() => onSelectLocation(location.id)}
            >
              <span className="marker-icon" aria-hidden="true">
                <Icon weight="duotone" size={22} />
              </span>
              <span className="marker-label">{location.name}</span>
            </button>
          );
        })}
      </div>
      <aside className="detail-panel">
        <p className="panel-label">当前地点</p>
        <h3>
          {selectedLocation.name}
          <span className="kind-tag" aria-hidden="true">{kindLabel[selectedLocation.kind]}</span>
        </h3>
        <p>{selectedLocation.summary}</p>
        <p className="atmosphere">{selectedLocation.atmosphere}</p>
        <div className="asset-prompt-card">
          {selectedLocation.sceneImage ? (
            <div className="asset-preview has-image">
              <img src={selectedLocation.sceneImage} alt={`${selectedLocation.name}场景示意`} loading="lazy" />
              <span className="asset-caption">{selectedLocation.name} · 场景示意</span>
            </div>
          ) : (
            <div className="asset-preview map-preview" aria-hidden="true">
              <span>待替换场景图（提示词见下）</span>
            </div>
          )}
          <h4>地图场景提示词</h4>
          <p>{selectedLocation.mapPrompt}</p>
        </div>
        <div className="chip-row">
          {selectedLocation.factionIds.map((id) => {
            const faction = dataset.factions.find((item) => item.id === id);
            return faction ? <span key={id}>{faction.name}</span> : null;
          })}
        </div>
        <div className="mini-list">
          <h4>关键事件</h4>
          {events.slice(0, 5).map((event) => (
            <article key={event.id}>
              <strong>{event.title}</strong>
              <small>{event.chapterRange.label}</small>
            </article>
          ))}
        </div>
        <div className="mini-list">
          <h4>相关人物</h4>
          <div className="inline-buttons">
            {relatedCharacters.slice(0, 8).map((character) => (
              <button key={character.id} type="button" onClick={() => onSelectCharacter(character.id)}>
                {character.name}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
