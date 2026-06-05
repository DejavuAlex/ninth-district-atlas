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
    .slice(0, 10);

  return (
    <div className="graph-card">
      <div className="graph-header">
        <h3>人物关系图</h3>
        <p>直连人物，关系标签更清楚。</p>
      </div>
      <div className="relationship-board" aria-label="人物关系图">
        <div className="center-character-card">
          <span>当前人物</span>
          <strong>{selectedCharacter.name}</strong>
          <small>{selectedCharacter.role}</small>
        </div>
        <div className="direct-relationship-cloud">
          {directCharacters.map(({ character, relationship }, index) => (
            <button
              key={relationship.id}
              type="button"
              className={`relationship-node relation-${relationship.kind}`}
              style={{ "--float-delay": `${index * 0.18}s` } as CSSProperties}
              onClick={() => onSelectCharacter(character.id)}
            >
              <span>{relationship.label}</span>
              <strong>{character.name}</strong>
              <small>{kindLabel[relationship.kind]}：{relationship.summary}</small>
            </button>
          ))}
        </div>
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
