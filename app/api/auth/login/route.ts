import { NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function POST(request: Request) {
  try {
    if (!BACKEND_API_URL) {
      return NextResponse.json(
        {
          message: "Thiếu BACKEND_API_URL trong .env.local.",
        },
        {
          status: 500,
        },
      );
    }

    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json(
        {
          message: "Vui lòng nhập username/email và mật khẩu.",
        },
        {
          status: 400,
        },
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          login,
          password,
        }),
        cache: "no-store",
      },
    );

    const responseText = await backendResponse.text();

    let data: {
      accessToken?: string;
      token?: string;
      message?: string;
      user?: unknown;
    };

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          message: "Backend không trả về JSON.",
          backendStatus: backendResponse.status,
          backendResponse: responseText.slice(0, 300),
        },
        {
          status: 502,
        },
      );
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message: data.message || "Đăng nhập thất bại.",
        },
        {
          status: backendResponse.status,
        },
      );
    }

    const accessToken = data.accessToken || data.token;

    if (!accessToken) {
      return NextResponse.json(
        {
          message:
            "Backend đăng nhập thành công nhưng không trả về accessToken hoặc token.",
        },
        {
          status: 500,
        },
      );
    }

    const response = NextResponse.json(
      {
        message: "Đăng nhập thành công.",
        user: data.user,
      },
      {
        status: 200,
      },
    );

    response.cookies.set({
      name: "access_token",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        message: "Không thể xử lý yêu cầu đăng nhập.",
      },
      {
        status: 500,
      },
    );
  }
}