import { useEffect, useMemo, useState } from "react";
import type { ArcId, NovelDataset } from "../types/novel";

interface ChapterMeta {
  id: string;
  order: number;
  line: number;
  heading: string;
  title: string;
}

export function SourceCoverage({ dataset, selectedArcId }: { dataset: NovelDataset; selectedArcId: ArcId }) {
  const [chapters, setChapters] = useState<ChapterMeta[]>([]);

  useEffect(() => {
    import("../data/chapterIndex.generated.json").then((module) => {
      setChapters(module.default as ChapterMeta[]);
    });
  }, []);

  const arc = dataset.arcs.find((item) => item.id === selectedArcId) ?? dataset.arcs[0];
  const picks = useMemo(() => {
    const arcChapters = chapters.filter(
      (chapter) => chapter.order >= arc.chapterRange.startOrder && chapter.order <= arc.chapterRange.endOrder
    );
    return [arcChapters[0], arcChapters[Math.floor(arcChapters.length / 2)], arcChapters.at(-1)].filter(
      (chapter): chapter is ChapterMeta => Boolean(chapter)
    );
  }, [arc.chapterRange.endOrder, arc.chapterRange.startOrder, chapters]);

  const chapterCountText = chapters.length > 0 ? chapters.length : "加载中";

  return (
    <div className="source-card">
      <div>
        <p className="panel-label">资料索引</p>
        <h2>章节来源覆盖</h2>
        <p>页面内容基于本地文本转述整理，不展示大段小说原文。</p>
      </div>
      <dl className="source-stats">
        <div>
          <dt>解析章节</dt>
          <dd>{chapterCountText}</dd>
        </div>
        <div>
          <dt>当前范围</dt>
          <dd>{arc.chapterRange.label}</dd>
        </div>
      </dl>
      <div className="chapter-picks" aria-live="polite">
        {picks.length > 0 ? (
          picks.map((chapter) => (
            <article key={chapter.id}>
              <strong>{chapter.heading}</strong>
              <span>第 {chapter.order} 个解析章节，原文件第 {chapter.line} 行</span>
            </article>
          ))
        ) : (
          <article>
            <strong>章节索引加载中</strong>
            <span>加载完成后会显示当前阶段的关键章节标题。</span>
          </article>
        )}
      </div>
    </div>
  );
}
