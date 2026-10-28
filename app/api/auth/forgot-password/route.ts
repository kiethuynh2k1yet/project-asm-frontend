import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendUrl = `${BACKEND_URL}/auth/forgot-password`;

    console.log("Calling NestJS:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: body.login,
        newPassword: body.newPassword,
        confirmPassword: body.confirmPassword,
      }),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";

    const responseText = await response.text();

    console.log("NestJS status:", response.status);
    console.log("NestJS content type:", contentType);

    let data: unknown;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      console.error("NestJS did not return JSON:", responseText.slice(0, 500));

      return NextResponse.json(
        {
          message:
            "Backend trả về HTML thay vì JSON. Kiểm tra BACKEND_URL, port và route NestJS.",
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Forgot password route error:", error);

    return NextResponse.json(
      {
        message: "Không thể kết nối đến backend.",
      },
      {
        status: 500,
      },
    );
  }
}
