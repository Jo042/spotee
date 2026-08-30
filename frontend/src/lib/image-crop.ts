/** スポット画像の表示比率。SpotCard / SpotDetail の aspect-video と対応する */
export const SPOT_IMAGE_ASPECT = 16 / 9;

/** 切り抜き結果として許容する最小の横幅（px）。これを下回る拡大はさせない */
export const MIN_CROPPED_WIDTH = 640;

/** canvas 経由の切り抜きはアニメーションを壊すため、GIF は対象外とする */
export function isCroppable(mimeType: string): boolean {
  return mimeType.startsWith("image/") && mimeType !== "image/gif";
}

export interface Size {
  width: number;
  height: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 画像に収まる最大の指定比率の矩形（＝ズーム1倍で切り抜かれる範囲）を返す。
 * 元画像が指定比率より横長なら高さが、縦長なら幅が制約になる。
 */
export function calculateCropBaseSize(
  image: Size,
  aspect: number = SPOT_IMAGE_ASPECT,
): Size {
  if (image.width <= 0 || image.height <= 0) {
    return { width: 0, height: 0 };
  }

  const isWiderThanAspect = image.width / image.height > aspect;

  return isWiderThanAspect
    ? { width: image.height * aspect, height: image.height }
    : { width: image.width, height: image.width / aspect };
}

/**
 * 切り抜き結果が minWidth を下回らない範囲での最大ズーム倍率を返す。
 * ズーム z のとき切り抜き幅は baseWidth / z になるため、上限は baseWidth / minWidth。
 * 元画像が小さくズーム1倍でも minWidth に届かない場合は 1 を返す（拡大させない）。
 */
export function calculateMaxZoom(
  image: Size,
  aspect: number = SPOT_IMAGE_ASPECT,
  minWidth: number = MIN_CROPPED_WIDTH,
): number {
  const base = calculateCropBaseSize(image, aspect);

  if (base.width <= 0 || minWidth <= 0) return 1;

  return Math.max(1, base.width / minWidth);
}

/**
 * 切り抜き後は常に JPEG になるため、拡張子を .jpg に付け替える。
 * lib/storage.ts の uploadImage が file.name の拡張子をそのまま使うため、
 * これを怠ると PNG を切り抜いた結果が .png という名前で保存される。
 */
export function toJpegFileName(originalName: string): string {
  const trimmed = originalName.trim();

  if (trimmed === "") return "image.jpg";

  const lastDot = trimmed.lastIndexOf(".");
  const base = lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;

  return `${base}.jpg`;
}

const JPEG_QUALITY = 0.92;

/**
 * 指定範囲を切り抜いた JPEG の File を返す。
 * 出力後に既存の compressImage() を通すため、ここでは品質を高めに保つ。
 */
export async function cropImageToFile(
  source: Blob,
  area: CropArea,
  fileName: string,
): Promise<File> {
  const bitmap = await createImageBitmap(source, {
    imageOrientation: "from-image",
  });

  try {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(area.width);
    canvas.height = Math.round(area.height);

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("画像の切り抜きに失敗しました");
    }

    context.drawImage(
      bitmap,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });

    if (!blob) {
      throw new Error("画像の切り抜きに失敗しました");
    }

    return new File([blob], toJpegFileName(fileName), { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}
