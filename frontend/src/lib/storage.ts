import { supabase } from "./supabase";

export async function uploadImage(
  file: File,
  bucket: string = "spots",
): Promise<string> {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split(".").pop();
  const fileName = `${timestamp}-${randomString}.${extension}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function uploadImages(
  files: File[],
  bucket: string = "spots",
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file, bucket));
  return Promise.all(uploadPromises);
}

export async function deleteImage(
  url: string,
  bucket: string = "spots",
): Promise<void> {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/");
  const fileName = pathParts[pathParts.length - 1];

  const { error } = await supabase.storage.from(bucket).remove([fileName]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
