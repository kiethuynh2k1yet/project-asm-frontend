import { itemRoutes } from "../../_lib/routeHandlers";

const routes = itemRoutes("suppliers");

export const runtime = "nodejs";
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
