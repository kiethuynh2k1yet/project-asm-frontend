import { dashboardProxy } from "@/app/lib/dashboardProxy";

export const runtime = "nodejs";

export function GET(request: Request) {
  const query = new URL(request.url).search;
  return dashboardProxy(`/employee${query}`, "GET");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "Body phải là JSON hợp lệ." },
      { status: 400 },
    );
  }

  return dashboardProxy("/employee", "POST", body);
}
