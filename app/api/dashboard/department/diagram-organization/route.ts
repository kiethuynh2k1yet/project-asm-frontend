import { collectionRoutes } from "../../master-data/_lib/routeHandlers";

const routes = collectionRoutes(
  "diagram-organization",
  "/ITASM/diagram-organization",
);

export const runtime = "nodejs";
export const GET = routes.GET;
export const POST = routes.POST;
