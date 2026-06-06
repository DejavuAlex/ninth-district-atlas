import type { ArcId, CharacterId, LocationId, NovelDataset } from "../types/novel";

interface TimelineProps {
  dataset: NovelDataset;
  selectedArcId: ArcId;
  onSelectArc: (id: ArcId) => void;
  onSelectLocation: (id: LocationId) => void;
  onSelectCharacter: (id: CharacterId) => void;
}

export function Timeline({ dataset, selectedArcId, onSelectArc, onSelectLocation, onSelectCharacter }: TimelineProps) {
  const selectedIndex = Math.max(0, dataset.arcs.findIndex((arc) => arc.id === selectedArcId));
  const selectedArc = dataset.arcs[selectedIndex] ?? dataset.arcs[0];
  const events = dataset.events.filter((event) => selectedArc.keyEvents.includes(event.id));

  return (
    <div className="timeline-wrap">
      <div className="timeline-track" role="tablist" aria-label="剧情阶段">
        {dataset.arcs.map((arc, index) => (
          <button
            key={arc.id}
            type="button"
            role="tab"
            aria-selected={arc.id === selectedArc.id}
            className={`timeline-step ${arc.id === selectedArc.id ? "is-selected" : ""}`}
            onClick={() => onSelectArc(arc.id)}
          >
            <span className="step-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="step-range">{arc.chapterRange.label}</span>
            <strong className="step-title">{arc.title}</strong>
          </button>
        ))}
      </div>

      <div className="timeline-detail">
        <div className="timeline-detail-head">
          <p className="panel-label">
            第 {selectedIndex + 1} / {dataset.arcs.length} 阶段 · {selectedArc.chapterRange.label}
          </p>
          <h2>{selectedArc.title}</h2>
          <p>{selectedArc.summary}</p>
        </div>
        <div className="event-grid">
          {events.map((event) => {
            const location = dataset.locations.find((item) => item.id === event.locationId);
            return (
              <article key={event.id} className="event-card">
                <span className="event-range">{event.chapterRange.label}</span>
                <h3>{event.title}</h3>
                <p>{event.summary}</p>
                <p className="impact">{event.impact}</p>
                <div className="event-actions">
                  {location ? (
                    <button type="button" onClick={() => onSelectLocation(location.id)}>
                      {location.name}
                    </button>
                  ) : null}
                  {event.characterIds.slice(0, 3).map((id) => {
                    const character = dataset.characters.find((item) => item.id === id);
                    return character ? (
                      <button key={id} type="button" onClick={() => onSelectCharacter(id)}>
                        {character.name}
                      </button>
                    ) : null;
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
