import { NextRequest, NextResponse } from "next/server";
import { generateAuditSummary } from "@/app/lib/audit-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tools, teamSize, primaryUseCase } = body;
    const summary = generateAuditSummary(tools, teamSize, primaryUseCase);
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Audit failed" },
      { status: 500 },
    );
  }
}
