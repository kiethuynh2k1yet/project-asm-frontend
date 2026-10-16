import { collectionRoutes } from "../_lib/routeHandlers";

const routes = collectionRoutes("units");

export const runtime = "nodejs";
export const GET = routes.GET;
export const POST = routes.POST;
