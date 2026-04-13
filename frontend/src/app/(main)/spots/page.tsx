import SpotsPageContent from "@/components/spot/SpotsPageContent";
import { Suspense } from "react";

export default function SpotsPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <SpotsPageContent />
    </Suspense>
  );
}
