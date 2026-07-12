"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, UserCircle } from "lucide-react";
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
          className="group relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
          disabled={avatarUploading}
          aria-label="アバター画像を変更"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="アバター" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <UserCircle size={48} />
            </div>
          )}
          {avatarUploading ? (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Camera size={18} className="text-white" />
              <span className="text-[10px] font-medium text-white">変更</span>
            </div>
          )}
        </button>
        <span className="text-xs text-gray-500">タップして画像を変更</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label htmlFor="profile-name" className="text-sm font-medium text-gray-700">
            名前
          </label>
          <span className="text-xs text-gray-400">{name.length}/50</span>
        </div>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label htmlFor="profile-bio" className="text-sm font-medium text-gray-700">
            自己紹介
          </label>
          <span className="text-xs text-gray-400">{bio.length}/200</span>
        </div>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading || avatarUploading}
          className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 active:scale-[0.98] transition disabled:opacity-50"
        >
          {loading ? "保存中..." : "保存"}
        </button>
      </div>
    </form>
  );
}
