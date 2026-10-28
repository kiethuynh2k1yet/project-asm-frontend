import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function GET() {
  try {
    if (!BACKEND_API_URL) {
      return NextResponse.json(
        { message: "Thiếu BACKEND_API_URL trong .env.local." },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }

    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await backendResponse.json();

    console.log("BACKEND PROFILE RESPONSE:", data);

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message: data.message || "Không thể lấy thông tin người dùng.",
        },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json({
      user: {
        name: data.username,
        email: data.email,
        role: data.role,
        employeeCode: data.employeeCode,
        fullName: data.fullName,
      },
    });
  } catch (error) {
    console.error("AUTH PROFILE API ERROR:", error);

    return NextResponse.json(
      { message: "Không thể xử lý yêu cầu lấy thông tin người dùng." },
      { status: 500 },
    );
  }
}
