import type { ComponentType } from "react";
import { Bank, Buildings, Compass, Crosshair, FlagBanner, Mountains, Path } from "@phosphor-icons/react";
import { AssetImage } from "./AssetImage";
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

// Smooth organic island path (Catmull-Rom closed) for dashed-territory rendering.
function blobPath(cx: number, cy: number, rx: number, ry: number, mults: number[]): string {
  const n = mults.length;
  const pts = mults.map((m, i) => {
    const a = (Math.PI * 2 * i) / n;
    return [cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m] as const;
  });
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `;
  for (let i = 0; i < n; i += 1) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return `${d}Z`;
}

const MA = [1.0, 0.86, 1.08, 0.9, 1.0, 0.82, 1.06, 0.92, 1.0, 0.88, 1.05, 0.9];
const MB = [0.92, 1.06, 0.86, 1.0, 0.9, 1.08, 0.84, 1.02, 0.94, 1.07, 0.88, 1.0];
const MC = [1.05, 0.9, 1.0, 0.85, 1.07, 0.92, 1.0, 0.86, 1.06, 0.9, 1.0, 0.88];

// District territories in a wide viewBox (1600 x 760).
const regions = [
  { id: "d1", label: "一区", cx: 230, cy: 330, rx: 150, ry: 120, mults: MA },
  { id: "d2", label: "二区", cx: 820, cy: 250, rx: 150, ry: 110, mults: MB },
  { id: "d3", label: "三区", cx: 240, cy: 640, rx: 140, ry: 95, mults: MC },
  { id: "d4", label: "四区", cx: 720, cy: 520, rx: 150, ry: 110, mults: MB },
  { id: "d5", label: "五区", cx: 1040, cy: 470, rx: 175, ry: 130, mults: MA },
  { id: "d6", label: "六区", cx: 1140, cy: 110, rx: 130, ry: 90, mults: MC },
  { id: "d7", label: "七区", cx: 1430, cy: 470, rx: 130, ry: 115, mults: MB },
  { id: "d8", label: "八区", cx: 1150, cy: 270, rx: 165, ry: 125, mults: MC },
  { id: "d9", label: "九区", cx: 1470, cy: 250, rx: 155, ry: 135, mults: MA }
];

const islands = [
  { id: "s1", label: "夏岛", cx: 1565, cy: 330, rx: 44, ry: 36, mults: MB },
  { id: "s2", label: "盐岛", cx: 1185, cy: 650, rx: 46, ry: 34, mults: MC }
];

const districtLabels = regions.map((r) => ({ text: r.label, x: (r.cx / 1600) * 100, y: (r.cy / 760) * 100 }));

const placeLabels = [
  { text: "夏岛", x: 97.8, y: 43.4 },
  { text: "盐岛", x: 74, y: 85.5 },
  { text: "北风口", x: 88, y: 18 },
  { text: "藏源", x: 73, y: 46 },
  { text: "海洋", x: 26, y: 58 },
  { text: "海洋", x: 54, y: 92 },
  { text: "冰封区", x: 48, y: 10 },
  { text: "无人区", x: 33, y: 24 }
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
        <svg className="globe-map" viewBox="0 0 1600 760" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <radialGradient id="oceanWash" cx="46%" cy="42%" r="75%">
              <stop offset="0" stopColor="#2f5f86" />
              <stop offset="0.55" stopColor="#1d4366" />
              <stop offset="1" stopColor="#0c2036" />
            </radialGradient>
          </defs>
          <rect className="ocean" width="1600" height="760" fill="url(#oceanWash)" />
          <g className="graticule">
            {[200, 400, 600, 800, 1000, 1200, 1400].map((gx) => (
              <line key={`gx${gx}`} x1={gx} y1="0" x2={gx} y2="760" />
            ))}
            {[152, 304, 456, 608].map((gy) => (
              <line key={`gy${gy}`} x1="0" y1={gy} x2="1600" y2={gy} />
            ))}
          </g>
          {islands.map((isle) => (
            <path key={isle.id} className="isle-shelf" d={blobPath(isle.cx, isle.cy, isle.rx + 12, isle.ry + 12, isle.mults)} />
          ))}
          {regions.map((region) => (
            <path key={`${region.id}-shelf`} className="region-shelf" d={blobPath(region.cx, region.cy, region.rx + 16, region.ry + 16, region.mults)} />
          ))}
          {regions.map((region) => (
            <path key={region.id} className="region-land" d={blobPath(region.cx, region.cy, region.rx, region.ry, region.mults)} />
          ))}
          {islands.map((isle) => (
            <path key={`${isle.id}-land`} className="isle-land" d={blobPath(isle.cx, isle.cy, isle.rx, isle.ry, isle.mults)} />
          ))}
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
        <div className="detail-main">
          <p className="panel-label">当前地点</p>
          <h3>
            {selectedLocation.name}
            <span className="kind-tag" aria-hidden="true">{kindLabel[selectedLocation.kind]}</span>
          </h3>
          <div className="scene-block">
            <AssetImage
              src={`/scenes/${selectedLocation.id}.png`}
              alt={`${selectedLocation.name}场景示意`}
              caption={`${selectedLocation.name} · 场景示意`}
              placeholder="场景图待生成"
              variant="scene"
            />
          </div>
          <p>{selectedLocation.summary}</p>
          <p className="atmosphere">{selectedLocation.atmosphere}</p>
          <div className="chip-row">
            {selectedLocation.factionIds.map((id) => {
              const faction = dataset.factions.find((item) => item.id === id);
              return faction ? <span key={id}>{faction.name}</span> : null;
            })}
          </div>
        </div>
        <div className="detail-side">
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
        </div>
      </aside>
    </div>
  );
}
