import { getRelationshipsForCharacter } from "../lib/novelFilters";
import type { CSSProperties } from "react";
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

export function RelationshipGraph({ dataset, selectedCharacterId, onSelectCharacter }: RelationshipGraphProps) {
  const selectedRelations = getRelationshipsForCharacter(dataset, selectedCharacterId);
  const selectedCharacter = dataset.characters.find((character) => character.id === selectedCharacterId) ?? dataset.characters[0];
  const directCharacters = selectedRelations
    .map((relationship) => {
      const otherId = relationship.source === selectedCharacterId ? relationship.target : relationship.source;
      const character = dataset.characters.find((item) => item.id === otherId);
      return character ? { character, relationship } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 8);

  const count = directCharacters.length;
  const nodes = directCharacters.map((item, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(count, 1) - Math.PI / 2;
    const x = 50 + Math.cos(angle) * 38;
    const y = 50 + Math.sin(angle) * 36;
    return { ...item, x, y };
  });

  return (
    <div className="graph-card">
      <div className="graph-header">
        <h3>人物关系图</h3>
        <p>直连人物，关系标签更清楚。</p>
      </div>
      <div className="relationship-board" aria-label="人物关系图">
        <svg className="relationship-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {nodes.map(({ relationship, x, y }) => (
            <line
              key={relationship.id}
              className={`relationship-link kind-${relationship.kind}`}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
            />
          ))}
        </svg>
        <div className="center-character-card">
          <span>当前人物</span>
          <strong>{selectedCharacter.name}</strong>
          <small>{selectedCharacter.role}</small>
        </div>
        {nodes.map(({ character, relationship, x, y }, index) => (
          <div
            key={relationship.id}
            className="relationship-anchor"
            style={{ left: `${x}%`, top: `${y}%` } as CSSProperties}
          >
            <button
              type="button"
              className={`relationship-node relation-${relationship.kind}`}
              style={{ "--float-delay": `${index * 0.2}s` } as CSSProperties}
              onClick={() => onSelectCharacter(character.id)}
            >
              <span className="node-tag">{relationship.label}</span>
              <strong>{character.name}</strong>
              <small>{kindLabel[relationship.kind]}</small>
            </button>
          </div>
        ))}
      </div>
      <div className="legend-row">
        {Object.entries(kindLabel).map(([kind, label]) => (
          <span key={kind} className={`legend kind-${kind}`}>
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
