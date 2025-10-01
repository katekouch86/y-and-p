import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // захищені маршрути
    if (pathname.startsWith("/admin/dashboard")) {
        const adminCookie = req.cookies.get("admin")?.value;

        if (adminCookie !== "true") {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
