import { describe, it, expect } from "vitest";
import { enqueueToast, removeToast, type Toast } from "./toast-queue";

const toast = (id: number): Toast => ({
  id,
  type: "success",
  message: `通知${id}`,
});

describe("enqueueToast", () => {
  it("末尾に追加する", () => {
    const result = enqueueToast([toast(1)], toast(2));
    expect(result.map((t) => t.id)).toEqual([1, 2]);
  });

  it("上限を超えたら古いものから消す", () => {
    const result = enqueueToast([toast(1), toast(2), toast(3)], toast(4), 3);
    expect(result.map((t) => t.id)).toEqual([2, 3, 4]);
  });

  it("ちょうど上限なら消さない", () => {
    const result = enqueueToast([toast(1), toast(2)], toast(3), 3);
    expect(result.map((t) => t.id)).toEqual([1, 2, 3]);
  });

  it("元の配列を書き換えない", () => {
    const original = [toast(1)];
    enqueueToast(original, toast(2));
    expect(original.map((t) => t.id)).toEqual([1]);
  });
});

describe("removeToast", () => {
  it("指定したIDだけ消す", () => {
    const result = removeToast([toast(1), toast(2), toast(3)], 2);
    expect(result.map((t) => t.id)).toEqual([1, 3]);
  });

  it("存在しないIDなら何も変えない", () => {
    const result = removeToast([toast(1)], 99);
    expect(result.map((t) => t.id)).toEqual([1]);
  });
});
