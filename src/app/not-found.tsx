"use client";

import Header from "@/components/layout/header/Header";
import "./NotFound.scss";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <>
            <Header />
            <div className="not-found__wrapper">
                <h1 className="not-found__title">404</h1>
                <p className="not-found__text">Page not found</p>
                <button
                    className="not-found__button"
                    onClick={() => router.push("/")}
                >
                    Turn on Home Page
                </button>
            </div>
        </>
    );
}
