import { NextResponse } from "next/server";
import { dashboardProxy } from "@/app/lib/dashboardProxy";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseId(id: string): number | null {
  const numericId = Number(id);

  return /^\d+$/.test(id) &&
    Number.isInteger(numericId) &&
    numericId > 0 &&
    numericId <= 2147483647
    ? numericId
    : null;
}

export async function PUT(
  request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;
  const numericId = parseId(id);

  if (numericId === null) {
    return NextResponse.json(
      { message: "ID cấp bậc không hợp lệ." },
      { status: 400 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Body phải là JSON hợp lệ." },
      { status: 400 },
    );
  }

  return dashboardProxy(`/ranks/${numericId}`, "PUT", body);
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;
  const numericId = parseId(id);

  if (numericId === null) {
    return NextResponse.json(
      { message: "ID cấp bậc không hợp lệ." },
      { status: 400 },
    );
  }

  return dashboardProxy(`/ranks/${numericId}`, "DELETE");
}