import { describe, it, expect } from "vitest";
import {
  SPOT_IMAGE_ASPECT,
  isCroppable,
  calculateCropBaseSize,
  calculateMaxZoom,
  toJpegFileName,
} from "./image-crop";

describe("isCroppable", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])(
    "%s は切り抜き対象",
    (mimeType) => {
      expect(isCroppable(mimeType)).toBe(true);
    },
  );

  it("GIF はアニメーションが壊れるため対象外", () => {
    expect(isCroppable("image/gif")).toBe(false);
  });

  it("画像以外は対象外", () => {
    expect(isCroppable("application/pdf")).toBe(false);
  });
});

describe("calculateCropBaseSize", () => {
  it("16:9 より横長の画像では高さが制約になる", () => {
    // 4000x1000（比率4.0）は 16:9 より横長
    expect(calculateCropBaseSize({ width: 4000, height: 1000 })).toEqual({
      width: 1000 * SPOT_IMAGE_ASPECT,
      height: 1000,
    });
  });

  it("16:9 より縦長の画像では幅が制約になる", () => {
    // スマホの縦撮り
    expect(calculateCropBaseSize({ width: 1080, height: 1920 })).toEqual({
      width: 1080,
      height: 1080 / SPOT_IMAGE_ASPECT,
    });
  });

  it("ちょうど 16:9 の画像は元サイズと一致する", () => {
    expect(calculateCropBaseSize({ width: 1920, height: 1080 })).toEqual({
      width: 1920,
      height: 1080,
    });
  });

  it("サイズが0以下なら0を返す", () => {
    expect(calculateCropBaseSize({ width: 0, height: 100 })).toEqual({
      width: 0,
      height: 0,
    });
  });
});

describe("calculateMaxZoom", () => {
  it("切り抜き幅が最小幅を下回らない倍率を返す", () => {
    // 縦長画像なので base.width は 1280。1280 / 640 = 2
    expect(
      calculateMaxZoom({ width: 1280, height: 2000 }, SPOT_IMAGE_ASPECT, 640),
    ).toBe(2);
  });

  it("元画像が小さいときは拡大させない（1を返す）", () => {
    expect(
      calculateMaxZoom({ width: 500, height: 900 }, SPOT_IMAGE_ASPECT, 640),
    ).toBe(1);
  });

  it("ちょうど最小幅の画像では1になる", () => {
    expect(
      calculateMaxZoom({ width: 640, height: 1000 }, SPOT_IMAGE_ASPECT, 640),
    ).toBe(1);
  });

  it("横長画像では高さから求めた幅が基準になる", () => {
    // 高さ720 → base.width = 720 * 16/9 = 1280 → 1280 / 640 = 2
    expect(
      calculateMaxZoom({ width: 4000, height: 720 }, SPOT_IMAGE_ASPECT, 640),
    ).toBe(2);
  });

  it("サイズが0でも1を返す（0除算しない）", () => {
    expect(calculateMaxZoom({ width: 0, height: 0 })).toBe(1);
  });
});

describe("toJpegFileName", () => {
  it("拡張子を .jpg に付け替える", () => {
    expect(toJpegFileName("photo.png")).toBe("photo.jpg");
  });

  it("すでに .jpg でもそのまま .jpg になる", () => {
    expect(toJpegFileName("photo.jpg")).toBe("photo.jpg");
  });

  it("拡張子が無いときは .jpg を付ける", () => {
    expect(toJpegFileName("photo")).toBe("photo.jpg");
  });

  it("ファイル名に複数のドットがあっても最後だけを置き換える", () => {
    expect(toJpegFileName("my.photo.2026.heic")).toBe("my.photo.2026.jpg");
  });

  it("ドット始まりのファイル名は拡張子とみなさない", () => {
    expect(toJpegFileName(".gitkeep")).toBe(".gitkeep.jpg");
  });

  it("空文字なら既定のファイル名を返す", () => {
    expect(toJpegFileName("")).toBe("image.jpg");
    expect(toJpegFileName("   ")).toBe("image.jpg");
  });
});
