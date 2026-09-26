import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;

  const isLoginPage = pathname === "/login";
  const isProtectedPage = pathname.startsWith("/dashboard");

  // Chưa đăng nhập mà truy cập route cần bảo vệ
  if (isProtectedPage && !accessToken) {
    const loginUrl = new URL("/login", request.url);

    // Giữ cả pathname lẫn query, ví dụ:
    // /dashboard/orders?page=2
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  // Đã có token thì không cho quay về login
  if (isLoginPage && accessToken) {
    const redirectTo = request.nextUrl.searchParams.get("redirect");

    // Chỉ redirect nội bộ để tránh open redirect
    if (redirectTo?.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};