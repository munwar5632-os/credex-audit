import { notFound } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate Open Graph metadata dynamically for social sharing
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: lead } = await supabase
    .from("leads")
    .select("total_savings")
    .eq("share_id", id)
    .single();

  const savings = lead?.total_savings || 0;

  return {
    title: `AI Spend Audit: Save $${savings}/month`,
    description: `I audited my AI tools and found $${savings} in monthly savings. See how much you could save.`,
    openGraph: {
      title: `AI Spend Audit: $${savings}/month savings`,
      description:
        "Find hidden savings in your AI subscriptions (Cursor, ChatGPT, Claude, etc.)",
      type: "website",
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;

  // Fetch audit data (only public fields – no email/company/role)
  const { data: lead, error } = await supabase
    .from("leads")
    .select("audit_results, total_savings, created_at")
    .eq("share_id", id)
    .single();

  if (error || !lead) {
    notFound();
  }

  const summary = lead.audit_results as any;

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            AI Spend Audit Report
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Generated on {new Date(lead.created_at).toLocaleDateString()}
          </p>
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

          <h2 className="font-semibold text-xl mb-4">Per-Tool Breakdown</h2>
          {summary.results.map((result: any, idx: number) => (
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

          <div className="text-center mt-8">
            <Link href="/">
              <Button>Run your own audit →</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
