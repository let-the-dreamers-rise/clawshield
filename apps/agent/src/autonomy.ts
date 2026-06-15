export interface AutonomyStep {
  step: number;
  phase: "propose" | "guard" | "replan" | "preview" | "execute" | "recover";
  reasoning: string;
  action?: string;
  verdict?: string;
  riskScore?: number;
  reasonCodes?: string[];
  byrealSkills?: string[];
}

export class AutonomyLog {
  private steps: AutonomyStep[] = [];
  private counter = 0;

  record(step: Omit<AutonomyStep, "step">): AutonomyStep {
    this.counter += 1;
    const entry = { step: this.counter, ...step };
    this.steps.push(entry);
    this.print(entry);
    return entry;
  }

  private print(entry: AutonomyStep): void {
    const verdict = entry.verdict ? ` [${entry.verdict}]` : "";
    const risk = entry.riskScore !== undefined ? ` risk=${entry.riskScore}` : "";
    const skills = entry.byrealSkills?.length ? ` skills=[${entry.byrealSkills.join(" → ")}]` : "";
    console.log(`🧠 Autonomy #${entry.step} (${entry.phase})${verdict}${risk}${skills}`);
    console.log(`   ${entry.reasoning}`);
    if (entry.action) console.log(`   action: ${entry.action}`);
    if (entry.reasonCodes?.length) console.log(`   reasons: ${entry.reasonCodes.join(", ")}`);
  }

  summary(): AutonomyStep[] {
    console.log(`\n📋 Autonomy log: ${this.steps.length} reasoning steps`);
    return [...this.steps];
  }

  getSteps(): AutonomyStep[] {
    return [...this.steps];
  }
}
