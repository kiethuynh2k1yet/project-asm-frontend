import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function GET() {
  try {
    if (!BACKEND_API_URL) {
      return NextResponse.json(
        {
          message: "Thiếu BACKEND_API_URL trong .env.local.",
        },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          message: "Chưa đăng nhập.",
        },
        { status: 401 },
      );
    }

   const backendUrl =
  `${BACKEND_API_URL.replace(/\/+$/, "")}/statuses?parent_id=2`;

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    // Đọc dạng text trước để xử lý được cả khi backend
    // trả về HTML hoặc nội dung không phải JSON.
    const responseText = await backendResponse.text();

    let data: unknown = null;

    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      console.error(
        "JOB STATUSES: Backend trả dữ liệu không phải JSON.",
        {
          url: backendUrl,
          status: backendResponse.status,
        },
      );
    }

    if (!backendResponse.ok) {
      let message = "Không thể lấy danh sách trạng thái công việc.";

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data
      ) {
        const backendMessage = data.message;

        if (typeof backendMessage === "string") {
          message = backendMessage;
        } else if (Array.isArray(backendMessage)) {
          message = backendMessage
            .filter((item) => typeof item === "string")
            .join(", ") || message;
        }
      }

      console.error("JOB STATUSES BACKEND ERROR:", {
        url: backendUrl,
        status: backendResponse.status,
      });

      return NextResponse.json(
        { message },
        { status: backendResponse.status },
      );
    }

    // Hỗ trợ response:
    // 1. [...]
    // 2. { data: [...] }
    const statuses = Array.isArray(data)
      ? data
      : typeof data === "object" &&
          data !== null &&
          "data" in data
        ? data.data
        : null;

    if (!Array.isArray(statuses)) {
      return NextResponse.json(
        {
          message: "Danh sách trạng thái từ backend không đúng định dạng.",
        },
        { status: 502 },
      );
    }

    const normalizedStatuses = statuses
      .map((item: unknown) => {
        if (
          typeof item !== "object" ||
          item === null ||
          !("id" in item) ||
          !("parent_id" in item) ||
          !("status_code" in item) ||
          !("status_name" in item)
        ) {
          return null;
        }

        const id = Number(item.id);
        const parentId = Number(item.parent_id);

        if (
          !Number.isInteger(id) ||
          id < 0 ||
          id > 255 ||
          parentId !== 2 ||
          typeof item.status_code !== "string" ||
          typeof item.status_name !== "string"
        ) {
          return null;
        }

        return {
          id,
          parent_id: parentId,
          status_code: item.status_code,
          status_name: item.status_name,
        };
      });

    if (normalizedStatuses.some((item) => item === null)) {
      return NextResponse.json(
        {
          message:
            "Dữ liệu trạng thái thiếu trường hoặc không thuộc nhóm công việc.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(normalizedStatuses, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("JOB STATUSES API ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Không thể xử lý yêu cầu lấy danh sách trạng thái công việc.",
      },
      { status: 500 },
    );
  }
}