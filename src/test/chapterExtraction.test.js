import { describe, expect, it } from "vitest";
import { parseChaptersFromText } from "../../scripts/extract-chapters.mjs";

describe("章节解析", () => {
  it("识别序章和中文数字章节并计算范围", () => {
    const sample = [
      "小说名：第九特区",
      "序章 七宗罪",
      "灾变之后，大地满目疮痍。",
      "第一章 初来乍到",
      "秦禹来到第九特区。",
      "第二六五三章 仙气飘飘的老许",
      "老许登场。"
    ].join("\n");

    const chapters = parseChaptersFromText(sample);

    expect(chapters).toHaveLength(3);
    expect(chapters[0]).toMatchObject({
      id: "chapter-0001",
      order: 1,
      line: 2,
      heading: "序章 七宗罪",
      title: "七宗罪"
    });
    expect(chapters[1].heading).toBe("第一章 初来乍到");
    expect(chapters[2].heading).toBe("第二六五三章 仙气飘飘的老许");
    expect(chapters[0].endOffset).toBe(chapters[1].startOffset);
    expect(chapters[1].excerpt).toContain("秦禹来到第九特区");
  });
});
