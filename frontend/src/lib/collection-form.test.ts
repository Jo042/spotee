import { describe, it, expect } from "vitest";
import {
  moveSpot,
  toCollectionInput,
  toggleSpot,
  updateComment,
  type SelectedSpot,
} from "./collection-form";

const spot = (id: string, comment = ""): SelectedSpot => ({
  spotId: id,
  title: `スポット${id}`,
  imageUrl: null,
  comment,
});
const ids = (spots: SelectedSpot[]) => spots.map((s) => s.spotId);

describe("moveSpot", () => {
  const spots = [spot("a"), spot("b"), spot("c")];

  it("上へで1つ前と入れ替わる", () => {
    expect(ids(moveSpot(spots, 1, -1))).toEqual(["b", "a", "c"]);
  });

  it("下へで1つ後ろと入れ替わる", () => {
    expect(ids(moveSpot(spots, 1, 1))).toEqual(["a", "c", "b"]);
  });

  it("先頭の上へ・末尾の下へでは何も変わらない", () => {
    expect(ids(moveSpot(spots, 0, -1))).toEqual(["a", "b", "c"]);
    expect(ids(moveSpot(spots, 2, 1))).toEqual(["a", "b", "c"]);
  });

  it("元の配列は変えない", () => {
    moveSpot(spots, 1, -1);
    expect(ids(spots)).toEqual(["a", "b", "c"]);
  });
});

describe("toggleSpot", () => {
  it("選ぶと末尾に足され、添え書きは空で始まる", () => {
    const result = toggleSpot([spot("a")], {
      spotId: "b",
      title: "B",
      imageUrl: null,
    });
    expect(ids(result)).toEqual(["a", "b"]);
    expect(result[1].comment).toBe("");
  });

  it("もう一度押すと外れ、後ろの順番が詰まる", () => {
    const result = toggleSpot([spot("a"), spot("b"), spot("c")], spot("b"));
    expect(ids(result)).toEqual(["a", "c"]);
  });

  it("上限まで選んだあとは、新しいスポットを足さない", () => {
    const full = [spot("a"), spot("b")];
    expect(ids(toggleSpot(full, spot("c"), 2))).toEqual(["a", "b"]);
  });

  it("上限に達していても、選んだものは外せる", () => {
    const full = [spot("a"), spot("b")];
    expect(ids(toggleSpot(full, spot("a"), 2))).toEqual(["b"]);
  });
});

describe("updateComment", () => {
  it("指定したスポットの添え書きだけを変える", () => {
    const result = updateComment([spot("a"), spot("b")], "b", "おすすめ");
    expect(result.map((s) => s.comment)).toEqual(["", "おすすめ"]);
  });
});

describe("toCollectionInput", () => {
  it("前後の空白を取り、空になった説明と添え書きは null にする", () => {
    const input = toCollectionInput(
      {
        title: "  雨の日の横浜デート  ",
        description: "   ",
        coverImageUrl: null,
      },
      [spot("a", "  窓際がおすすめ "), spot("b", "  ")],
    );

    expect(input).toEqual({
      title: "雨の日の横浜デート",
      description: null,
      coverImageUrl: null,
      spots: [
        { spotId: "a", comment: "窓際がおすすめ" },
        { spotId: "b", comment: null },
      ],
    });
  });

  it("並びは画面の順のまま送る", () => {
    const input = toCollectionInput(
      { title: "特集", description: "", coverImageUrl: "cover.jpg" },
      [spot("c"), spot("a"), spot("b")],
    );

    expect(input.spots.map((s) => s.spotId)).toEqual(["c", "a", "b"]);
    expect(input.coverImageUrl).toBe("cover.jpg");
  });
});
