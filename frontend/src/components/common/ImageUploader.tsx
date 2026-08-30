"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/storage";
import imageCompression from "browser-image-compression";
import dynamic from "next/dynamic";
import { cropImageToFile, isCroppable, type CropArea } from "@/lib/image-crop";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

/** 切り抜き待ちのファイル。previewUrl は切り抜き対象のファイルにだけ付く */
interface QueueItem {
  file: File;
  previewUrl: string | null;
}

// 切り抜きUIはファイル選択後にしか使わないため、初期バンドルから外す
const ImageCropModal = dynamic(
  () => import("./ImageCropModal").then((m) => m.ImageCropModal),
  { ssr: false },
);

const MAX_FILE_SIZE_MB = 4.5;

const compressImage = async (file: File): Promise<File> => {
  if (file.type === "image/gif") return file;

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
    initialQuality: 0.8,
    useWebWorker: true,
  };

  const compressed = await imageCompression(file, options);

  if (compressed.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error("画像サイズが大きすぎます。別の画像をお試しください。");
  }

  return compressed;
};

const revokeAll = (items: QueueItem[]) => {
  items.forEach((item) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  });
};

export function ImageUploader({
  images,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  const uploadedUrls = useRef<string[]>([]);
  const queueRef = useRef<QueueItem[]>([]);

  // アップロード途中で画面を離れた場合にオブジェクトURLを解放する
  useEffect(() => {
    return () => {
      revokeAll(queueRef.current);
      queueRef.current = [];
    };
  }, []);

  const applyQueue = useCallback((items: QueueItem[]) => {
    queueRef.current = items;
    setQueue(items);
  }, []);

  const finishQueue = useCallback(
    (items: QueueItem[]) => {
      revokeAll(items);
      if (uploadedUrls.current.length > 0) {
        onChange([...images, ...uploadedUrls.current]);
      }
      uploadedUrls.current = [];
      applyQueue([]);
      setQueueIndex(0);
      setIsUploading(false);
    },
    [images, onChange, applyQueue],
  );

  const uploadFile = useCallback(async (file: File) => {
    const compressed = await compressImage(file);
    const url = await uploadImage(compressed);
    uploadedUrls.current = [...uploadedUrls.current, url];
  }, []);

  /**
   * startIndex から順に、切り抜きの要らないファイルを続けてアップロードする。
   * 切り抜きが必要なファイルに当たったらそこで停止し、モーダルの表示に切り替える。
   */
  const advanceFrom = useCallback(
    async (startIndex: number, items: QueueItem[], skipCropping: boolean) => {
      let index = startIndex;

      try {
        while (index < items.length) {
          const item = items[index];
          if (!skipCropping && item.previewUrl) break;

          await uploadFile(item.file);
          index += 1;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "アップロードに失敗しました",
        );
        finishQueue(items);
        return;
      }

      if (index >= items.length) {
        finishQueue(items);
        return;
      }

      setQueueIndex(index);
    },
    [uploadFile, finishQueue],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // input.files は input と連動するライブな FileList で、value をリセットすると
      // 中身が空になる。同じファイルを選び直せるようにするリセットは、必ず配列へ
      // コピーし終えてから行う
      const fileList = event.target.files;
      if (!fileList || fileList.length === 0) return;

      const selectedFiles = Array.from(fileList);
      event.target.value = "";

      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        setError(`最大${maxImages}枚までアップロードできます`);
        return;
      }

      const items: QueueItem[] = selectedFiles
        .slice(0, remainingSlots)
        .map((file) => ({
          file,
          previewUrl: isCroppable(file.type) ? URL.createObjectURL(file) : null,
        }));

      setError(null);
      setIsUploading(true);
      uploadedUrls.current = [];
      applyQueue(items);
      setQueueIndex(0);

      void advanceFrom(0, items, false);
    },
    [images, maxImages, advanceFrom, applyQueue],
  );

  const handleConfirmCrop = useCallback(
    async (area: CropArea) => {
      const item = queue[queueIndex];
      if (!item) return;

      try {
        const cropped = await cropImageToFile(item.file, area, item.file.name);
        await uploadFile(cropped);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "アップロードに失敗しました",
        );
        finishQueue(queue);
        return;
      }

      void advanceFrom(queueIndex + 1, queue, false);
    },
    [queue, queueIndex, uploadFile, advanceFrom, finishQueue],
  );

  const handleSkipCrop = useCallback(async () => {
    const item = queue[queueIndex];
    if (!item) return;

    try {
      await uploadFile(item.file);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "アップロードに失敗しました",
      );
      finishQueue(queue);
      return;
    }

    void advanceFrom(queueIndex + 1, queue, false);
  }, [queue, queueIndex, uploadFile, advanceFrom, finishQueue]);

  const handleSkipAll = useCallback(() => {
    void advanceFrom(queueIndex, queue, true);
  }, [queueIndex, queue, advanceFrom]);

  const handleCancelCurrent = useCallback(() => {
    void advanceFrom(queueIndex + 1, queue, false);
  }, [queueIndex, queue, advanceFrom]);

  const handleRemove = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    },
    [images, onChange],
  );

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (dragIndex === dropIndex) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    onChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const croppingItem = queue[queueIndex] ?? null;

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-move"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
            >
              <Image
                src={url}
                alt={`アップロード画像 ${index + 1}`}
                fill
                sizes="(min-width: 768px) 20vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
              <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <label
          className={`
            flex flex-col items-center justify-center
            w-full h-32 border-2 border-dashed rounded-lg
            cursor-pointer transition-colors
            ${
              isUploading
                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 hover:border-primary-500 hover:bg-primary-50"
            }
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <span className="text-gray-500">アップロード中...</span>
          ) : (
            <>
              <span className="text-gray-500">クリックして画像を選択</span>
              <span className="text-sm text-gray-400 mt-1">
                残り {maxImages - images.length} 枚
              </span>
            </>
          )}
        </label>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <p className="text-sm text-gray-500">
        JPEG, PNG, WebP, GIF 形式、最大5MB、{maxImages}枚まで
      </p>

      {croppingItem?.previewUrl && (
        <ImageCropModal
          imageSrc={croppingItem.previewUrl}
          progressLabel={`${queue.length}枚中 ${queueIndex + 1}枚目`}
          showSkipAll={queueIndex < queue.length - 1}
          onConfirm={handleConfirmCrop}
          onSkip={handleSkipCrop}
          onSkipAll={handleSkipAll}
          onCancel={handleCancelCurrent}
        />
      )}
    </div>
  );
}
