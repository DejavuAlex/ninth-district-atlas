import type { NovelDataset } from "../types/novel";

export function Hero({ dataset }: { dataset: NovelDataset }) {
  return (
    <section id="top" className="hero-section">
      <div className="hero-copy-block">
        <p className="hero-kicker">{dataset.title}</p>
        <h1>灾变之后，秩序重写</h1>
        <p className="hero-copy">从待规划区到九区，一群人在乱世里争命、结盟、开战。</p>
        <div className="hero-actions">
          <a className="button primary" href="#map">
            探索地图
          </a>
          <a className="button secondary" href="#characters">
            查看人物
          </a>
        </div>
      </div>
      <div className="hero-map-card" aria-label="小说设定概览">
        <div className="map-radar" />
        <div className="hero-node node-a">待规划区</div>
        <div className="hero-node node-b">松江</div>
        <div className="hero-node node-c">川府</div>
        <div className="hero-node node-d">北伐</div>
        <div className="route-line line-one" />
        <div className="route-line line-two" />
        <div className="route-line line-three" />
      </div>
    </section>
  );
}
