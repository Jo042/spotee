import { describe, it, expect } from "vitest";
import {
  buildAskSentence,
  describeResult,
  isModeEffective,
  toggleTag,
  type AskTags,
} from "./ask-sentence";
import { EMPTY_SPOT_FILTER, type SpotFilter } from "./spot-filter";

const tags: AskTags = {
  moods: [
    { id: "m1", name: "雨の日OK", slug: "rainy-day" },
    { id: "m2", name: "静かな場所", slug: "quiet" },
    { id: "m3", name: "穴場", slug: "hidden-gem" },
    { id: "m4", name: "定番", slug: "popular" },
    { id: "m9", name: "夜景がきれい", slug: "night-view-new" },
  ],
  attributes: [
    { id: "a1", name: "Wi-Fiあり", slug: "wifi" },
    { id: "a2", name: "電源あり", slug: "power-outlet" },
  ],
  categories: [
    { id: "c1", name: "カフェ", slug: "cafe" },
    { id: "c2", name: "公園", slug: "park" },
  ],
};

const filterOf = (patch: Partial<SpotFilter>): SpotFilter => ({
  ...EMPTY_SPOT_FILTER,
  ...patch,
});

describe("buildAskSentence", () => {
  it("何も選ばないと、3つとも空の言葉になる", () => {
    expect(buildAskSentence(EMPTY_SPOT_FILTER, tags)).toEqual([
      {
        layer: "mood",
        label: "雰囲気",
        content: { kind: "empty", placeholder: "どんな雰囲気の" },
      },
      {
        layer: "attribute",
        label: "特徴",
        content: { kind: "empty", placeholder: "どんな特徴の" },
      },
      {
        layer: "category",
        label: "カテゴリ",
        content: { kind: "empty", placeholder: "場所" },
      },
    ]);
  });

  it("雰囲気だけ1つ選ぶと、雰囲気だけが言い回しになり、ほかは空の言葉のまま", () => {
    const [mood, attribute, category] = buildAskSentence(
      filterOf({ moodTagIds: ["m1"] }),
      tags,
    );
    expect(mood.content).toEqual({
      kind: "words",
      words: ["雨の日でも過ごせる"],
      connector: "か",
    });
    expect(attribute.content.kind).toBe("empty");
    expect(category.content.kind).toBe("empty");
  });

  it("特徴を2つ選ぶと、どれかなら「か」、すべてなら「かつ」でつながる", () => {
    const or = buildAskSentence(
      filterOf({ attributeTagIds: ["a1", "a2"], tagSearchMode: "OR" }),
      tags,
    );
    const and = buildAskSentence(
      filterOf({ attributeTagIds: ["a1", "a2"], tagSearchMode: "AND" }),
      tags,
    );
    expect(or[1].content).toEqual({
      kind: "words",
      words: ["Wi-Fiのある", "電源のある"],
      connector: "か",
    });
    expect(and[1].content).toEqual({
      kind: "words",
      words: ["Wi-Fiのある", "電源のある"],
      connector: "かつ",
    });
  });

  it("カテゴリを2つ選ぶと、すべてにしていてもつなぎは「か」", () => {
    const [, , category] = buildAskSentence(
      filterOf({ categoryIds: ["c1", "c2"], tagSearchMode: "AND" }),
      tags,
    );
    expect(category.content).toEqual({
      kind: "words",
      words: ["カフェ", "公園"],
      connector: "か",
    });
  });

  it("1つの層で3つ以上選ぶと、最初の言葉と数にまとまる", () => {
    const [mood] = buildAskSentence(
      filterOf({ moodTagIds: ["m2", "m1", "m3", "m4"] }),
      tags,
    );
    expect(mood.content).toEqual({
      kind: "summary",
      first: "静かな",
      total: 4,
    });
  });

  it("言い回しの表に無いタグは、名前をそのまま出す", () => {
    const [mood] = buildAskSentence(filterOf({ moodTagIds: ["m9"] }), tags);
    expect(mood.content).toEqual({
      kind: "words",
      words: ["夜景がきれい"],
      connector: "か",
    });
  });

  it("タグの一覧に無い ID は無視する", () => {
    const [mood] = buildAskSentence(
      filterOf({ moodTagIds: ["unknown"] }),
      tags,
    );
    expect(mood.content.kind).toBe("empty");
  });
});

describe("isModeEffective", () => {
  it("特徴か雰囲気で2つ以上選んだときだけ、すべて／どれかで結果が変わる", () => {
    expect(isModeEffective(filterOf({ moodTagIds: ["m1"] }))).toBe(false);
    expect(isModeEffective(filterOf({ categoryIds: ["c1", "c2"] }))).toBe(
      false,
    );
    expect(isModeEffective(filterOf({ moodTagIds: ["m1", "m2"] }))).toBe(true);
    expect(isModeEffective(filterOf({ attributeTagIds: ["a1", "a2"] }))).toBe(
      true,
    );
  });
});

describe("describeResult", () => {
  it("何も選ばなければ、すべての場所", () => {
    expect(describeResult(EMPTY_SPOT_FILTER)).toBe("すべての場所");
  });

  it("すべて／どれかで結果が変わらないときは、どちらにも触れない", () => {
    expect(describeResult(filterOf({ moodTagIds: ["m1"] }))).toBe(
      "選んだ条件に当てはまる場所",
    );
  });

  it("すべてなら「すべて当てはまる」、どれかなら「どれかが当てはまる」", () => {
    expect(
      describeResult(
        filterOf({ moodTagIds: ["m1", "m2"], tagSearchMode: "AND" }),
      ),
    ).toBe("特徴と雰囲気は、選んだ言葉がすべて当てはまる場所");
    expect(
      describeResult(
        filterOf({ moodTagIds: ["m1", "m2"], tagSearchMode: "OR" }),
      ),
    ).toBe("特徴と雰囲気は、選んだ言葉のどれかが当てはまる場所");
  });
});

describe("toggleTag", () => {
  it("選んでいなければ末尾に足し、選んでいれば外す", () => {
    const added = toggleTag(filterOf({ moodTagIds: ["m1"] }), "mood", "m2");
    expect(added.moodTagIds).toEqual(["m1", "m2"]);
    const removed = toggleTag(added, "mood", "m1");
    expect(removed.moodTagIds).toEqual(["m2"]);
  });

  it("ほかの層には触れない", () => {
    const next = toggleTag(
      filterOf({ categoryIds: ["c1"], moodTagIds: ["m1"] }),
      "attribute",
      "a1",
    );
    expect(next.categoryIds).toEqual(["c1"]);
    expect(next.moodTagIds).toEqual(["m1"]);
    expect(next.attributeTagIds).toEqual(["a1"]);
  });
});
