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

const columns = ["A", "B", "C", "D", "E", "F", "G", "H"];
const rows = ["1", "2", "3", "4", "5", "6"];

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
        <div className="map-grid" aria-hidden="true" />
        <div className="map-coords map-coords-x" aria-hidden="true">
          {columns.map((col) => (
            <span key={col}>{col}</span>
          ))}
        </div>
        <div className="map-coords map-coords-y" aria-hidden="true">
          {rows.map((row) => (
            <span key={row}>{row}</span>
          ))}
        </div>
        <div className="map-compass" aria-hidden="true">
          <Compass weight="duotone" size={26} />
          <span>N</span>
        </div>
        <div className="map-zone zone-northeast" aria-hidden="true">北部军政带</div>
        <div className="map-zone zone-center" aria-hidden="true">九区城市带</div>
        <div className="map-zone zone-southeast" aria-hidden="true">边境战场带</div>
        <div className="map-zone zone-west" aria-hidden="true">待规划无人区</div>

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
