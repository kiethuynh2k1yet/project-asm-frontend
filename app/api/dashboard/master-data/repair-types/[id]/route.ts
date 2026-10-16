import { itemRoutes } from "../../_lib/routeHandlers";

const routes = itemRoutes("repair-types");

export const runtime = "nodejs";
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
