import { describe, it, expect } from "vitest";
import { auditSpend, generateAuditSummary } from "../app/lib/audit-engine";

describe("Audit Engine", () => {
  it("detects overspend: Claude Team with 1 seat", () => {
    const result = auditSpend("claude", "Team", 30, 1, 1, "writing");
    expect(result.savingsPerMonth).toBeGreaterThan(0);
    expect(result.recommendedPlan).toBe("Free");
  });

  // Updated: Cursor Pro with 1 seat should downgrade to Hobby (saves $20)
  it("should recommend downgrade from Cursor Pro to Hobby for 1 seat", () => {
    const result = auditSpend("cursor", "Pro", 20, 1, 1, "coding");
    expect(result.savingsPerMonth).toBe(20);
    expect(result.recommendedAction).toBe("Switch to Hobby");
  });

  // Updated: high‑spend Cursor coding still downgrades to Hobby (Hobby exists)
  it("should recommend downgrade to Hobby even for high‑spend Cursor coding", () => {
    const result = auditSpend("cursor", "Pro", 200, 10, 10, "coding");
    expect(result.savingsPerMonth).toBe(200); // 10 seats * $20 saved
    expect(result.recommendedAction).toBe("Switch to Hobby");
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

  it("returns zero savings for API tools", () => {
    const result = auditSpend("openai-api", "API direct", 50, 1, 1, "data");
    expect(result.savingsPerMonth).toBe(0);
  });
});
