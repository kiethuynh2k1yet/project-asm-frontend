import { dashboardProxy } from "@/app/lib/dashboardProxy";

export const runtime = "nodejs";

export function GET() {
  return dashboardProxy("/ITASM/position-plans/options", "GET");
}
