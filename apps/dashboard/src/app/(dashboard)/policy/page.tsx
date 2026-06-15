import { PolicyEditor } from "@/components/PolicyEditor";
import { PageTransition } from "@/components/shared/PageTransition";

export default function PolicyPage() {
  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Policy <span className="text-gradient">Editor</span>
          </h1>
          <p className="mt-2 text-text-muted">
            Configure allowlist, slippage caps, and exposure limits — live block preview
          </p>
        </div>
        <PolicyEditor />
      </div>
    </PageTransition>
  );
}
