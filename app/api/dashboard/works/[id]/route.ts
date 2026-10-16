import { NextResponse } from "next/server";
import { dashboardProxy } from "@/app/lib/dashboardProxy";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (
    !/^\d+$/.test(id) ||
    !Number.isInteger(numericId) ||
    numericId < 1 ||
    numericId > 2147483647
  ) {
    return NextResponse.json(
      { message: "ID công việc không hợp lệ." },
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

  return dashboardProxy(`/works/${numericId}`, "PATCH", body);
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (
    !/^\d+$/.test(id) ||
    !Number.isInteger(numericId) ||
    numericId < 1 ||
    numericId > 2147483647
  ) {
    return NextResponse.json(
      { message: "ID công việc không hợp lệ." },
      { status: 400 },
    );
  }

  return dashboardProxy(`/works/${numericId}`, "DELETE");
}