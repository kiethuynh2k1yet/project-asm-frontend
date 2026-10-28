import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function dashboardProxy(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown | FormData,
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
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }

    let requestBody: BodyInit | undefined;
    let isMultipart = false;
    if (body !== undefined) {
      if (typeof FormData !== "undefined" && body instanceof FormData) {
        requestBody = body;
        isMultipart = true;
      } else {
        requestBody = JSON.stringify(body);
      }
    }
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
      method,
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/json",
        ...(body !== undefined && !isMultipart
          ? { "Content-Type": "application/json" }
          : {}),
      },
      body: requestBody,
      cache: "no-store",
    });
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[DASHBOARD API] Backend không trả JSON:", {
        path,
        status: response.status,
      });
      return NextResponse.json(
        { message: "Backend không trả JSON." },
        { status: response.ok ? 502 : response.status },
      );
    }
    return NextResponse.json(data, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[DASHBOARD API] PROXY ERROR:", error);
    return NextResponse.json(
      { message: "Không thể kết nối API." },
      { status: 502 },
    );
  }
}

export async function dashboardFileProxy(path: string) {
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
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });
    const headers = new Headers({
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    const contentType = response.headers.get("content-type");
    const contentDisposition = response.headers.get("content-disposition");
    if (contentType) headers.set("Content-Type", contentType);
    if (contentDisposition)
      headers.set("Content-Disposition", contentDisposition);
    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("[DASHBOARD API] FILE PROXY ERROR:", error);
    return NextResponse.json(
      { message: "Không thể tải tệp." },
      { status: 502 },
    );
  }
}
