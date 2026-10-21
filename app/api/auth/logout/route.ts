import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.json({
    message: "Đăng xuất thành công.",
  });

  const useSecureCookie = new URL(request.url).protocol === "https:";

  response.cookies.set({
    name: "access_token",
    value: "",
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}