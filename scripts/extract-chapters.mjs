import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(projectRoot, "第九特区.txt");
const outputPath = resolve(projectRoot, "src/data/chapterIndex.generated.json");

const chapterPattern =
  /^(序章)\s+(.+)$|^第[0-9０-９一二三四五六七八九十百千万两〇零]+章[、\s]+(.+)$/;

export function parseChaptersFromText(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const lineStarts = [];
  let offset = 0;

  for (const line of lines) {
    lineStarts.push(offset);
    offset += line.length + 1;
  }

  const headings = [];
  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();
    const match = trimmed.match(chapterPattern);
    if (!match) continue;

    const title = (match[2] ?? match[3] ?? "").trim();
    headings.push({
      order: headings.length + 1,
      line: index + 1,
      heading: trimmed,
      title,
      startOffset: lineStarts[index]
    });
  }

  return headings.map((heading, index) => {
    const nextHeading = headings[index + 1];
    const endOffset = nextHeading?.startOffset ?? text.length;
    const body = text
      .slice(heading.startOffset + heading.heading.length, endOffset)
      .replace(/\s+/g, "")
      .slice(0, 160);

    return {
      id: `chapter-${String(index + 1).padStart(4, "0")}`,
      order: index + 1,
      line: heading.line,
      heading: heading.heading,
      title: heading.title,
      startOffset: heading.startOffset,
      endOffset,
      excerpt: body
    };
  });
}

async function main() {
  const text = await readFile(sourcePath, "utf8");
  const chapters = parseChaptersFromText(text);
  const publicChapterIndex = chapters.map(({ id, order, line, heading, title }) => ({
    id,
    order,
    line,
    heading,
    title
  }));

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(publicChapterIndex, null, 2)}\n`, "utf8");

  console.log(`源文件：${sourcePath}`);
  console.log(`输出：${outputPath}`);
  console.log(`解析章节数：${chapters.length}`);
  console.log(`首章：${chapters[0]?.heading ?? "未解析到章节"}`);
  console.log(`末章：${chapters.at(-1)?.heading ?? "未解析到章节"}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
