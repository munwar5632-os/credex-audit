import { describe, it, expect } from "vitest";
import { auditSpend, generateAuditSummary } from "../app/lib/audit-engine";

describe("Audit Engine", () => {
  it("detects overspend: Claude Team with 1 seat", () => {
    const result = auditSpend("claude", "Team", 30, 1, 1, "writing");
    expect(result.savingsPerMonth).toBeGreaterThan(0);
    expect(result.recommendedPlan).toBe("Free");
  });

  it("no savings for optimal Cursor Pro (1 seat)", () => {
    const result = auditSpend("cursor", "Pro", 20, 1, 1, "coding");
    expect(result.savingsPerMonth).toBe(0);
    expect(result.recommendedAction).toBe("You are on the optimal plan");
  });

  it("recommends Copilot for high-spend Cursor coding", () => {
    const result = auditSpend("cursor", "Pro", 200, 10, 10, "coding");
    expect(result.recommendedAction).toContain("GitHub Copilot");
    expect(result.savingsPerMonth).toBeGreaterThan(0);
  });

  it("downgrades ChatGPT Team with 1 seat", () => {
    const result = auditSpend("chatgpt", "Team", 30, 1, 1, "writing");
    expect(result.savingsPerMonth).toBe(10); // Plus at $20 vs Team $30
    expect(result.recommendedPlan).toBe("Plus");
  });

  it("generates correct total savings", () => {
    const tools = [
      { name: "cursor", plan: "Business", monthlySpend: 80, seats: 2 },
      { name: "claude", plan: "Team", monthlySpend: 30, seats: 1 },
    ];
    const summary = generateAuditSummary(tools, 2, "coding");
    expect(summary.totalMonthlySavings).toBeGreaterThan(0);
    expect(summary.results.length).toBe(2);
    expect(typeof summary.highSavingsCase).toBe("boolean");
  });

  it("returns zero for API tools", () => {
    const result = auditSpend("openai-api", "API direct", 50, 1, 1, "data");
    expect(result.savingsPerMonth).toBe(0);
  });
});
