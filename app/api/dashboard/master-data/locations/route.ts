import { collectionRoutes } from "../_lib/routeHandlers";

const routes = collectionRoutes("locations");

export const runtime = "nodejs";
export const GET = routes.GET;
export const POST = routes.POST;
