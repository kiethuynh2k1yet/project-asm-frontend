import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;

  const isLoginPage = pathname === "/login";
  const isProtectedPage = pathname.startsWith("/dashboard");

  // Chưa đăng nhập nhưng cố tình truy cập Dashboard.
  if (isProtectedPage && !accessToken) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Đã đăng nhập nhưng truy cập lại trang Login.
  if (isLoginPage && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};