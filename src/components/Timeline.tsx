import type { ArcId, CharacterId, LocationId, NovelDataset } from "../types/novel";

interface TimelineProps {
  dataset: NovelDataset;
  selectedArcId: ArcId;
  onSelectArc: (id: ArcId) => void;
  onSelectLocation: (id: LocationId) => void;
  onSelectCharacter: (id: CharacterId) => void;
}

export function Timeline({ dataset, selectedArcId, onSelectArc, onSelectLocation, onSelectCharacter }: TimelineProps) {
  const selectedArc = dataset.arcs.find((arc) => arc.id === selectedArcId) ?? dataset.arcs[0];
  const events = dataset.events.filter((event) => selectedArc.keyEvents.includes(event.id));

  return (
    <div className="timeline-layout">
      <div className="timeline-rail" aria-label="剧情阶段">
        {dataset.arcs.map((arc) => (
          <button
            key={arc.id}
            type="button"
            className={arc.id === selectedArc.id ? "is-selected" : ""}
            onClick={() => onSelectArc(arc.id)}
          >
            <span>{arc.chapterRange.label}</span>
            <strong>{arc.title}</strong>
          </button>
        ))}
      </div>
      <div className="timeline-detail">
        <p className="panel-label">当前阶段</p>
        <h2>{selectedArc.title}</h2>
        <p>{selectedArc.summary}</p>
        <div className="event-grid">
          {events.map((event) => {
            const location = dataset.locations.find((item) => item.id === event.locationId);
            return (
              <article key={event.id} className="event-card">
                <span>{event.chapterRange.label}</span>
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
