import { upload } from "@vercel/blob/client";

export async function uploadImageToBlob(
  userId: string,
  folder: string,
  file: File,
): Promise<string> {
  const result = await upload(`profile/${userId}/${folder}/${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/profile/blob-upload",
  });

  return result.url;
}
