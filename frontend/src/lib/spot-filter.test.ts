import { describe, it, expect } from "vitest";
import {
  buildSpotsHref,
  EMPTY_SPOT_FILTER,
  parseSpotFilter,
  toSpotFilterInput,
  writeSpotFilter,
} from "./spot-filter";
import { TagSearchMode } from "@/graphql/generated/graphql";

describe("buildSpotsHref", () => {
  it("何も選ばなければ /spots", () => {
    expect(buildSpotsHref(EMPTY_SPOT_FILTER)).toBe("/spots");
  });

  it("一覧と同じ名前のパラメータで条件を渡す", () => {
    const href = buildSpotsHref({
      categoryIds: ["c1", "c2"],
      attributeTagIds: ["a1"],
      moodTagIds: ["m1", "m2"],
      tagSearchMode: "AND",
    });
    const params = new URL(href, "http://localhost").searchParams;
    expect(params.get("categoryIds")).toBe("c1,c2");
    expect(params.get("attributeTagIds")).toBe("a1");
    expect(params.get("moodTagIds")).toBe("m1,m2");
    expect(params.get("tagSearchMode")).toBe("AND");
  });

  it("どれか（既定）のときは tagSearchMode を書かない", () => {
    expect(buildSpotsHref({ ...EMPTY_SPOT_FILTER, moodTagIds: ["m1"] })).toBe(
      "/spots?moodTagIds=m1",
    );
  });
});

describe("parseSpotFilter", () => {
  it("書いた条件を読み戻すと、同じ条件になる", () => {
    const filter = {
      categoryIds: ["c1"],
      attributeTagIds: ["a1", "a2"],
      moodTagIds: [],
      tagSearchMode: "AND" as const,
      keyword: "海",
    };
    const params = new URLSearchParams();
    writeSpotFilter(params, filter);
    expect(parseSpotFilter(params)).toEqual(filter);
  });

  it("知らない tagSearchMode は既定の OR として読む", () => {
    expect(
      parseSpotFilter(new URLSearchParams("tagSearchMode=XOR")).tagSearchMode,
    ).toBe("OR");
  });
});

describe("writeSpotFilter", () => {
  it("並び順など、絞り込み以外のパラメータは残す", () => {
    const params = new URLSearchParams("sortBy=likeCount&moodTagIds=m1");
    writeSpotFilter(params, EMPTY_SPOT_FILTER);
    expect(params.toString()).toBe("sortBy=likeCount");
  });
});

describe("toSpotFilterInput", () => {
  it("空の条件は送らず、検索の方式は GraphQL の値にする", () => {
    expect(
      toSpotFilterInput({
        ...EMPTY_SPOT_FILTER,
        attributeTagIds: ["a1"],
        tagSearchMode: "AND",
      }),
    ).toEqual({
      categoryIds: undefined,
      attributeTagIds: ["a1"],
      moodTagIds: undefined,
      tagSearchMode: TagSearchMode.And,
      keyword: undefined,
    });
  });
});
