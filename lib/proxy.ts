import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://training-chatbot-backend.vercel.app";
const BACKEND_API_KEY = process.env.BACKEND_API_KEY ?? "";

/**
 * Proxies a JSON POST request to the backend and returns the JSON response.
 */
export async function proxyJson(req: NextRequest, path: string) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(BACKEND_API_KEY && { "x-api-key": BACKEND_API_KEY }),
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the backend service" },
      { status: 502 }
    );
  }

  if (!backendRes.ok) {
    const text = await backendRes.text().catch(() => "");
    return NextResponse.json(
      { error: `Backend returned ${backendRes.status}`, detail: text },
      { status: backendRes.status }
    );
  }

  const data = await backendRes.json();
  return NextResponse.json(data);
}

/**
 * Proxies a POST request to the backend and streams the SSE response back.
 */
export async function proxyStream(req: NextRequest, path: string) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(BACKEND_API_KEY && { "x-api-key": BACKEND_API_KEY }),
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the backend service" },
      { status: 502 }
    );
  }

  if (!backendRes.ok) {
    const text = await backendRes.text().catch(() => "");
    return NextResponse.json(
      { error: `Backend returned ${backendRes.status}`, detail: text },
      { status: backendRes.status }
    );
  }

  // Pass through the SSE stream
  return new Response(backendRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
