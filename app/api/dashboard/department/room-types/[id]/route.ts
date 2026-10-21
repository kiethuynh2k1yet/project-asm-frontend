import { itemRoutes } from "../../../master-data/_lib/routeHandlers";

const routes = itemRoutes("room-types", "/ITASM/room-types");

export const runtime = "nodejs";
export const PUT = routes.PUT;
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
