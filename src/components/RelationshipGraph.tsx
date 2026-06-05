import type { CSSProperties } from "react";
import { getRelationshipsForCharacter } from "../lib/novelFilters";
import type { CharacterId, NovelDataset } from "../types/novel";

interface RelationshipGraphProps {
  dataset: NovelDataset;
  selectedCharacterId: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
}

const kindLabel: Record<string, string> = {
  brotherhood: "兄弟",
  family: "家族",
  romance: "情感",
  ally: "盟友",
  rival: "对手",
  mentor: "识才",
  enemy: "敌人",
  political: "政治"
};

const kindColor: Record<string, string> = {
  brotherhood: "#e6b15c",
  family: "#e07a3f",
  romance: "#e8688f",
  ally: "#6fae73",
  rival: "#d8a24a",
  mentor: "#7d9bd6",
  enemy: "#d6452f",
  political: "#b38bd0"
};

export function RelationshipGraph({ dataset, selectedCharacterId, onSelectCharacter }: RelationshipGraphProps) {
  const selectedRelations = getRelationshipsForCharacter(dataset, selectedCharacterId);
  const selectedCharacter = dataset.characters.find((character) => character.id === selectedCharacterId) ?? dataset.characters[0];

  const neighbors = selectedRelations
    .map((relationship) => {
      const otherId = relationship.source === selectedCharacterId ? relationship.target : relationship.source;
      const character = dataset.characters.find((item) => item.id === otherId);
      return character ? { character, relationship } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 8);

  const center = { x: 50, y: 50 };
  const placed = neighbors.map((item, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(neighbors.length, 1) - Math.PI / 2;
    const x = center.x + Math.cos(angle) * 36;
    const y = center.y + Math.sin(angle) * 34;
    return { ...item, x, y };
  });

  return (
    <div className="graph-card">
      <div className="graph-header">
        <h3>人物关系图</h3>
        <p>直连人物，点击切换焦点。</p>
      </div>
      <div className="relationship-flat" aria-label="人物关系图">
        <svg className="relationship-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {placed.map(({ relationship, x, y }) => (
            <line
              key={relationship.id}
              x1={center.x}
              y1={center.y}
              x2={x}
              y2={y}
              stroke={kindColor[relationship.kind] ?? "#e6b15c"}
              strokeWidth={0.55}
              strokeOpacity={0.55}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {placed.map(({ relationship, x, y }) => {
          const mx = (center.x + x) / 2;
          const my = (center.y + y) / 2;
          return (
            <span
              key={`tag-${relationship.id}`}
              className="relationship-edge-tag"
              style={{ left: `${mx}%`, top: `${my}%`, color: kindColor[relationship.kind] } as CSSProperties}
            >
              {kindLabel[relationship.kind]}
            </span>
          );
        })}

        <div className="relationship-anchor center" style={{ left: "50%", top: "50%" } as CSSProperties}>
          <div className="node-core is-center">
            <strong>{selectedCharacter.name}</strong>
            <small>{selectedCharacter.role}</small>
          </div>
        </div>

        {placed.map(({ character, relationship, x, y }, index) => (
          <div
            key={relationship.id}
            className="relationship-anchor"
            style={{ left: `${x}%`, top: `${y}%`, "--float-delay": `${index * 0.22}s` } as CSSProperties}
          >
            <button
              type="button"
              className="node-core"
              style={{ "--ring": kindColor[relationship.kind] } as CSSProperties}
              onClick={() => onSelectCharacter(character.id)}
            >
              <strong>{character.name}</strong>
              <small>{relationship.label}</small>
            </button>
          </div>
        ))}
      </div>
      <div className="legend-row">
        {Object.entries(kindLabel).map(([kind, label]) => (
          <span key={kind} className={`legend kind-${kind}`} style={{ "--ring": kindColor[kind] } as CSSProperties}>
            {label}
          </span>
        ))}
      </div>
      <div className="relationship-summary">
        {selectedRelations.slice(0, 6).map((relationship) => {
          const otherId = relationship.source === selectedCharacterId ? relationship.target : relationship.source;
          const other = dataset.characters.find((character) => character.id === otherId);
          return (
            <article key={relationship.id}>
              <strong>{relationship.label}</strong>
              <span>{other?.name}：{relationship.summary}</span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
