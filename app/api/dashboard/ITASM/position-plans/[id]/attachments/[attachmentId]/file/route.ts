import { NextResponse } from "next/server";
import { dashboardFileProxy } from "@/app/lib/dashboardProxy";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string; attachmentId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id, attachmentId } = await context.params;
  if (
    !/^[1-9]\d*$/.test(id) ||
    !/^[1-9]\d*$/.test(attachmentId) ||
    Number(id) > 2147483647 ||
    Number(attachmentId) > 2147483647
  ) {
    return NextResponse.json({ message: "ID không hợp lệ." }, { status: 400 });
  }
  return dashboardFileProxy(
    `/ITASM/position-plans/${id}/attachments/${attachmentId}/file`,
  );
}
