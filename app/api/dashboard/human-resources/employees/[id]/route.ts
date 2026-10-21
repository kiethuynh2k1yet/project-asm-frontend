import { NextResponse } from "next/server";
import { dashboardProxy } from "@/app/lib/dashboardProxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseId(value: string): number | null {
  const id = Number(value);
  return /^\d+$/.test(value) &&
    Number.isInteger(id) &&
    id > 0 &&
    id <= 2147483647
    ? id
    : null;
}

async function update(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = parseId(id);
  if (numericId === null) {
    return NextResponse.json({ message: "ID không hợp lệ." }, { status: 400 });
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

  return dashboardProxy(`/employee/${numericId}`, "PATCH", body);
}

export function PATCH(request: Request, context: RouteContext) {
  return update(request, context);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = parseId(id);
  if (numericId === null) {
    return NextResponse.json({ message: "ID không hợp lệ." }, { status: 400 });
  }

  return dashboardProxy(`/employee/${numericId}`, "DELETE");
}
