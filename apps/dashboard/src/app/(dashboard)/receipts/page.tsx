import { ReceiptExplorer } from "@/components/ReceiptExplorer";
import { PageTransition } from "@/components/shared/PageTransition";

export default function ReceiptsPage() {
  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Receipt <span className="text-gradient">Explorer</span>
          </h1>
          <p className="mt-2 text-text-muted">
            Search decision hashes — view full payload and Mantlescan proof
          </p>
        </div>
        <ReceiptExplorer />
      </div>
    </PageTransition>
  );
}
