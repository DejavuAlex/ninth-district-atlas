import { useMemo, useState } from "react";
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

export function App() {
  const [selectedLocationId, setSelectedLocationId] = useState<LocationId>("songjiang");
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId>("qin-yu");
  const [selectedArcId, setSelectedArcId] = useState<ArcId>("arc-survival-entry");

  const activeArc = useMemo(() => filterByArc(ninthDistrict, selectedArcId), [selectedArcId]);
  const activeLocationIds = activeArc?.locations.map((location) => location.id) ?? [];

  return (
    <Layout>
      <Hero dataset={ninthDistrict} />
      <section id="map" className="section-block section-map">
        <div className="section-heading">
          <p className="section-kicker">设定地图</p>
          <h2>从待规划区到巴尔城</h2>
          <p>点击地图节点，查看地点氛围、关联势力、人物和关键事件。</p>
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
      <section id="characters" className="section-block section-characters">
        <div className="section-heading compact">
          <h2>人物不是名单，是乱世里的选择</h2>
          <p>搜索、筛选、选中人物后，关系图和地图会同步突出相关线索。</p>
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
      <section id="timeline" className="section-block">
        <Timeline
          dataset={ninthDistrict}
          selectedArcId={selectedArcId}
          onSelectArc={setSelectedArcId}
          onSelectLocation={setSelectedLocationId}
          onSelectCharacter={setSelectedCharacterId}
        />
      </section>
      <section id="sources" className="section-block source-section">
        <SourceCoverage dataset={ninthDistrict} selectedArcId={selectedArcId} />
      </section>
    </Layout>
  );
}
