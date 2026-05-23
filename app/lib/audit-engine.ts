// app/lib/audit-engine.ts

export interface ToolPricing {
  plan: string;
  pricePerSeat: number;
  minSeats?: number;
}

export interface AuditResult {
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  seats: number;
  recommendedAction: string;
  recommendedPlan?: string;
  savingsPerMonth: number;
  reason: string;
}

export interface AuditSummary {
  results: AuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  highSavingsCase: boolean; // > $500/month
  optimalCase: boolean; // < $100 savings
}

// Hardcoded pricing from PRICING_DATA.md
const pricing: Record<string, ToolPricing[]> = {
  cursor: [
    { plan: "Hobby", pricePerSeat: 0 },
    { plan: "Pro", pricePerSeat: 20 },
    { plan: "Business", pricePerSeat: 40 },
  ],
  "github-copilot": [
    { plan: "Individual", pricePerSeat: 10 },
    { plan: "Business", pricePerSeat: 19 },
  ],
  claude: [
    { plan: "Free", pricePerSeat: 0 },
    { plan: "Pro", pricePerSeat: 20 },
    { plan: "Max", pricePerSeat: 30 },
    { plan: "Team", pricePerSeat: 30, minSeats: 2 },
  ],
  chatgpt: [
    { plan: "Plus", pricePerSeat: 20 },
    { plan: "Team", pricePerSeat: 30, minSeats: 2 },
  ],
  gemini: [
    { plan: "Pro", pricePerSeat: 20 },
    { plan: "Ultra", pricePerSeat: 30 },
  ],
  windsurf: [
    { plan: "Free", pricePerSeat: 0 },
    { plan: "Pro", pricePerSeat: 15 },
    { plan: "Team", pricePerSeat: 30 },
  ],
  "anthropic-api": [{ plan: "API direct", pricePerSeat: 0 }],
  "openai-api": [{ plan: "API direct", pricePerSeat: 0 }],
};

export function auditSpend(
  toolName: string,
  currentPlan: string,
  monthlySpend: number,
  seats: number,
  teamSize: number,
  primaryUseCase: string,
): AuditResult {
  const toolPricing = pricing[toolName];
  if (!toolPricing) {
    return {
      toolName,
      currentPlan,
      currentSpend: monthlySpend,
      seats,
      recommendedAction: "Unknown tool",
      savingsPerMonth: 0,
      reason: "Pricing data not available.",
    };
  }

  const current = toolPricing.find((p) => p.plan === currentPlan);
  if (!current) {
    return {
      toolName,
      currentPlan,
      currentSpend: monthlySpend,
      seats,
      recommendedAction: "Plan not recognized",
      savingsPerMonth: 0,
      reason: `Plan "${currentPlan}" not in database.`,
    };
  }

  // Rule 1: Minimum seats violation (e.g., Team plan with 1 seat)
  if (current.minSeats && seats < current.minSeats) {
    const cheapest = toolPricing.reduce((a, b) =>
      a.pricePerSeat < b.pricePerSeat ? a : b,
    );
    const newSpend = cheapest.pricePerSeat * seats;
    const savings = monthlySpend - newSpend;
    return {
      toolName,
      currentPlan,
      currentSpend: monthlySpend,
      seats,
      recommendedAction: `Downgrade to ${cheapest.plan}`,
      recommendedPlan: cheapest.plan,
      savingsPerMonth: Math.max(0, savings),
      reason: `${currentPlan} requires at least ${current.minSeats} seats. You have ${seats}. Switch to ${cheapest.plan}.`,
    };
  }

  // Rule 2: Cheaper plan exists
  const cheaper = toolPricing.find(
    (p) => p.pricePerSeat < current.pricePerSeat && !p.minSeats,
  );
  if (cheaper) {
    const newSpend = cheaper.pricePerSeat * seats;
    const savings = monthlySpend - newSpend;
    if (savings > 0) {
      return {
        toolName,
        currentPlan,
        currentSpend: monthlySpend,
        seats,
        recommendedAction: `Switch to ${cheaper.plan}`,
        recommendedPlan: cheaper.plan,
        savingsPerMonth: savings,
        reason: `${cheaper.plan} at $${cheaper.pricePerSeat}/seat/month meets your needs for less.`,
      };
    }
  }

  // Rule 3: Cross-tool recommendation (Cursor -> Copilot for coding)
  if (
    toolName === "cursor" &&
    primaryUseCase === "coding" &&
    monthlySpend > 100
  ) {
    const copilotPrice =
      pricing["github-copilot"].find((p) => p.plan === "Individual")
        ?.pricePerSeat || 10;
    const newSpend = copilotPrice * seats;
    const savings = monthlySpend - newSpend;
    if (savings > 0) {
      return {
        toolName,
        currentPlan,
        currentSpend: monthlySpend,
        seats,
        recommendedAction: `Switch to GitHub Copilot Individual`,
        recommendedPlan: "Individual",
        savingsPerMonth: savings,
        reason: `For coding, GitHub Copilot costs $${copilotPrice}/seat/month vs Cursor at $20/seat.`,
      };
    }
  }

  // Default: optimal
  return {
    toolName,
    currentPlan,
    currentSpend: monthlySpend,
    seats,
    recommendedAction: "You are on the optimal plan",
    savingsPerMonth: 0,
    reason: `Your ${currentPlan} plan appears optimal for ${seats} seat(s) with ${primaryUseCase} use case.`,
  };
}

export function generateAuditSummary(
  tools: Array<{
    name: string;
    plan: string;
    monthlySpend: number;
    seats: number;
  }>,
  teamSize: number,
  primaryUseCase: string,
): AuditSummary {
  const results = tools.map((tool) =>
    auditSpend(
      tool.name,
      tool.plan,
      tool.monthlySpend,
      tool.seats,
      teamSize,
      primaryUseCase,
    ),
  );
  const totalMonthlySavings = results.reduce(
    (sum, r) => sum + r.savingsPerMonth,
    0,
  );
  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    highSavingsCase: totalMonthlySavings > 500,
    optimalCase: totalMonthlySavings < 100,
  };
}
