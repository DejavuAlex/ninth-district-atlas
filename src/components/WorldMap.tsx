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

const STEP_MS = 2400;

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
  const journeyOptions = useMemo(
    () =>
      dataset.journeys?.length
        ? dataset.journeys
        : [
            {
              id: "qin-yu-rise",
              characterId: "qin-yu",
              label: "秦禹 · 崛起之路",
              description: "从无人区发家，一路到松江、黑街，直到落地川府的崛起轨迹。",
              stops: dataset.journey
            }
          ],
    [dataset.journey, dataset.journeys]
  );
  const [selectedJourneyId, setSelectedJourneyId] = useState(journeyOptions[0]?.id ?? "qin-yu-rise");
  const [mapExpanded, setMapExpanded] = useState(false);
  const selectedJourney = journeyOptions.find((journey) => journey.id === selectedJourneyId) ?? journeyOptions[0];

  const routePoints = useMemo(
    () =>
      selectedJourney.stops
        .map((stop) => {
          const loc = dataset.locations.find((location) => location.id === stop.locationId);
          return loc ? { ...stop, x: loc.x, y: loc.y, name: loc.name } : null;
        })
        .filter((point): point is NonNullable<typeof point> => point !== null),
    [dataset.locations, selectedJourney.stops]
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
  const selectJourney = (id: string) => {
    setSelectedJourneyId(id);
    setPlaying(false);
    setStep(-1);
  };

  useEffect(() => {
    if (!mapExpanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMapExpanded(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [mapExpanded]);

  const routeActive = step >= 0;
  const clampedStep = Math.min(step, routePoints.length - 1);
  const current = routeActive ? routePoints[clampedStep] : null;
  const journeyLocationIds = new Set(routePoints.map((point) => point.locationId));
  const traveler = selectedJourney ? getCharacterById(dataset, selectedJourney.characterId) : null;

  const renderMapFigure = (mode: "inline" | "expanded") => (
    <div
      className={`map-figure ${mode === "expanded" ? "is-expanded-map" : ""}`}
      aria-label="第九特区全球地图"
      onClick={
        mode === "inline"
          ? (event) => {
              const target = event.target as HTMLElement;
              if (target.closest(".map-pin") && window.innerWidth > 640) return;
              setMapExpanded(true);
            }
          : undefined
      }
    >
      {mode === "inline" ? <span className="map-expand-hint">点按地图横屏查看</span> : null}
      <img className="map-base" src="/scenes/world-map.webp" alt="第九特区全球地图" />
      <div className="map-markers">
        {dataset.locations.map((location) => {
          const isSelected = location.id === selectedLocation.id;
          const isActive = activeLocationIds.includes(location.id);
          const isCharacterLocation = selectedCharacter?.locationIds.includes(location.id) ?? false;
          const isJourney = routeActive && journeyLocationIds.has(location.id);
          const isJourneyCurrent = current?.locationId === location.id;
          return (
            <button
              key={`${mode}-${location.id}`}
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
          <img
            className="route-traveler-img"
            src={`/portraits/${selectedJourney.characterId}.webp`}
            alt=""
            onError={(event) => ((event.target as HTMLImageElement).style.display = "none")}
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="world-map-layout">
      <div className="journey-selector" aria-label="人物路线选择">
        {journeyOptions.map((journey) => (
          <button
            key={journey.id}
            type="button"
            className={journey.id === selectedJourney.id ? "is-selected" : ""}
            onClick={() => selectJourney(journey.id)}
          >
            {journey.label}
          </button>
        ))}
      </div>
      <div className="route-controls">
        <button type="button" className="route-play-btn" onClick={routeActive && playing ? clearJourney : startJourney}>
          {routeActive && playing ? <PathIcon size={18} weight="fill" /> : <Play size={18} weight="fill" />}
          {routeActive ? (playing ? `${traveler?.name ?? "人物"}路线播放中…` : "重新播放人物路线") : `播放${traveler?.name ?? "人物"}的路线`}
        </button>
        {routeActive ? (
          <div className="route-caption">
            <span className="route-step-index">
              {clampedStep + 1}/{routePoints.length}
            </span>
            <div>
              <strong>{current?.title}</strong>
              <small>{current?.caption}</small>
              <em className="route-legend">跟随{traveler?.name ?? "人物"}的头像，依次抵达这条人物命运线</em>
            </div>
            <button type="button" className="route-clear" onClick={clearJourney} aria-label="关闭路线">
              <X size={14} weight="bold" />
            </button>
          </div>
        ) : (
          <p className="route-hint">{selectedJourney.description}</p>
        )}
      </div>

      {renderMapFigure("inline")}
      {mapExpanded ? (
        <div className="map-fullscreen" role="dialog" aria-modal="true" aria-label="横屏查看第九特区地图">
          <div className="map-fullscreen-toolbar">
            <span>横屏地图 · 可点选地点</span>
            <button type="button" onClick={() => setMapExpanded(false)} aria-label="关闭横屏地图">
              <X size={18} weight="bold" />
            </button>
          </div>
          <div className="map-fullscreen-stage">{renderMapFigure("expanded")}</div>
        </div>
      ) : null}


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
              zoomable
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
