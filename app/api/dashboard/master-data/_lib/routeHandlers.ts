import { NextResponse } from "next/server";
import { dashboardProxy } from "@/app/lib/dashboardProxy";

type ItemRouteContext = {
  params: Promise<{ id: string }>;
};

function parseId(id: string): number | null {
  const numericId = Number(id);
  return /^\d+$/.test(id) &&
    Number.isInteger(numericId) &&
    numericId > 0 &&
    numericId <= 2147483647
    ? numericId
    : null;
}

async function readBody(request: Request): Promise<unknown | NextResponse> {
  try {
    return await request.json();
  } catch {
    return NextResponse.json(
      { message: "Body phải là JSON hợp lệ." },
      { status: 400 },
    );
  }
}

export function collectionRoutes(
  resource: string,
  backendPath = `/master-data/${resource}`,
) {
  return {
    GET(request: Request) {
      const query = new URL(request.url).search;
      return dashboardProxy(`${backendPath}${query}`, "GET");
    },
    async POST(request: Request) {
      const body = await readBody(request);
      if (body instanceof NextResponse) return body;
      return dashboardProxy(backendPath, "POST", body);
    },
  };
}

export function itemRoutes(
  resource: string,
  backendPath = `/master-data/${resource}`,
) {
  const update = async (
    request: Request,
    context: ItemRouteContext,
    method: "PUT" | "PATCH",
  ) => {
    const { id } = await context.params;
    const numericId = parseId(id);
    if (numericId === null) {
      return NextResponse.json(
        { message: "ID không hợp lệ." },
        { status: 400 },
      );
    }

    const body = await readBody(request);
    if (body instanceof NextResponse) return body;
    return dashboardProxy(
      `${backendPath}/${numericId}`,
      method,
      body,
    );
  };

  return {
    PUT(request: Request, context: ItemRouteContext) {
      return update(request, context, "PUT");
    },
    PATCH(request: Request, context: ItemRouteContext) {
      return update(request, context, "PATCH");
    },
    async DELETE(_request: Request, context: ItemRouteContext) {
      const { id } = await context.params;
      const numericId = parseId(id);
      if (numericId === null) {
        return NextResponse.json(
          { message: "ID không hợp lệ." },
          { status: 400 },
        );
      }
      return dashboardProxy(
        `${backendPath}/${numericId}`,
        "DELETE",
      );
    },
  };
}
