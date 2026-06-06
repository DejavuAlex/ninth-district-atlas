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

const kindLabel: Record<LocationNode["kind"], string> = {
  city: "城市",
  district: "辖区",
  street: "街区",
  wasteland: "废土",
  frontier: "边境",
  battlefield: "战场"
};

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
      <div className="map-figure" aria-label="第九特区全球地图">
        <img className="map-base" src="/scenes/world-map.png" alt="第九特区全球地图" />
        <div className="map-markers">
          {dataset.locations.map((location) => {
            const isSelected = location.id === selectedLocation.id;
            const isActive = activeLocationIds.includes(location.id);
            const isCharacterLocation = selectedCharacter?.locationIds.includes(location.id) ?? false;
            return (
              <button
                key={location.id}
                className={`map-pin ${isSelected ? "is-selected" : ""} ${isActive ? "is-active" : ""} ${
                  isCharacterLocation ? "is-character-location" : ""
                }`}
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
                aria-label={`查看${location.name}`}
                onClick={() => onSelectLocation(location.id)}
              >
                <span className="pin-dot" aria-hidden="true" />
                <span className="pin-label">{location.name}</span>
              </button>
            );
          })}
        </div>
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
