import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001/api/research";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the backend service" },
      { status: 502 }
    );
  }

  if (!backendRes.ok) {
    return NextResponse.json(
      { error: `Backend returned ${backendRes.status}` },
      { status: backendRes.status }
    );
  }

  const data = await backendRes.json();
  return NextResponse.json(data);
}
