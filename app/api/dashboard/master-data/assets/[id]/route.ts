import { itemRoutes } from "../../_lib/routeHandlers";

const routes = itemRoutes("assets");

export const runtime = "nodejs";
export const PUT = routes.PUT;
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
