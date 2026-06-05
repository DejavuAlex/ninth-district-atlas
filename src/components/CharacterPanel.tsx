import { useMemo, useState } from "react";
import { getRelationshipsForCharacter, searchNovel } from "../lib/novelFilters";
import type { ArcId, CharacterId, FactionId, NovelDataset } from "../types/novel";

interface CharacterPanelProps {
  dataset: NovelDataset;
  selectedCharacterId: CharacterId;
  selectedArcId: ArcId;
  onSelectCharacter: (id: CharacterId) => void;
}

export function CharacterPanel({ dataset, selectedCharacterId, selectedArcId, onSelectCharacter }: CharacterPanelProps) {
  const [query, setQuery] = useState("");
  const [factionId, setFactionId] = useState<FactionId>("all");
  const selectedCharacter = dataset.characters.find((character) => character.id === selectedCharacterId) ?? dataset.characters[0];
  const selectedArc = dataset.arcs.find((arc) => arc.id === selectedArcId);
  const searchResult = searchNovel(dataset, query);

  const visibleCharacters = useMemo(() => {
    const base = query.trim() ? searchResult.characters : dataset.characters;
    return base.filter((character) => factionId === "all" || character.factionIds.includes(factionId));
  }, [dataset.characters, factionId, query, searchResult.characters]);

  const relationships = getRelationshipsForCharacter(dataset, selectedCharacter.id);

  return (
    <div className="character-panel">
      <div className="field-group">
        <label htmlFor="character-search">搜索人物、别名或身份</label>
        <input
          id="character-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例如：秦老黑、马老二、孟玺"
        />
      </div>
      <div className="filter-row" aria-label="势力筛选">
        <button className={factionId === "all" ? "is-selected" : ""} type="button" onClick={() => setFactionId("all")}>
          全部
        </button>
        {dataset.factions.slice(0, 8).map((faction) => (
          <button
            key={faction.id}
            className={factionId === faction.id ? "is-selected" : ""}
            type="button"
            onClick={() => setFactionId(faction.id)}
          >
            {faction.name}
          </button>
        ))}
      </div>
      <div className="character-list" aria-label="人物列表">
        {visibleCharacters.map((character) => (
          <button
            key={character.id}
            type="button"
            className={character.id === selectedCharacter.id ? "is-selected" : ""}
            onClick={() => onSelectCharacter(character.id)}
          >
            <strong>{character.name}</strong>
            <span>{character.role}</span>
          </button>
        ))}
      </div>
      <article className="profile-card">
        <p className="panel-label">人物档案</p>
        <h3>{selectedCharacter.name}</h3>
        <p className="role-line">{selectedCharacter.role}</p>
        <div className="portrait-prompt-layout">
          <div className="asset-preview portrait-preview" aria-hidden="true">
            <span>待替换人物形象图</span>
          </div>
          <div className="asset-prompt-card compact">
            <h4>人物形象提示词</h4>
            <p>{selectedCharacter.imagePrompt}</p>
          </div>
        </div>
        <p>{selectedCharacter.profile}</p>
        <p>{selectedCharacter.story}</p>
        <div className="chip-row">
          {selectedCharacter.traits.map((trait) => (
            <span key={trait}>{trait}</span>
          ))}
        </div>
        <dl className="profile-meta">
          <div>
            <dt>首次出现</dt>
            <dd>{selectedCharacter.firstSeen.label}</dd>
          </div>
          <div>
            <dt>当前阶段</dt>
            <dd>{selectedArc?.title ?? "全书"}</dd>
          </div>
        </dl>
        <div className="mini-list">
          <h4>直接关系</h4>
          {relationships.slice(0, 6).map((relationship) => {
            const otherId = relationship.source === selectedCharacter.id ? relationship.target : relationship.source;
            const other = dataset.characters.find((item) => item.id === otherId);
            return (
              <article key={relationship.id}>
                <strong>{relationship.label}</strong>
                <small>{other?.name}：{relationship.summary}</small>
              </article>
            );
          })}
        </div>
      </article>
    </div>
  );
}
