"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  const router = useRouter();
  const [auditData, setAuditData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("audit-data");
    if (!stored) {
      router.push("/");
      return;
    }
    setAuditData(JSON.parse(stored));
  }, [router]);

  if (!auditData) {
    return <div className="text-center py-12">Loading audit results...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Audit Results (Coming Day 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Your audit is being processed. The full savings analysis will appear
            tomorrow.
          </p>
          <pre className="bg-muted p-4 rounded text-sm overflow-auto">
            {JSON.stringify(auditData, null, 2)}
          </pre>
          <Button className="mt-6" onClick={() => router.push("/")}>
            Back to form
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
