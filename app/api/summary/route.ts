import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { auditSummary } = await request.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) throw new Error("No API key");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 150,
          messages: [
            {
              role: "user",
              content: `You are a financial advisor. Write an 80-100 word summary of this AI tool audit: ${JSON.stringify(auditSummary)}. Be specific about tools. Mention biggest saving. Write in second person. No bullet points.`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq error:", JSON.stringify(errorData));
      throw new Error("API error");
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    return NextResponse.json({
      summary:
        "We've analyzed your AI subscriptions. Review the per-tool breakdown above for the best ways to save.",
    });
  }
}
