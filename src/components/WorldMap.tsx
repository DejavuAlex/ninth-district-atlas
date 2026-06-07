import { useEffect, useMemo, useState } from "react";
import { Play, Path as PathIcon, X } from "@phosphor-icons/react";
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

const STEP_MS = 1400;

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

  const routePoints = useMemo(
    () =>
      dataset.journey
        .map((stop) => {
          const loc = dataset.locations.find((location) => location.id === stop.locationId);
          return loc ? { ...stop, x: loc.x, y: loc.y, name: loc.name } : null;
        })
        .filter((point): point is NonNullable<typeof point> => point !== null),
    [dataset.journey, dataset.locations]
  );

  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (step >= routePoints.length - 1) {
      const done = setTimeout(() => setPlaying(false), STEP_MS);
      return () => clearTimeout(done);
    }
    const next = setTimeout(() => setStep((value) => value + 1), STEP_MS);
    return () => clearTimeout(next);
  }, [playing, step, routePoints.length]);

  const startJourney = () => {
    setStep(0);
    setPlaying(true);
  };
  const clearJourney = () => {
    setPlaying(false);
    setStep(-1);
  };

  const routeActive = step >= 0;
  const clampedStep = Math.min(step, routePoints.length - 1);
  const current = routeActive ? routePoints[clampedStep] : null;
  const journeyLocationIds = new Set(routePoints.map((point) => point.locationId));
  const pathD = routePoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const totalSegments = Math.max(1, routePoints.length - 1);
  const traveledPercent = routeActive ? (clampedStep / totalSegments) * 100 : 0;

  return (
    <div className="world-map-layout">
      <div className="route-controls">
        <button type="button" className="route-play-btn" onClick={routeActive && playing ? clearJourney : startJourney}>
          {routeActive && playing ? <PathIcon size={18} weight="fill" /> : <Play size={18} weight="fill" />}
          {routeActive ? (playing ? "崛起之路播放中…" : "重新播放崛起之路") : "播放秦禹的崛起之路"}
        </button>
        {routeActive ? (
          <div className="route-caption">
            <span className="route-step-index">
              {clampedStep + 1}/{routePoints.length}
            </span>
            <div>
              <strong>{current?.title}</strong>
              <small>{current?.caption}</small>
              <em className="route-legend">金色轨迹 = 秦禹一路走过的路线</em>
            </div>
            <button type="button" className="route-clear" onClick={clearJourney} aria-label="关闭路线">
              <X size={14} weight="bold" />
            </button>
          </div>
        ) : (
          <p className="route-hint">从无人区发家，一路到松江、黑街，直到落地川府的崛起轨迹。</p>
        )}
      </div>

      <div className="map-figure" aria-label="第九特区全球地图">
        <img className="map-base" src="/scenes/world-map.webp" alt="第九特区全球地图" />
        {routeActive ? (
          <svg className="map-route is-on" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path
              className="route-line"
              d={pathD}
              pathLength={100}
              vectorEffect="non-scaling-stroke"
              style={{ strokeDashoffset: 100 - traveledPercent }}
            />
          </svg>
        ) : null}
        <div className="map-markers">
          {dataset.locations.map((location) => {
            const isSelected = location.id === selectedLocation.id;
            const isActive = activeLocationIds.includes(location.id);
            const isCharacterLocation = selectedCharacter?.locationIds.includes(location.id) ?? false;
            const isJourney = routeActive && journeyLocationIds.has(location.id);
            const isJourneyCurrent = current?.locationId === location.id;
            return (
              <button
                key={location.id}
                className={`map-pin ${isSelected ? "is-selected" : ""} ${isActive ? "is-active" : ""} ${
                  isCharacterLocation ? "is-character-location" : ""
                } ${isJourney ? "is-journey" : ""} ${isJourneyCurrent ? "is-journey-current" : ""}`}
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
        {current ? (
          <div className="route-traveler" style={{ left: `${current.x}%`, top: `${current.y}%` }}>
            <img className="route-traveler-img" src="/portraits/qin-yu.webp" alt="" onError={(event) => ((event.target as HTMLImageElement).style.display = "none")} />
          </div>
        ) : null}
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
              src={`/scenes/${selectedLocation.id}.webp`}
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
