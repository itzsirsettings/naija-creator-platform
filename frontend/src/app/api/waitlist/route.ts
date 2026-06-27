import { NextRequest, NextResponse } from "next/server";
import { participantSchema } from "@/lib/creator-schemas";

const INTAKE_API_URL = "https://mptforms.xyz/api/creator-submit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = participantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const upstream = await fetch(INTAKE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const result = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: result.error ?? "Submission failed. Please try again." },
        { status: upstream.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist submit error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
