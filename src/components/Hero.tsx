import type { NovelDataset } from "../types/novel";

export function Hero({ dataset, onNavigate }: { dataset: NovelDataset; onNavigate: (page: "map" | "characters") => void }) {
  return (
    <section id="top" className="hero-section">
      <div className="hero-cover-image" aria-hidden="true" />
      <div className="hero-cover-grade" aria-hidden="true" />
      <div className="hero-copy-block">
        <p className="hero-kicker">{dataset.title} · 冰封末世</p>
        <h1>灾变之后，秩序重写</h1>
        <p className="hero-copy">数十年冰封，资源殆尽。从待规划区到九区，一群人在极寒废土里争命、结盟、开战。</p>
        <div className="hero-actions">
          <a
            className="button primary"
            href="/map"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("map");
            }}
          >
            探索地图
          </a>
          <a
            className="button secondary"
            href="/characters"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("characters");
            }}
          >
            查看人物
          </a>
        </div>
      </div>
    </section>
  );
}
