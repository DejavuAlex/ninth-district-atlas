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
  const [isMobilePickerOpen, setIsMobilePickerOpen] = useState(false);
  const selectedCharacter = dataset.characters.find((character) => character.id === selectedCharacterId) ?? dataset.characters[0];
  const primaryFaction = dataset.factions.find((faction) => faction.id === selectedCharacter.factionIds[0]);
  const searchResult = searchNovel(dataset, query);

  const visibleCharacters = useMemo(() => {
    const base = query.trim() ? searchResult.characters : dataset.characters;
    return base.filter((character) => factionId === "all" || character.factionIds.includes(factionId));
  }, [dataset.characters, factionId, query, searchResult.characters]);

  const mainCharacters = useMemo(
    () => visibleCharacters.filter((character) => character.tier !== "supporting"),
    [visibleCharacters]
  );
  const supportingCharacters = useMemo(
    () => visibleCharacters.filter((character) => character.tier === "supporting"),
    [visibleCharacters]
  );

  const relationships = getRelationshipsForCharacter(dataset, selectedCharacter.id);
  const featuredCharacterIds: CharacterId[] = ["qin-yu", "qi-lin", "lao-mao", "ma-lao-er", "wu-tianyin", "feng-yunian", "ke-ke", "ye-zixiao", "xiao-qi"];
  const featuredCharacters = featuredCharacterIds
    .map((id) => dataset.characters.find((character) => character.id === id))
    .filter((character): character is NonNullable<typeof character> => Boolean(character));
  const selectCharacter = (id: CharacterId) => {
    onSelectCharacter(id);
    setIsMobilePickerOpen(false);
  };

  return (
    <div className="character-panel">
      <button type="button" className="mobile-character-picker-trigger" onClick={() => setIsMobilePickerOpen(true)}>
        换人物
        <span>{selectedCharacter.name}</span>
      </button>
      <div className="mobile-featured-strip" aria-label="常看人物快捷选择">
        {featuredCharacters.map((character) => (
          <button
            key={character.id}
            type="button"
            className={character.id === selectedCharacter.id ? "is-selected" : ""}
            onClick={() => selectCharacter(character.id)}
          >
            {character.name}
          </button>
        ))}
      </div>
      <div className="character-picker-content">
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
        <div className="character-groups" aria-label="人物列表">
        {[
          { key: "main", title: "主要人物", hint: "有专属立绘", list: mainCharacters },
          { key: "supporting", title: "次要人物", hint: "仅文字介绍", list: supportingCharacters }
        ].map((group) =>
          group.list.length === 0 ? null : (
            <section key={group.key} className="character-group">
              <p className={`list-section-head is-${group.key}`}>
                <span className="lsh-title">{group.title}</span>
                <span className="lsh-count">{group.list.length}</span>
                <small>{group.hint}</small>
              </p>
              <div className={`character-list ${group.key === "supporting" ? "is-supporting-grid" : ""}`}>
                {group.list.map((character) => {
                  const classes = [
                    character.id === selectedCharacter.id ? "is-selected" : "",
                    character.tier === "supporting" ? "is-supporting" : "is-main"
                  ].filter(Boolean).join(" ");
                  return (
                   <button key={character.id} type="button" className={classes} onClick={() => selectCharacter(character.id)}>
                      <strong>
                        {character.name}
                        <span className={`tier-badge ${character.tier === "supporting" ? "is-supporting" : "is-main"}`}>
                          {character.tier === "supporting" ? "次要" : "主要"}
                        </span>
                      </strong>
                      <span>{character.role}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )
        )}
        </div>
      </div>
      <article className="profile-card">
        <p className="panel-label">人物档案 · {selectedCharacter.tier === "main" ? "主要人物" : "次要人物"}</p>
        <h3>{selectedCharacter.name}</h3>
        <p className="role-line">{selectedCharacter.role}</p>
        {selectedCharacter.tier === "main" ? (
          <div className="portrait-layout">
            <AssetImage
              src={`/portraits/${selectedCharacter.id}.webp`}
              alt={`${selectedCharacter.name}形象`}
              placeholder="形象图待生成"
              variant="portrait"
              zoomable
              motionSrc={selectedCharacter.id === "qin-yu" ? "/portraits-motion/qin-yu.webm" : undefined}
              motionFallbackSrc={selectedCharacter.id === "qin-yu" ? "/portraits-motion/qin-yu.mp4" : undefined}
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
        ) : (
          <div className="supporting-intro">
            <p>{selectedCharacter.profile}</p>
            <div className="chip-row">
              {selectedCharacter.traits.map((trait) => (
                <span key={trait}>{trait}</span>
              ))}
            </div>
          </div>
        )}
        <p>{selectedCharacter.story}</p>
        {selectedCharacter.quote ? (
          <blockquote className="character-quote">
            <p>{selectedCharacter.quote}</p>
            {selectedCharacter.quoteContext ? <cite>{selectedCharacter.quoteContext}</cite> : null}
          </blockquote>
        ) : null}
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
      {isMobilePickerOpen ? (
        <div className="mobile-character-drawer-backdrop" onClick={() => setIsMobilePickerOpen(false)}>
          <div className="mobile-character-drawer" role="dialog" aria-modal="true" aria-label="选择人物" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-drawer-head">
              <strong>选择人物</strong>
              <button type="button" onClick={() => setIsMobilePickerOpen(false)} aria-label="关闭人物选择">
                关闭
              </button>
            </div>
            <label className="mobile-drawer-search">
              <span>搜索人物</span>
              <input
                aria-label="抽屉内搜索人物"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="输入姓名、别名或身份"
                autoFocus
              />
            </label>
            <div className="mobile-drawer-featured" aria-label="主角团快捷选择">
              {featuredCharacters.map((character) => (
                <button
                  key={character.id}
                  type="button"
                  className={character.id === selectedCharacter.id ? "is-selected" : ""}
                  onClick={() => selectCharacter(character.id)}
                >
                  <span className="drawer-avatar" style={{ backgroundImage: `url(/portraits/${character.id}.webp)` }} aria-hidden="true" />
                  {character.name}
                </button>
              ))}
            </div>
            <div className="mobile-drawer-list">
              {mainCharacters.concat(supportingCharacters).map((character) => (
                <button key={character.id} type="button" className={character.id === selectedCharacter.id ? "is-selected" : ""} onClick={() => selectCharacter(character.id)}>
                  <strong>{character.name}</strong>
                  <small>{character.role}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
