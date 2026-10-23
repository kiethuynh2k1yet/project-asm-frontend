import { dashboardProxy } from "@/app/lib/dashboardProxy";

export const runtime = "nodejs";

export function GET() {
  return dashboardProxy("/employee/position-plans", "GET");
}
