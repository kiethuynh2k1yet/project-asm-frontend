import { collectionRoutes } from "../_lib/routeHandlers";

const routes = collectionRoutes("room-types");

export const runtime = "nodejs";
export const GET = routes.GET;
export const POST = routes.POST;
