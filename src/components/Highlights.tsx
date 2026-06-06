import { useEffect, useState } from "react";
import { FilmSlate, MapPin } from "@phosphor-icons/react";
import type { CharacterId, HighlightPhase, LocationId, NovelDataset } from "../types/novel";

const phaseMeta: Record<HighlightPhase, { label: string; tag: string; blurb: string }> = {
  turf: {
    label: "烽火街巷 · 地区争斗",
    tag: "初期",
    blurb: "买命求生、黑街立足、街面厮杀。秦禹在待规划区与松江的烂泥里，学会钱、权与人情如何决定生死。"
  },
  faction: {
    label: "棋局博弈 · 派系争斗",
    tag: "中后期",
    blurb: "从奉北棋局到落地川府、插旗盐岛、炮打南沪。江湖买卖升级为政治博弈，势力版图不断改写。"
  },
  war: {
    label: "铁血终局 · 战争残酷",
    tag: "终局",
    blurb: "马踏长吉、老三角屠杀、三十万北伐、巴尔城破、无名老兵战死北风口。战争的代价被写到骨子里。"
  }
};

const phaseOrder: HighlightPhase[] = ["turf", "faction", "war"];

function VideoSlot({ id, poster }: { id: string; poster: string }) {
  const [status, setStatus] = useState<"checking" | "ready" | "empty">("checking");
  const [posterOk, setPosterOk] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/videos/${id}.mp4`, { method: "HEAD" })
      .then((res) => {
        const type = res.headers.get("content-type") ?? "";
        const isVideo = res.ok && !type.includes("text/html");
        if (active) setStatus(isVideo ? "ready" : "empty");
      })
      .catch(() => {
        if (active) setStatus("empty");
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (status === "ready") {
    return (
      <video className="hl-video" controls preload="none" poster={posterOk ? poster : undefined}>
        <source src={`/videos/${id}.mp4`} type="video/mp4" />
      </video>
    );
  }

  return (
    <div className="hl-video-empty">
      {posterOk ? (
        <img
          className="hl-video-poster"
          src={poster}
          alt=""
          loading="lazy"
          onError={() => setPosterOk(false)}
        />
      ) : null}
      <div className="hl-video-badge">
        <FilmSlate size={24} weight="duotone" />
        <span>短视频位 · 待上传</span>
        <code>public/videos/{id}.mp4</code>
      </div>
    </div>
  );
}

export function Highlights({
  dataset,
  onSelectLocation,
  onSelectCharacter,
  onNavigate
}: {
  dataset: NovelDataset;
  onSelectLocation: (id: LocationId) => void;
  onSelectCharacter: (id: CharacterId) => void;
  onNavigate: (page: "map" | "characters") => void;
}) {
  const characterName = (id: CharacterId) =>
    dataset.characters.find((character) => character.id === id)?.name ?? id;
  const locationName = (id: LocationId) =>
    dataset.locations.find((location) => location.id === id)?.name ?? id;

  return (
    <div className="highlights">
      <div className="section-heading">
        <p className="section-kicker">重点情节</p>
        <h2>那些花了笔墨的名场面</h2>
        <p>
          从地区争斗到派系博弈，再到战争的残酷，挑出小说里最重要、最有分量的高光时刻。每个情节都预留了短视频位，
          把成片放进 <code>public/videos/</code> 即可自动嵌入。
        </p>
      </div>

      {phaseOrder.map((phase) => {
        const items = dataset.highlights.filter((highlight) => highlight.phase === phase);
        if (items.length === 0) return null;
        const meta = phaseMeta[phase];
        return (
          <section key={phase} className={`hl-phase hl-phase-${phase}`}>
            <header className="hl-phase-head">
              <span className="hl-phase-tag">{meta.tag}</span>
              <div>
                <h3>{meta.label}</h3>
                <p>{meta.blurb}</p>
              </div>
            </header>

            <div className="hl-cards">
              {items.map((highlight) => (
                <article key={highlight.id} className="hl-card">
                  <div className="hl-card-media">
                    <VideoSlot id={highlight.id} poster={`/scenes/${highlight.locationId}.png`} />
                  </div>
                  <div className="hl-card-body">
                    <div className="hl-card-top">
                      <span className="hl-chapter">{highlight.chapterRange.label}</span>
                      <h4>{highlight.title}</h4>
                    </div>
                    <p className="hl-hook">“{highlight.hook}”</p>
                    <p className="hl-desc">{highlight.description}</p>
                    <p className="hl-signif">
                      <strong>看点</strong>
                      {highlight.significance}
                    </p>
                    <div className="hl-meta">
                      <button
                        type="button"
                        className="hl-chip hl-chip-loc"
                        onClick={() => {
                          onSelectLocation(highlight.locationId);
                          onNavigate("map");
                        }}
                      >
                        <MapPin size={14} weight="fill" />
                        {locationName(highlight.locationId)}
                      </button>
                      {highlight.characterIds.map((id) => (
                        <button
                          key={id}
                          type="button"
                          className="hl-chip"
                          onClick={() => {
                            onSelectCharacter(id);
                            onNavigate("characters");
                          }}
                        >
                          {characterName(id)}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
