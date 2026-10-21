import { itemRoutes } from "../../../master-data/_lib/routeHandlers";

const routes = itemRoutes(
  "diagram-organization",
  "/ITASM/diagram-organization",
);

export const runtime = "nodejs";
export const PUT = routes.PUT;
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
