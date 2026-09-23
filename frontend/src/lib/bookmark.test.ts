import { describe, it, expect } from "vitest";
import { withFolderId, withoutFolderId } from "./bookmark";

describe("withFolderId", () => {
  it("末尾に足す", () => {
    expect(withFolderId(["a"], "b")).toEqual(["a", "b"]);
  });

  it("すでに含まれていれば増やさない", () => {
    expect(withFolderId(["a", "b"], "a")).toEqual(["a", "b"]);
  });

  it("元の配列を書き換えない", () => {
    const ids = ["a"];
    withFolderId(ids, "b");
    expect(ids).toEqual(["a"]);
  });
});

describe("withoutFolderId", () => {
  it("取り除く", () => {
    expect(withoutFolderId(["a", "b"], "a")).toEqual(["b"]);
  });

  it("含まれていなければそのまま", () => {
    expect(withoutFolderId(["a"], "x")).toEqual(["a"]);
  });

  it("元の配列を書き換えない", () => {
    const ids = ["a", "b"];
    withoutFolderId(ids, "a");
    expect(ids).toEqual(["a", "b"]);
  });
});
