import { useMemo, useState } from "react";
import { AssetImage } from "./AssetImage";
import { getRelationshipsForCharacter, searchNovel } from "../lib/novelFilters";
import type { CharacterId, FactionId, NovelDataset } from "../types/novel";

interface CharacterPanelProps {
  dataset: NovelDataset;
  selectedCharacterId: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
}

export function CharacterPanel({ dataset, selectedCharacterId, onSelectCharacter }: CharacterPanelProps) {
  const [query, setQuery] = useState("");
  const [factionId, setFactionId] = useState<FactionId>("all");
  const selectedCharacter = dataset.characters.find((character) => character.id === selectedCharacterId) ?? dataset.characters[0];
  const primaryFaction = dataset.factions.find((faction) => faction.id === selectedCharacter.factionIds[0]);
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
        <div className="portrait-layout">
          <AssetImage
            src={`/portraits/${selectedCharacter.id}.png`}
            alt={`${selectedCharacter.name}形象`}
            placeholder="形象图待生成"
            variant="portrait"
          />
          <div className="portrait-text">
            <p>{selectedCharacter.profile}</p>
            <div className="chip-row">
              {selectedCharacter.traits.map((trait) => (
                <span key={trait}>{trait}</span>
              ))}
            </div>
          </div>
        </div>
        <p>{selectedCharacter.story}</p>
        <dl className="profile-meta">
          <div>
            <dt>首次出现</dt>
            <dd>{selectedCharacter.firstSeen.label}</dd>
          </div>
          <div>
            <dt>主要势力</dt>
            <dd>{primaryFaction?.name ?? "未明"}</dd>
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
