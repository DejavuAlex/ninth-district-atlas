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

export function RelationshipGraph({ dataset, selectedCharacterId, onSelectCharacter }: RelationshipGraphProps) {
  const selectedRelations = getRelationshipsForCharacter(dataset, selectedCharacterId);
  const highlightedIds = new Set(selectedRelations.flatMap((relationship) => [relationship.source, relationship.target]));
  const center = { x: 50, y: 50 };
  const characters = dataset.characters.slice(0, 26);
  const positions = new Map(
    characters.map((character, index) => {
      if (character.id === selectedCharacterId) return [character.id, center];
      const angle = (Math.PI * 2 * index) / characters.length - Math.PI / 2;
      const radius = index % 2 === 0 ? 38 : 30;
      return [
        character.id,
        {
          x: 50 + Math.cos(angle) * radius,
          y: 50 + Math.sin(angle) * radius
        }
      ];
    })
  );

  return (
    <div className="graph-card">
      <div className="graph-header">
        <h3>人物关系图</h3>
        <p>选中人物后，只突出直接关系。</p>
      </div>
      <svg viewBox="0 0 100 100" role="img" aria-label="人物关系图">
        {dataset.relationships.map((relationship) => {
          const source = positions.get(relationship.source);
          const target = positions.get(relationship.target);
          if (!source || !target) return null;
          const isActive = relationship.source === selectedCharacterId || relationship.target === selectedCharacterId;
          return (
            <g key={relationship.id}>
              <line
                className={`graph-line ${isActive ? "is-active" : ""} kind-${relationship.kind}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
              />
              {isActive ? (
                <text className="graph-relation-label" x={(source.x + target.x) / 2} y={(source.y + target.y) / 2}>
                  {relationship.label}
                </text>
              ) : null}
            </g>
          );
        })}
        {characters.map((character) => {
          const point = positions.get(character.id) ?? center;
          const isSelected = character.id === selectedCharacterId;
          const isActive = highlightedIds.has(character.id);
          return (
            <g
              key={character.id}
              role="button"
              tabIndex={0}
              className={`graph-node ${isSelected ? "is-selected" : ""} ${isActive ? "is-active" : ""}`}
              transform={`translate(${point.x} ${point.y})`}
              onClick={() => onSelectCharacter(character.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onSelectCharacter(character.id);
              }}
            >
              <title>{character.name}，{character.role}</title>
              <circle r={isSelected ? 3.2 : 2.4} />
              <text y={isSelected ? -5 : -3.8}>{character.name}</text>
            </g>
          );
        })}
      </svg>
      <div className="legend-row">
        {Object.entries(kindLabel).map(([kind, label]) => (
          <span key={kind} className={`legend kind-${kind}`}>
            {label}
          </span>
        ))}
      </div>
      <div className="relationship-summary">
        {selectedRelations.slice(0, 8).map((relationship) => {
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
