import { useEffect, useMemo, useState } from "react";
import { CharacterPanel } from "./components/CharacterPanel";
import { Hero } from "./components/Hero";
import { Layout } from "./components/Layout";
import { RelationshipGraph } from "./components/RelationshipGraph";
import { SourceCoverage } from "./components/SourceCoverage";
import { Timeline } from "./components/Timeline";
import { WorldMap } from "./components/WorldMap";
import { ninthDistrict } from "./data/ninthDistrict";
import { filterByArc } from "./lib/novelFilters";
import type { ArcId, CharacterId, LocationId } from "./types/novel";

type PageId = "home" | "map" | "characters" | "timeline" | "sources";

const pathToPage = (path: string): PageId => {
  if (path.startsWith("/map")) return "map";
  if (path.startsWith("/characters")) return "characters";
  if (path.startsWith("/timeline")) return "timeline";
  if (path.startsWith("/sources")) return "sources";
  return "home";
};

const pageToPath: Record<PageId, string> = {
  home: "/",
  map: "/map",
  characters: "/characters",
  timeline: "/timeline",
  sources: "/sources"
};

export function App() {
  const [selectedLocationId, setSelectedLocationId] = useState<LocationId>("songjiang");
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId>("qin-yu");
  const [selectedArcId, setSelectedArcId] = useState<ArcId>("arc-survival-entry");
  const [page, setPage] = useState<PageId>(() => pathToPage(window.location.pathname));

  const activeArc = useMemo(() => filterByArc(ninthDistrict, selectedArcId), [selectedArcId]);
  const activeLocationIds = activeArc?.locations.map((location) => location.id) ?? [];

  useEffect(() => {
    const onPopState = () => setPage(pathToPage(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextPage: PageId) => {
    const nextPath = pageToPath[nextPage];
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout currentPage={page} onNavigate={navigate}>
      <div key={page} className="page-transition">
        {page === "home" ? <Hero dataset={ninthDistrict} onNavigate={navigate} /> : null}
        {page === "map" ? (
          <section id="map" className="section-block section-map">
            <div className="section-heading">
              <p className="section-kicker">设定地图</p>
              <h2>从待规划区到巴尔城</h2>
              <p>点击地图节点，查看地点氛围、区域分割、素材提示词和关键事件。</p>
            </div>
            <WorldMap
              dataset={ninthDistrict}
              selectedLocationId={selectedLocationId}
              activeLocationIds={activeLocationIds}
              selectedCharacterId={selectedCharacterId}
              onSelectLocation={setSelectedLocationId}
              onSelectCharacter={setSelectedCharacterId}
            />
          </section>
        ) : null}
        {page === "characters" ? (
          <section id="characters" className="section-block section-characters">
            <div className="section-heading compact">
              <h2>人物不是名单，是乱世里的选择</h2>
              <p>搜索、筛选、选中人物后，关系图、关系标签和形象提示词会同步更新。</p>
            </div>
            <div className="character-grid">
              <CharacterPanel
                dataset={ninthDistrict}
                selectedCharacterId={selectedCharacterId}
                selectedArcId={selectedArcId}
                onSelectCharacter={setSelectedCharacterId}
              />
              <RelationshipGraph
                dataset={ninthDistrict}
                selectedCharacterId={selectedCharacterId}
                onSelectCharacter={setSelectedCharacterId}
              />
            </div>
          </section>
        ) : null}
        {page === "timeline" ? (
          <section id="timeline" className="section-block">
            <Timeline
              dataset={ninthDistrict}
              selectedArcId={selectedArcId}
              onSelectArc={setSelectedArcId}
              onSelectLocation={setSelectedLocationId}
              onSelectCharacter={setSelectedCharacterId}
            />
          </section>
        ) : null}
        {page === "sources" ? (
          <section id="sources" className="section-block source-section">
            <SourceCoverage dataset={ninthDistrict} selectedArcId={selectedArcId} />
          </section>
        ) : null}
      </div>
    </Layout>
  );
}
