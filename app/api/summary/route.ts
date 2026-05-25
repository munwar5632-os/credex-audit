import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { auditSummary } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no API key
    if (!apiKey) {
      return NextResponse.json({
        summary: `We found potential savings of $${auditSummary.totalMonthlySavings}/month. Check the per‑tool breakdown above for recommendations.`,
      });
    }

    const prompt = `You are a helpful financial advisor for AI tool spending. Based on this audit data, write a short, friendly, ~100-word summary that highlights the biggest savings opportunity and a specific recommendation. Audit data: ${JSON.stringify(auditSummary)}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) throw new Error("Gemini API error");
    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ summary });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      summary:
        "We've analyzed your AI subscriptions. Review the per‑tool breakdown above for the best ways to save.",
    });
  }
}
