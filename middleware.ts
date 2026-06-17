export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/context/:path*",
    "/prospects/:path*",
    "/sequences/:path*",
    "/settings/:path*",
    "/for/:path*",
  ],
};
