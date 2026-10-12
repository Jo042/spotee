import { CollectionDetailContent } from "@/components/collection/CollectionDetailContent";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CollectionDetailContent collectionId={id} />;
}
