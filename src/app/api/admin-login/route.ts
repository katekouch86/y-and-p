import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { password } = await request.json();

    if (password === process.env.ADMIN_PASSWORD) {
        const res = NextResponse.json({ message: "Login successful" });

        res.cookies.set("admin", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60,
            path: "/",
        });
        return res;
    }

    return NextResponse.json({ message: "Invalid password" }, { status: 401 });
}
