"use client";

import { useState, useCallback } from "react";
import { uploadImage } from "@/lib/storage";
import imageCompression from "browser-image-compression";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

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

export function ImageUploader({
  images,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        setError(`最大${maxImages}枚までアップロードできます`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      setIsUploading(true);
      setError(null);

      try {
        const uploadPromises = filesToUpload.map(async (file) => {
          const compressed = await compressImage(file);
          return uploadImage(compressed);
        });
        const newUrls = await Promise.all(uploadPromises);

        onChange([...images, ...newUrls]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "アップロードに失敗しました",
        );
      } finally {
        setIsUploading(false);
        event.target.value = "";
      }
    },
    [images, maxImages, onChange],
  );

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
              <img
                src={url}
                alt={`アップロード画像 ${index + 1}`}
                className="w-full h-full object-cover"
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
    </div>
  );
}
