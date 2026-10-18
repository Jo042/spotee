"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { UPDATE_PROFILE } from "@/graphql/mutations/user";
import { uploadImage } from "@/lib/storage";
import { getUserFacingErrorMessage } from "@/lib/graphql-error";
import imageCompression from "browser-image-compression";
import { Avatar } from "@/components/common/Avatar";
import { FieldLabel } from "@/components/common/FieldLabel";
import { Spinner } from "@/components/common/Spinner";
import { charCountLabel } from "@/lib/format";
import { PROFILE_INPUT_LIMITS } from "@/lib/profile-form";

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

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    setError(null);
    try {
      await updateProfile({
        variables: {
          input: {
            name: name.trim(),
            bio: bio.trim() || undefined,
            avatarUrl: avatarUrl || undefined,
          },
        },
      });
      router.push("/mypage");
      router.refresh();
    } catch (err) {
      setError(getUserFacingErrorMessage(err, "保存に失敗しました"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative size-24 overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
          disabled={avatarUploading}
          aria-label="アバター画像を変更"
        >
          <Avatar name={name} src={avatarUrl} size={96} />
          {avatarUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Spinner className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Camera size={18} className="text-white" aria-hidden="true" />
              <span className="text-[10px] font-medium text-white">変更</span>
            </div>
          )}
        </button>
        <span className="text-xs text-gray-500">押すと画像を変えられます</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      <div>
        <FieldLabel
          htmlFor="profile-name"
          count={charCountLabel(name, PROFILE_INPUT_LIMITS.name)}
        >
          名前
        </FieldLabel>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={PROFILE_INPUT_LIMITS.name}
          className="text-input"
        />
      </div>

      <div>
        <FieldLabel
          htmlFor="profile-bio"
          optional
          count={charCountLabel(bio, PROFILE_INPUT_LIMITS.bio)}
        >
          自己紹介
        </FieldLabel>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={PROFILE_INPUT_LIMITS.bio}
          rows={4}
          className="text-input resize-none leading-relaxed"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm leading-relaxed text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary flex-1 py-3"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading || avatarUploading}
          className="btn-primary flex-1 py-3"
        >
          {loading ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
