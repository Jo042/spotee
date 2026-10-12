import { Suspense } from "react";
import { CollectionsPageContent } from "@/components/collection/CollectionsPageContent";

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <CollectionsPageContent />
    </Suspense>
  );
}
