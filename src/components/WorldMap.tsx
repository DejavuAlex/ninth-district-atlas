import { getCharacterById, getEventsForLocation } from "../lib/novelFilters";
import type { CharacterId, LocationId, NovelDataset } from "../types/novel";

interface WorldMapProps {
  dataset: NovelDataset;
  selectedLocationId: LocationId | null;
  activeLocationIds: LocationId[];
  selectedCharacterId: CharacterId | null;
  onSelectLocation: (id: LocationId) => void;
  onSelectCharacter: (id: CharacterId) => void;
}

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
      <div className="map-panel" aria-label="第九特区设定地图">
        <svg className="illustrated-map" viewBox="0 0 1000 680" aria-hidden="true">
          <defs>
            <filter id="paperNoise">
              <feTurbulence baseFrequency="0.8" numOctaves="2" seed="9" type="fractalNoise" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA tableValues="0 0.18" type="table" />
              </feComponentTransfer>
            </filter>
            <linearGradient id="seaWash" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#d9e8e2" />
              <stop offset="0.52" stopColor="#93c9d1" />
              <stop offset="1" stopColor="#23425f" />
            </linearGradient>
            <linearGradient id="wastelandWash" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#efe6c7" />
              <stop offset="1" stopColor="#b98b57" />
            </linearGradient>
          </defs>
          <rect className="map-paper" width="1000" height="680" />
          <path className="map-sea" d="M0 0H1000V680H0Z" />
          <path className="ice-field" d="M20 20C180 60 230 20 360 72C520 134 665 38 790 98C905 153 943 94 1000 132V0H0Z" />
          <path className="continent main-land" d="M98 338C104 252 173 202 266 221C328 144 438 150 507 218C606 211 674 273 650 377C730 453 670 570 540 548C474 626 340 610 303 523C205 535 91 475 98 338Z" />
          <path className="continent north-land" d="M585 106C660 42 780 68 825 148C904 165 934 250 877 315C806 394 677 360 628 286C565 250 526 157 585 106Z" />
          <path className="continent south-land" d="M681 475C724 406 839 412 894 480C949 546 903 640 805 636C713 632 635 552 681 475Z" />
          <path className="continent west-land" d="M68 122C133 64 245 78 294 145C337 204 279 281 196 278C102 274 16 197 68 122Z" />
          <path className="no-zone zone-one" d="M38 422C94 395 144 414 172 470C141 526 70 530 24 486Z" />
          <path className="no-zone zone-two" d="M432 72C501 38 565 52 598 111C550 166 456 154 415 112Z" />
          <path className="region-line" d="M195 252C314 318 472 302 604 244" />
          <path className="region-line" d="M226 486C360 431 492 438 625 514" />
          <path className="region-line" d="M650 210C724 244 811 236 877 194" />
          <path className="map-road-svg" d="M106 460C210 408 302 370 385 324C504 258 608 218 742 186" />
          <path className="map-road-svg secondary" d="M330 530C428 486 520 504 632 558C708 594 783 582 879 526" />
          <path className="map-road-svg secondary" d="M395 235C462 306 511 392 562 512" />
          <g className="mountain-set">
            <path d="M164 363l22-38 24 38Z" />
            <path d="M204 377l18-30 19 30Z" />
            <path d="M508 274l22-36 23 36Z" />
            <path d="M768 496l20-34 21 34Z" />
          </g>
          <g className="settlement-set">
            <circle cx="380" cy="306" r="14" />
            <circle cx="542" cy="498" r="12" />
            <circle cx="742" cy="194" r="11" />
            <circle cx="798" cy="548" r="10" />
          </g>
          <text className="map-big-label" x="392" y="338">九区城市带</text>
          <text className="map-big-label muted" x="660" y="172">北部军政带</text>
          <text className="map-big-label muted" x="704" y="522">边境战场带</text>
          <text className="map-small-label" x="85" y="456">无人区</text>
          <text className="map-small-label" x="468" y="98">待规划区</text>
          <rect className="map-noise" width="1000" height="680" filter="url(#paperNoise)" />
        </svg>
        {dataset.locations.map((location) => {
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
              <span>{location.name}</span>
            </button>
          );
        })}
      </div>
      <aside className="detail-panel">
        <p className="panel-label">当前地点</p>
        <h3>{selectedLocation.name}</h3>
        <p>{selectedLocation.summary}</p>
        <p className="atmosphere">{selectedLocation.atmosphere}</p>
        <div className="asset-prompt-card">
          <div className="asset-preview map-preview" aria-hidden="true">
            <span>待替换地图场景图</span>
          </div>
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
