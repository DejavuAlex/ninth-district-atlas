import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import { getRelationshipsForCharacter } from "../lib/novelFilters";
import type { CharacterId, NovelDataset } from "../types/novel";

interface RelationshipGraph3DProps {
  dataset: NovelDataset;
  selectedCharacterId: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
}

interface GraphNode {
  id: string;
  name: string;
  role: string;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  kind: string;
  label: string;
}

const kindColor: Record<string, string> = {
  brotherhood: "#e6b15c",
  family: "#e07a3f",
  romance: "#e8688f",
  ally: "#6fae73",
  rival: "#d8a24a",
  mentor: "#7d9bd6",
  enemy: "#d6452f",
  political: "#b38bd0"
};

export default function RelationshipGraph3D({ dataset, selectedCharacterId, onSelectCharacter }: RelationshipGraph3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [size, setSize] = useState({ width: 600, height: 560 });

  const graphData = useMemo(() => {
    const factionColor = new Map(dataset.factions.map((faction) => [faction.id, faction.color]));
    const nodes: GraphNode[] = dataset.characters.map((character) => ({
      id: character.id,
      name: character.name,
      role: character.role,
      color: factionColor.get(character.factionIds[0] ?? "") ?? "#c45532"
    }));
    const links: GraphLink[] = dataset.relationships.map((relationship) => ({
      source: relationship.source,
      target: relationship.target,
      kind: relationship.kind,
      label: relationship.label
    }));
    return { nodes, links };
  }, [dataset]);

  const neighborIds = useMemo(() => {
    const relations = getRelationshipsForCharacter(dataset, selectedCharacterId);
    const ids = new Set<string>([selectedCharacterId]);
    relations.forEach((relationship) => {
      ids.add(relationship.source);
      ids.add(relationship.target);
    });
    return ids;
  }, [dataset, selectedCharacterId]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => setSize({ width: element.clientWidth, height: 560 });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.d3Force("charge")?.strength(-260);
    graph.d3Force("link")?.distance(64);
    graph.d3ReheatSimulation?.();
  }, [graphData]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    const node = graphData.nodes.find((item) => item.id === selectedCharacterId) as any;
    if (node && typeof node.x === "number") {
      const distance = 120;
      const ratio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
      graph.cameraPosition(
        { x: (node.x || 0) * ratio, y: (node.y || 0) * ratio, z: (node.z || 0) * ratio + 60 },
        node,
        900
      );
    }
  }, [selectedCharacterId, graphData]);

  return (
    <div ref={containerRef} className="graph-3d">
      <ForceGraph3D
        ref={graphRef}
        width={size.width}
        height={size.height}
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)"
        showNavInfo={false}
        cooldownTicks={120}
        warmupTicks={40}
        nodeRelSize={5}
        nodeOpacity={0.95}
        nodeThreeObjectExtend
        nodeThreeObject={(node: any) => {
          const isSelected = node.id === selectedCharacterId;
          const isNeighbor = neighborIds.has(node.id);
          if (!isSelected && !isNeighbor) {
            return false as unknown as object;
          }
          const sprite = new SpriteText(node.name);
          sprite.color = isSelected ? "#fff7ea" : "#f6ead2";
          sprite.textHeight = isSelected ? 9 : 6;
          sprite.fontWeight = isSelected ? "700" : "500";
          sprite.backgroundColor = isSelected ? "rgba(141,63,37,0.9)" : "rgba(8,6,4,0.35)";
          sprite.padding = 2;
          sprite.borderRadius = 3;
          (sprite as any).position.y = 9;
          return sprite;
        }}
        nodeColor={(node: any) => {
          if (node.id === selectedCharacterId) return "#ffd99b";
          if (neighborIds.has(node.id)) return node.color;
          return "rgba(120,108,88,0.5)";
        }}
        linkColor={(link: any) => {
          const incident = link.source?.id === selectedCharacterId || link.target?.id === selectedCharacterId;
          return incident ? kindColor[link.kind] ?? "#e06d3f" : "rgba(230,177,92,0.16)";
        }}
        linkWidth={(link: any) => {
          const incident = link.source?.id === selectedCharacterId || link.target?.id === selectedCharacterId;
          return incident ? 1.4 : 0.3;
        }}
        linkOpacity={0.5}
        onNodeClick={(node: any) => onSelectCharacter(node.id)}
      />
    </div>
  );
}
