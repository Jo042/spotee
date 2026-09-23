import { FolderDetailContent } from "@/components/bookmark/FolderDetailContent";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FolderDetailContent folderId={id} />;
}
