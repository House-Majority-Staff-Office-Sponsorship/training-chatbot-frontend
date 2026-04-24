import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://training-chatbot-backend.vercel.app";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/warmup`, {
      method: "GET",
      cache: "no-store",
    });
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
