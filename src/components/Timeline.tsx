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
  const eventIds = new Set(selectedArc.keyEvents);
  dataset.events.forEach((event) => {
    const isInsideArc =
      event.chapterRange.startOrder >= selectedArc.chapterRange.startOrder &&
      event.chapterRange.startOrder <= selectedArc.chapterRange.endOrder;
    if (event.quote && isInsideArc) eventIds.add(event.id);
  });
  const events = dataset.events
    .filter((event) => eventIds.has(event.id))
    .sort((a, b) => a.chapterRange.startOrder - b.chapterRange.startOrder);

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
          <p className="timeline-note">已补入本阶段可核验的原文摘录节点，让时间线不只看剧情转折，也能看到原文最有力量的句子。</p>
        </div>
        <div className="event-grid">
          {events.map((event) => {
            const location = dataset.locations.find((item) => item.id === event.locationId);
            return (
              <article key={event.id} className="event-card">
                <span className="event-range">{event.chapterRange.label}</span>
                <h3>{event.title}</h3>
                <p>{event.summary}</p>
                {event.quote ? (
                  <blockquote className="event-quote">
                    <p>{event.quote}</p>
                    {event.quoteContext ? <cite>{event.quoteContext}</cite> : null}
                  </blockquote>
                ) : null}
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
