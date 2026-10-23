import { NextResponse } from "next/server";
import { dashboardProxy } from "@/app/lib/dashboardProxy";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;
  if (!/^[1-9]\d*$/.test(id) || Number(id) > 2147483647) {
    return NextResponse.json({ message: "ID không hợp lệ." }, { status: 400 });
  }
  try {
    const formData = await request.formData();
    return dashboardProxy(
      `/ITASM/position-plans/${id}/attachments`,
      "POST",
      formData,
    );
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu tải tệp không hợp lệ." },
      { status: 400 },
    );
  }
}
