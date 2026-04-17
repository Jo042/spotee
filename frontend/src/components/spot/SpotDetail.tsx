"use client";

import Link from "next/link";
import { useState } from "react";

interface SpotImage {
  id: string;
  url: string;
  order: number;
}

interface SpotDetailProps {
  spot: {
    id: string;
    title: string;
    description: string | null;
    address: string;
    priceRange: number | null;
    businessHours: string | null;
    likeCount: number;
    createdAt: string;
    images: SpotImage[];
    category: {
      id: string;
      name: string;
    };
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  };
}

const priceRangeLabels: Record<number, string> = {
  1: "~1,000円",
  2: "1,000~3,000円",
  3: "3,000~5,000円",
  4: "5,000円~",
};

export function SpotDetail({ spot }: SpotDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const sortedImages = [...spot.images].sort((a, b) => a.order - b.order);
  const currentImage = sortedImages[currentImageIndex];

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/spots"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        ← スポット一覧に戻る
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
          {currentImage && (
            <img
              src={currentImage.url}
              alt={spot.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {sortedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === currentImageIndex
                    ? "border-primary-500"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img
                  src={image.url}
                  alt={`${spot.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <span className="inline-block px-3 py-1 text-white bg-primary-700 text-sm rounded-full">
          {spot.category.name}
        </span>

        <h1 className="text-2xl font-bold text-gray-900">{spot.title}</h1>

        <div className="flex items-center gap-2 text-gray-600">
          <span>❤️ {spot.likeCount}</span>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-gray-500">📍</span>
          <span className="text-gray-700">{spot.address}</span>
        </div>

        {spot.priceRange && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">💰</span>
            <span className="text-gray-700">
              {priceRangeLabels[spot.priceRange]}
            </span>
          </div>
        )}

        {spot.businessHours && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">🕐</span>
            <span className="text-gray-700">{spot.businessHours}</span>
          </div>
        )}

        {spot.description && (
          <div className="pt-4 border-t">
            <p className="text-gray-700 whitespace-pre-wrap">
              {spot.description}
            </p>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
              {spot.user.avatarUrl ? (
                <img
                  src={spot.user.avatarUrl}
                  alt={spot.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  👤
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{spot.user.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(spot.createdAt).toLocaleDateString("ja-JP")} に投稿
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
