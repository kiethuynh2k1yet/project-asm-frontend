import { NextResponse } from "next/server";
import { dashboardProxy } from "@/app/lib/dashboardProxy";

export const runtime = "nodejs";

export async function GET() {
  return dashboardProxy("/ranks", "GET");
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Body phải là JSON hợp lệ." },
      { status: 400 },
    );
  }

  return dashboardProxy("/ranks", "POST", body);
}