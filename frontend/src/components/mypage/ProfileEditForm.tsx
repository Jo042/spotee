"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { UPDATE_PROFILE } from "@/graphql/mutations/user";
import { uploadImage } from "@/lib/storage";
import imageCompression from "browser-image-compression";

interface ProfileEditFormProps {
  initialName: string;
  initialBio: string | null | undefined;
  initialAvatarUrl: string | null | undefined;
}

export function ProfileEditForm({
  initialName,
  initialBio,
  initialAvatarUrl,
}: ProfileEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setError(null);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });
      const url = await uploadImage(compressed, "avatars");
      setAvatarUrl(url);
    } catch {
      setError("画像のアップロードに失敗しました");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    setError(null);
    try {
      await updateProfile({
        variables: {
          name: name.trim(),
          bio: bio.trim() || undefined,
          avatarUrl: avatarUrl || undefined,
        },
      });
      router.push("/mypage");
      router.refresh();
    } catch {
      setError("保存に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 hover:opacity-80 transition-opacity"
          disabled={avatarUploading}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="アバター" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <UserCircle size={48} />
            </div>
          )}
          {avatarUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="text-white text-xs">アップロード中</span>
            </div>
          )}
        </button>
        <span className="text-sm text-gray-500">タップして画像を変更</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading || avatarUploading}
          className="flex-1 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors disabled:opacity-50"
        >
          {loading ? "保存中..." : "保存"}
        </button>
      </div>
    </form>
  );
}
