import { itemRoutes } from "../../../master-data/_lib/routeHandlers";
import { dashboardProxy } from "@/app/lib/dashboardProxy";

const routes = itemRoutes(
  "position-plans",
  "/ITASM/position-plans",
);

export const runtime = "nodejs";
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;
  if (!/^[1-9]\d*$/.test(id) || Number(id) > 2147483647) {
    return Response.json({ message: "ID không hợp lệ." }, { status: 400 });
  }
  return dashboardProxy(`/ITASM/position-plans/${id}`, "GET");
}
