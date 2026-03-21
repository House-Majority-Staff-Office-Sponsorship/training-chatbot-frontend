import { proxyJson } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return proxyJson(req, "/api/quiz/generate");
}
