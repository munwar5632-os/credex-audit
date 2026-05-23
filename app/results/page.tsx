// app/results/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuditSummary } from "@/app/lib/audit-engine";

interface StoredFormData {
  tools: Array<{
    name: string;
    plan: string;
    monthlySpend: number;
    seats: number;
    enabled: boolean;
  }>;
  teamSize: number;
  primaryUseCase: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [captured, setCaptured] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("audit-data");
    if (!stored) {
      router.push("/");
      return;
    }
    const data: StoredFormData = JSON.parse(stored);
    const tools = data.tools
      .filter((t) => t.enabled)
      .map((t) => ({
        name: t.name,
        plan: t.plan,
        monthlySpend: t.monthlySpend,
        seats: t.seats,
      }));

    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tools,
        teamSize: data.teamSize,
        primaryUseCase: data.primaryUseCase,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleCapture = async () => {
    if (!email || !email.includes("@")) return;
    setCapturing(true);
    try {
      await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          auditData: summary,
          totalSavings: summary?.totalMonthlySavings,
        }),
      });
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, savings: summary?.totalMonthlySavings }),
      });
      setCaptured(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCapturing(false);
    }
  };

  if (loading)
    return <div className="text-center py-12">Analyzing your spend...</div>;
  if (!summary)
    return <div className="text-center py-12">Error loading audit.</div>;

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            Your Savings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <p className="text-3xl font-bold text-green-600">
              ${summary.totalMonthlySavings}/month
            </p>
            <p className="text-xl text-muted-foreground">
              ${summary.totalAnnualSavings}/year
            </p>
          </div>

          {summary.highSavingsCase && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 text-center">
              <p className="font-bold">
                🚀 You&apos;re saving over $500/month!
              </p>
              <p className="text-sm">
                Credex can help you save even more with discounted credits.
              </p>
              <Button className="mt-2">Book a consultation</Button>
            </div>
          )}

          {summary.optimalCase && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6 text-center">
              <p className="font-bold">✅ You&apos;re spending well!</p>
              <p className="text-sm">
                Get notified when new optimizations apply to your stack.
              </p>
              {!captured ? (
                <div className="mt-4 max-w-sm mx-auto">
                  <Label htmlFor="email">Email address</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button onClick={handleCapture} disabled={capturing}>
                      {capturing ? "Sending..." : "Notify me"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-green-700 mt-2">
                  Thanks! We&apos;ll be in touch.
                </p>
              )}
            </div>
          )}

          <h2 className="font-semibold text-xl mb-4">Per-Tool Breakdown</h2>
          {summary.results.map((result, idx) => (
            <div key={idx} className="border rounded-lg p-4 mb-4">
              <h3 className="font-bold">{result.toolName}</h3>
              <p>
                Current: {result.currentPlan} – ${result.currentSpend}/month
              </p>
              {result.savingsPerMonth > 0 ? (
                <>
                  <p className="text-green-600">✓ {result.recommendedAction}</p>
                  <p className="text-green-600">
                    Save ${result.savingsPerMonth}/month
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">
                  {result.recommendedAction}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {result.reason}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Button
        onClick={() => router.push("/")}
        variant="outline"
        className="w-full"
      >
        ← Run another audit
      </Button>
    </main>
  );
}
