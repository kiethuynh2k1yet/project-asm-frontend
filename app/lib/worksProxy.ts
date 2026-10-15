import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function worksProxy(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  try {
    const baseUrl = process.env.BACKEND_API_URL?.trim();

    if (!baseUrl) {
      return NextResponse.json(
        { message: "Thiếu BACKEND_API_URL." },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Chưa đăng nhập." },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${baseUrl.replace(/\/+$/, "")}${path}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          ...(body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
        },
        body: body !== undefined
          ? JSON.stringify(body)
          : undefined,
        cache: "no-store",
      },
    );

    const text = await response.text();
    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      console.error("[WORKS] Backend không trả JSON:", {
        path,
        status: response.status,
      });

      return NextResponse.json(
        {
          message: "Backend công việc không trả JSON.",
        },
        {
          status: response.ok ? 502 : response.status,
        },
      );
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[WORKS] PROXY ERROR:", error);

    return NextResponse.json(
      { message: "Không thể kết nối API công việc." },
      { status: 502 },
    );
  }
}