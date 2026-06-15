import { notFound } from "next/navigation";
import { AgentProfile } from "@/components/AgentProfile";
import { getAgentById } from "@/lib/mock-data";
import { PageTransition } from "@/components/shared/PageTransition";

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = getAgentById(id);
  if (!agent) notFound();

  return (
    <PageTransition>
      <AgentProfile agent={agent} />
    </PageTransition>
  );
}
