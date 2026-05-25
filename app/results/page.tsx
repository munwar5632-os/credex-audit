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
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [captured, setCaptured] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [formData, setFormData] = useState<StoredFormData | null>(null);
  const [aiSummary, setAiSummary] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("audit-data");
    if (!stored) {
      router.push("/");
      return;
    }
    const data: StoredFormData = JSON.parse(stored);
    setFormData(data);

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

  // Fetch AI summary when audit results are ready
  useEffect(() => {
    if (summary) {
      fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditSummary: summary }),
      })
        .then((res) => res.json())
        .then((data) => setAiSummary(data.summary))
        .catch(() =>
          setAiSummary(
            "We've analyzed your spending. See the breakdown above for savings opportunities.",
          ),
        );
    }
  }, [summary]);

  const handleCapture = async () => {
    // Honeypot check: hidden field must be empty
    const honeypot = (
      document.querySelector('input[name="honeypot"]') as HTMLInputElement
    )?.value;
    if (honeypot) {
      console.log("Bot detected – ignoring");
      return;
    }

    if (!email || !email.includes("@")) return;
    setCapturing(true);
    try {
      const captureRes = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyName: companyName || null,
          role: role || null,
          teamSize: formData?.teamSize,
          auditResults: summary,
          totalSavings: summary?.totalMonthlySavings,
        }),
      });
      const responseData = await captureRes.json();
      if (!captureRes.ok || !responseData.shareId) {
        throw new Error(responseData.error || "Failed to get share ID");
      }
      const shareId = responseData.shareId;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const shareableUrl = `${baseUrl}/share/${shareId}`;
      setShareUrl(shareableUrl);

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          savings: summary?.totalMonthlySavings,
          shareUrl: shareableUrl,
        }),
      });
      setCaptured(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
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

          {/* AI‑generated summary (or fallback) */}
          {aiSummary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700">{aiSummary}</p>
            </div>
          )}

          {summary.highSavingsCase && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 text-center">
              <p className="font-bold">
                🚀 You&apos;re saving over $500/month!
              </p>
              <p className="text-sm">
                Credex can help you save even more with discounted credits.
              </p>
            </div>
          )}

          {!captured ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              {/* Honeypot field – hidden from users */}
              <div style={{ display: "none" }}>
                <input
                  type="text"
                  name="honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Get your shareable report
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your email to receive a shareable link and a copy of these
                savings.
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="company">Company (optional)</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Acme Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role (optional)</Label>
                    <Input
                      id="role"
                      type="text"
                      placeholder="CTO, Founder, ..."
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCapture}
                  disabled={capturing}
                  className="w-full"
                >
                  {capturing ? "Sending..." : "Get my shareable report →"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
              <p className="font-bold text-green-700">
                ✅ Report sent to {email}!
              </p>
              <p className="text-sm mt-1">
                Share your savings with colleagues:
              </p>
              <a
                href={shareUrl}
                target="_blank"
                className="text-blue-600 underline break-all"
              >
                {shareUrl}
              </a>
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
