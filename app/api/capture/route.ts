import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyName, role, teamSize, auditResults, totalSavings } =
      body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 },
      );
    }

    // Insert into leads and get the generated share_id
    const { data, error } = await supabase
      .from("leads")
      .insert({
        email,
        company_name: companyName || null,
        role: role || null,
        team_size: teamSize || null,
        audit_results: auditResults,
        total_savings: totalSavings,
      })
      .select("share_id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data?.share_id) {
      return NextResponse.json(
        { error: "No share_id generated" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, shareId: data.share_id });
  } catch (error) {
    console.error("Capture error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
