import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, savings, shareUrl } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "AI Spend Audit <onboarding@resend.dev>",
      to: email,
      subject: "Your AI Spend Audit Results",
      html: `
        <h1>Your AI Spend Audit Summary</h1>
        <p>We found potential savings of <strong>$${savings}/month</strong>.</p>
        <p>View your full report (shareable, no personal info):</p>
        <a href="${shareUrl}">${shareUrl}</a>
        <p>Credex will reach out if you qualify for deeper savings.</p>
        <p>Thanks for using our tool!</p>
      `,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
