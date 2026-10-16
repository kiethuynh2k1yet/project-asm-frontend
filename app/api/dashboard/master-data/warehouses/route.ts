import { collectionRoutes } from "../_lib/routeHandlers";

const routes = collectionRoutes("warehouses");

export const runtime = "nodejs";
export const GET = routes.GET;
export const POST = routes.POST;
