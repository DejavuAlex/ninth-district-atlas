import { Suspense, lazy } from "react";
import { GraphErrorBoundary } from "./GraphErrorBoundary";
import { getRelationshipsForCharacter } from "../lib/novelFilters";
import type { CharacterId, NovelDataset } from "../types/novel";

const RelationshipGraph3D = lazy(() => import("./RelationshipGraph3D"));

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

  return (
    <div className="graph-card">
      <div className="graph-header">
        <h3>人物关系图</h3>
        <p>直连人物，拖拽可旋转，滚轮缩放。</p>
      </div>
      <div className="graph-3d-shell" aria-label="三维人物关系图">
        <GraphErrorBoundary fallback={<div className="graph-loading">三维关系图无法在当前环境加载，可参考下方关系列表。</div>}>
          <Suspense fallback={<div className="graph-loading">正在加载三维关系图...</div>}>
            <RelationshipGraph3D
              dataset={dataset}
              selectedCharacterId={selectedCharacterId}
              onSelectCharacter={onSelectCharacter}
            />
          </Suspense>
        </GraphErrorBoundary>
        <div className="graph-focus-chip">
          <span>聚焦</span>
          <strong>{selectedCharacter.name}</strong>
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
