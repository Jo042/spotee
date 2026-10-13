import { describe, it, expect } from "vitest";
import { getInitial } from "./avatar";

describe("getInitial", () => {
  it("日本語の名前は最初の1文字", () => {
    expect(getInitial("さき")).toBe("さ");
  });

  it("英字は大文字にする", () => {
    expect(getInitial("taro")).toBe("T");
  });

  it("前後の空白は無視する", () => {
    expect(getInitial("  mio")).toBe("M");
  });

  it("絵文字で始まる名前は、絵文字1つとして扱う", () => {
    expect(getInitial("👨‍👩‍👧家族")).toBe("👨‍👩‍👧");
  });

  it("空の名前は「?」", () => {
    expect(getInitial("   ")).toBe("?");
  });
});
