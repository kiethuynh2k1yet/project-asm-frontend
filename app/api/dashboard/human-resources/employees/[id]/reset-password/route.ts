import { NextResponse } from "next/server";
import { dashboardProxy } from "@/app/lib/dashboardProxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = Number(id);
  if (
    !/^\d+$/.test(id) ||
    !Number.isInteger(numericId) ||
    numericId < 1 ||
    numericId > 2147483647
  ) {
    return NextResponse.json({ message: "ID không hợp lệ." }, { status: 400 });
  }

  return dashboardProxy(`/employee/${numericId}/reset-password`, "POST");
}
