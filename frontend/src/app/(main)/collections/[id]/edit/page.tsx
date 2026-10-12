import { CollectionEditContent } from "@/components/collection/CollectionEditContent";

export default async function CollectionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CollectionEditContent collectionId={id} />;
}
