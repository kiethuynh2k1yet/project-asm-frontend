import { collectionRoutes } from "../../master-data/_lib/routeHandlers";

const routes = collectionRoutes(
  "position-plans",
  "/ITASM/position-plans",
);

export const runtime = "nodejs";
export const GET = routes.GET;
export const POST = routes.POST;
