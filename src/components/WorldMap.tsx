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
        <div className="map-grid-lines" />
        <div className="map-region region-north">北部军政带</div>
        <div className="map-region region-core">九区城市带</div>
        <div className="map-region region-border">边境战场带</div>
        <div className="map-road road-a" />
        <div className="map-road road-b" />
        <div className="map-road road-c" />
        <div className="map-boundary boundary-a" />
        <div className="map-boundary boundary-b" />
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
