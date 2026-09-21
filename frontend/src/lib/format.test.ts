import { describe, it, expect } from "vitest";
import { formatCount } from "./format";

describe("formatCount", () => {
  describe("1万未満はそのまま表示する", () => {
    it.each([0, 1, 999, 9999])("%i はそのまま", (n) => {
      expect(formatCount(n)).toBe(String(n));
    });
  });

  describe("1万以上10万未満は小数第1位まで", () => {
    it("ちょうど1万は 1万", () => {
      expect(formatCount(10000)).toBe("1万");
    });

    it("12345 は 1.2万（切り捨て）", () => {
      expect(formatCount(12345)).toBe("1.2万");
    });

    it("19999 は 1.9万（繰り上げない）", () => {
      expect(formatCount(19999)).toBe("1.9万");
    });

    it("99999 は 9.9万", () => {
      expect(formatCount(99999)).toBe("9.9万");
    });
  });

  describe("10万以上は整数", () => {
    it("100000 は 10万", () => {
      expect(formatCount(100000)).toBe("10万");
    });

    it("123456 は 12万（切り捨て）", () => {
      expect(formatCount(123456)).toBe("12万");
    });
  });

  describe("想定外の入力", () => {
    it("負の数は 0 にする", () => {
      expect(formatCount(-1)).toBe("0");
    });

    it("NaN は 0 にする", () => {
      expect(formatCount(Number.NaN)).toBe("0");
    });

    it("Infinity は 0 にする", () => {
      expect(formatCount(Number.POSITIVE_INFINITY)).toBe("0");
    });

    it("小数は切り捨てる", () => {
      expect(formatCount(12.7)).toBe("12");
    });
  });
});
