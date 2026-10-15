import { NextResponse } from "next/server";
import { worksProxy } from "@/app/lib/worksProxy";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const query = new URLSearchParams();

  const keyword = url.searchParams.get("keyword");
  const statusId = url.searchParams.get("status_id");

  if (keyword !== null) {
    query.set("keyword", keyword);
  }

  if (statusId !== null && statusId !== "") {
    query.set("status_id", statusId);
  }

  const queryString = query.toString();

  return worksProxy(
    `/works${queryString ? `?${queryString}` : ""}`,
    "GET",
  );
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

  return worksProxy("/works", "POST", body);
}