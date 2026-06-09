import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { getRelationshipsForCharacter } from "../lib/novelFilters";
import type { CharacterId, NovelDataset, Relationship } from "../types/novel";

interface RelationshipGraphProps {
  dataset: NovelDataset;
  selectedCharacterId: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
}

type Mode = "focus" | "network" | "tree";

const kindLabel: Record<string, string> = {
  brotherhood: "兄弟",
  family: "家族",
  romance: "情感",
  ally: "盟友",
  rival: "对手",
  mentor: "识才",
  enemy: "敌人",
  political: "政治",
  subordinate: "部属",
  comrade: "战友",
  friend: "旧识"
};

const kindColor: Record<string, string> = {
  brotherhood: "#e6b15c",
  family: "#e07a3f",
  romance: "#e8688f",
  ally: "#6fae73",
  rival: "#d8a24a",
  mentor: "#7d9bd6",
  enemy: "#d6452f",
  political: "#b38bd0",
  subordinate: "#5f9ea0",
  comrade: "#8fae5b",
  friend: "#c9a36a"
};

const modes: Array<{ id: Mode; label: string }> = [
  { id: "focus", label: "焦点关系" },
  { id: "network", label: "全员网络" },
  { id: "tree", label: "上下谱系" }
];

export function RelationshipGraph({ dataset, selectedCharacterId, onSelectCharacter }: RelationshipGraphProps) {
  const [mode, setMode] = useState<Mode>("focus");
  const selectedRelations = getRelationshipsForCharacter(dataset, selectedCharacterId);
  const selectedCharacter = dataset.characters.find((character) => character.id === selectedCharacterId) ?? dataset.characters[0];

  const otherOf = (relationship: Relationship) =>
    relationship.source === selectedCharacterId ? relationship.target : relationship.source;

  return (
    <div className="graph-card">
      <div className="graph-header">
        <h3>人物关系图</h3>
        <div className="graph-modes" role="tablist">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              className={mode === item.id ? "is-selected" : ""}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "focus" ? (
        <FocusView dataset={dataset} selectedCharacterId={selectedCharacterId} onSelectCharacter={onSelectCharacter} />
      ) : null}
      {mode === "network" ? (
        <NetworkView dataset={dataset} selectedCharacterId={selectedCharacterId} onSelectCharacter={onSelectCharacter} />
      ) : null}
      {mode === "tree" ? (
        <TreeView dataset={dataset} selectedCharacterId={selectedCharacterId} onSelectCharacter={onSelectCharacter} />
      ) : null}

      <div className="legend-row">
        {Object.entries(kindLabel).map(([kind, label]) => (
          <span key={kind} className="legend" style={{ "--ring": kindColor[kind] } as CSSProperties}>
            {label}
          </span>
        ))}
      </div>
      <div className="relationship-summary">
        {selectedRelations.slice(0, 6).map((relationship) => {
          const other = dataset.characters.find((character) => character.id === otherOf(relationship));
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

function FocusView({ dataset, selectedCharacterId, onSelectCharacter }: RelationshipGraphProps) {
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

  const placed = neighbors.map((item, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(neighbors.length, 1) - Math.PI / 2;
    return { ...item, x: 50 + Math.cos(angle) * 39, y: 50 + Math.sin(angle) * 37 };
  });

  return (
    <div className="relationship-flat" aria-label="焦点关系图">
      <svg className="relationship-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {placed.map(({ relationship, x, y }) => (
          <line
            key={relationship.id}
            x1={50}
            y1={50}
            x2={x}
            y2={y}
            stroke={kindColor[relationship.kind] ?? "#e6b15c"}
            strokeWidth={0.5}
            strokeOpacity={0.55}
            strokeDasharray="2 1.4"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {placed.map(({ relationship, x, y }) => (
        <span
          key={`tag-${relationship.id}`}
          className="relationship-edge-tag"
          style={{ left: `${(50 + x) / 2}%`, top: `${(50 + y) / 2}%`, color: kindColor[relationship.kind] } as CSSProperties}
        >
          {kindLabel[relationship.kind]}
        </span>
      ))}
      <div className="relationship-anchor" style={{ left: "50%", top: "50%" }}>
        <div className="node-core is-center">
          <strong>{selectedCharacter.name}</strong>
          <small>{selectedCharacter.role}</small>
        </div>
      </div>
      {placed.map(({ character, relationship, x, y }, index) => (
        <div key={relationship.id} className="relationship-anchor" style={{ left: `${x}%`, top: `${y}%` }}>
          <button
            type="button"
            className="node-core"
            style={{ "--ring": kindColor[relationship.kind], "--float-delay": `${index * 0.2}s` } as CSSProperties}
            onClick={() => onSelectCharacter(character.id)}
          >
            <span className="node-tag">{relationship.label}</span>
            <strong>{character.name}</strong>
            <small>{kindLabel[relationship.kind]}</small>
          </button>
        </div>
      ))}
    </div>
  );
}

function NetworkView({ dataset, selectedCharacterId, onSelectCharacter }: RelationshipGraphProps) {
  const factionColor = useMemo(
    () => new Map(dataset.factions.map((faction) => [faction.id, faction.color])),
    [dataset.factions]
  );

  const positions = useMemo(() => {
    const n = dataset.characters.length;
    const map = new Map<string, { x: number; y: number }>();
    dataset.characters.forEach((character, index) => {
      const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
      map.set(character.id, { x: 50 + Math.cos(angle) * 42, y: 50 + Math.sin(angle) * 42 });
    });
    return map;
  }, [dataset.characters]);

  const neighborIds = useMemo(() => {
    const ids = new Set<string>([selectedCharacterId]);
    getRelationshipsForCharacter(dataset, selectedCharacterId).forEach((relationship) => {
      ids.add(relationship.source);
      ids.add(relationship.target);
    });
    return ids;
  }, [dataset, selectedCharacterId]);

  return (
    <div className="relationship-network" aria-label="全员关系网络">
      <svg className="relationship-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {dataset.relationships.map((relationship) => {
          const a = positions.get(relationship.source);
          const b = positions.get(relationship.target);
          if (!a || !b) return null;
          const incident = relationship.source === selectedCharacterId || relationship.target === selectedCharacterId;
          return (
            <line
              key={relationship.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={incident ? kindColor[relationship.kind] ?? "#e06d3f" : "rgba(206,226,240,0.16)"}
              strokeWidth={incident ? 0.5 : 0.28}
              strokeDasharray="2 1.6"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      {dataset.characters.map((character) => {
        const point = positions.get(character.id);
        if (!point) return null;
        const isSelected = character.id === selectedCharacterId;
        const isNeighbor = neighborIds.has(character.id);
        return (
          <button
            key={character.id}
            type="button"
            className={`net-node ${isSelected ? "is-selected" : ""} ${isNeighbor ? "is-neighbor" : ""}`}
            style={{ left: `${point.x}%`, top: `${point.y}%`, "--ring": factionColor.get(character.factionIds[0] ?? "") ?? "#c45532" } as CSSProperties}
            onClick={() => onSelectCharacter(character.id)}
          >
            <span className="net-dot" />
            <span className="net-name">{character.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function TreeView({ dataset, selectedCharacterId, onSelectCharacter }: RelationshipGraphProps) {
  const selectedCharacter = dataset.characters.find((character) => character.id === selectedCharacterId) ?? dataset.characters[0];
  const relations = getRelationshipsForCharacter(dataset, selectedCharacterId);

  const groups = useMemo(() => {
    const byKind = new Map<string, Array<{ id: string; name: string; label: string }>>();
    relations.forEach((relationship) => {
      const otherId = relationship.source === selectedCharacterId ? relationship.target : relationship.source;
      const other = dataset.characters.find((item) => item.id === otherId);
      if (!other) return;
      const list = byKind.get(relationship.kind) ?? [];
      list.push({ id: other.id, name: other.name, label: relationship.label });
      byKind.set(relationship.kind, list);
    });
    return Array.from(byKind.entries());
  }, [dataset.characters, relations, selectedCharacterId]);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (kind: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });

  return (
    <div className="relationship-tree" aria-label="人物关系谱系">
      <div className="tree-root">
        <div className="node-core is-center">
          <strong>{selectedCharacter.name}</strong>
          <small>{selectedCharacter.role}</small>
        </div>
      </div>
      <div className="tree-trunk" aria-hidden="true" />
      <div className="tree-branches">
        {groups.map(([kind, people]) => {
          const isCollapsed = collapsed.has(kind);
          return (
            <div key={kind} className="tree-branch">
              <button
                type="button"
                className="branch-head"
                style={{ "--ring": kindColor[kind] } as CSSProperties}
                onClick={() => toggle(kind)}
                aria-expanded={!isCollapsed}
              >
                <span className="branch-dot" />
                {kindLabel[kind]}
                <span className="branch-count">{people.length}</span>
                <span className="branch-caret">{isCollapsed ? "+" : "−"}</span>
              </button>
              {!isCollapsed ? (
                <div className="branch-children">
                  {people.map((person) => (
                    <button key={person.id + kind} type="button" className="branch-person" onClick={() => onSelectCharacter(person.id)}>
                      <strong>{person.name}</strong>
                      <small>{person.label}</small>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
