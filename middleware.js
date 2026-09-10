import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log("MIDDLEWARE:", pathname);

  // Public routes
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const protectedRoutes = [
    "/dashboard",
    "/mcqs",
    "/games",
    "/choose-language",
  ];

  const isProtected = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/mcqs/:path*",
    "/games/:path*",
    "/choose-language/:path*",
    "/api/:path*",
  ],
};
