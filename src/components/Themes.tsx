import type { NovelDataset } from "../types/novel";

interface ThemesProps {
  dataset: NovelDataset;
  onOpenArc: (arcId: string) => void;
}

export function Themes({ dataset, onOpenArc }: ThemesProps) {
  return (
    <div className="themes-layout">
      <div className="section-heading">
        <p className="section-kicker">小说立意</p>
        <h2>乱世之下，照见我们自己</h2>
        <p>
          《第九特区》写的是灾变后的废墟，照的却是任何时代里普通人的处境。下面是从全书提炼的六层立意，
          每一条都连着一个故事阶段，也连着一点能带走的思考。
        </p>
      </div>
      <div className="themes-grid">
        {dataset.themes.map((theme, index) => {
          const arc = dataset.arcs.find((item) => item.id === theme.anchor);
          return (
            <article key={theme.id} className="theme-card">
              <span className="theme-index">{String(index + 1).padStart(2, "0")}</span>
              {theme.quote ? (
                <blockquote className="theme-quote">
                  <p>{theme.quote}</p>
                  {theme.quoteContext ? <cite>{theme.quoteContext}</cite> : null}
                </blockquote>
              ) : null}
              <h3>{theme.title}</h3>
              <p className="theme-insight">{theme.insight}</p>
              {theme.extraQuotes?.length ? (
                <div className="theme-extra-quotes" aria-label={`${theme.title}补充原文`}>
                  {theme.extraQuotes.map((item) => (
                    <blockquote key={item.quote}>
                      <p>{item.quote}</p>
                      <cite>{item.context}</cite>
                    </blockquote>
                  ))}
                </div>
              ) : null}
              <p className="theme-detail">{theme.detail}</p>
              {arc ? (
                <button type="button" className="theme-link" onClick={() => onOpenArc(arc.id)}>
                  对应阶段 · {arc.title}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
      <div className="themes-closing">
        <p>
          如果说这部书留下一句话，大概是：再大的厮杀，最终都是为了让普通人能等到天亮。
          愿你合上它的时候，对自己所处的“秩序”多一分珍惜，对身边愿意替你守夜的人多一分在意。
        </p>
      </div>
    </div>
  );
}
