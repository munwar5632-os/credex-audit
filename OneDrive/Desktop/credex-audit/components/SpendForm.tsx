// app/components/SpendForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStorage } from "@/app/lib/useFormStorage";
import { toolLabels, toolPlans } from "@/app/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SpendForm() {
  const router = useRouter();
  const { formData, setFormData, isLoaded } = useFormStorage();
  const [activeTab, setActiveTab] = useState("tools");

  if (!isLoaded) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const updateTool = (
    index: number,
    updates: Partial<(typeof formData.tools)[0]>,
  ) => {
    const newTools = [...formData.tools];
    newTools[index] = { ...newTools[index], ...updates };
    setFormData({ ...formData, tools: newTools });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("audit-data", JSON.stringify(formData));
    router.push("/results");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
          <TabsTrigger value="team">Team & Usage</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Which AI tools does your team pay for?</CardTitle>
              <CardDescription>
                Select the tools you use and fill in your plan, monthly spend,
                and number of seats.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.tools.map((tool, idx) => (
                <div key={tool.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {toolLabels[tool.name]}
                    </h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tool.enabled}
                        onChange={(e) =>
                          updateTool(idx, { enabled: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Use this tool</span>
                    </label>
                  </div>
                  {tool.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Plan</Label>
                        <Select
                          value={tool.plan}
                          onValueChange={(val) =>
                            updateTool(idx, { plan: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {toolPlans[tool.name].map((plan) => (
                              <SelectItem key={plan} value={plan}>
                                {plan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Monthly spend ($)</Label>
                        <Input
                          type="number"
                          value={tool.monthlySpend || ""}
                          onChange={(e) =>
                            updateTool(idx, {
                              monthlySpend: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Number of seats</Label>
                        <Input
                          type="number"
                          value={tool.seats || 1}
                          onChange={(e) =>
                            updateTool(idx, {
                              seats: parseInt(e.target.value) || 1,
                            })
                          }
                          min={1}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="button" onClick={() => setActiveTab("team")}>
              Next: Team & Usage →
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team size and primary use case</CardTitle>
              <CardDescription>
                This helps us benchmark your spending.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Total team size (number of people)</Label>
                <Input
                  type="number"
                  value={formData.teamSize}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teamSize: parseInt(e.target.value) || 1,
                    })
                  }
                  min={1}
                  className="max-w-xs"
                />
              </div>
              <div>
                <Label>Primary use case for AI tools</Label>
                <Select
                  value={formData.primaryUseCase}
                  onValueChange={(val: any) =>
                    setFormData({ ...formData, primaryUseCase: val })
                  }
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coding">Coding / Development</SelectItem>
                    <SelectItem value="writing">Writing / Content</SelectItem>
                    <SelectItem value="data">Data analysis</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="mixed">Mixed / General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab("tools")}
            >
              ← Back
            </Button>
            <Button type="button" onClick={() => setActiveTab("review")}>
              Review →
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="review" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Review your AI spend</CardTitle>
              <CardDescription>
                Check your inputs before we audit for savings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Tools selected:</h3>
                <ul className="list-disc list-inside">
                  {formData.tools
                    .filter((t) => t.enabled)
                    .map((t) => (
                      <li key={t.id}>
                        {toolLabels[t.name]} – {t.plan} plan, ${t.monthlySpend}
                        /month, {t.seats} seat(s)
                      </li>
                    ))}
                </ul>
                {formData.tools.filter((t) => t.enabled).length === 0 && (
                  <p className="text-muted-foreground">
                    No tools selected – you'll see general optimization tips.
                  </p>
                )}
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p>
                  <strong>Team size:</strong> {formData.teamSize}
                </p>
                <p>
                  <strong>Primary use case:</strong> {formData.primaryUseCase}
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab("team")}
            >
              ← Back
            </Button>
            <Button type="submit">Run Audit →</Button>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}
