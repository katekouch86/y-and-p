import type { Metadata } from "next";
import "./globals.css";
import PageWrapper from "@/components/page-wrapper/PageWrapper";
import ScrollToTop from "@/utils/ScrollToTop";

export const metadata: Metadata = {
    title: "Y&P Agency — Luxury Companionship in Italy",
    description:
        "Exclusive encounters with elegant Slavic ladies in Milan and Rome. Luxury, confidentiality, and pleasure without compromise.",
    icons: {
        icon: [{ url: "/favicon.png", type: "image/png", sizes: "64x64" }],
    },
    robots: "index, follow",
    openGraph: {
        title: "Y&P Agency — Luxury Companionship in Italy",
        description:
            "Exclusive encounters with elegant Slavic ladies in Milan and Rome. Luxury, confidentiality, and pleasure without compromise.",
        url: "https://yandp.agency/",
        siteName: "Y&P Agency",
        images: [
            {
                url: "https://yandp.agency/images/banner-image.png",
                width: 1200,
                height: 630,
                alt: "Y&P Agency banner image",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    alternates: { canonical: "https://yandp.agency/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            {/* ✅ Static meta tags for WhatsApp, Telegram, and Twitter */}
            <meta name="robots" content="index, follow" />

            {/* --- Open Graph --- */}
            <meta
                property="og:title"
                content="Y&P Agency — Luxury Companionship in Italy"
            />
            <meta
                property="og:description"
                content="Exclusive encounters with elegant Slavic ladies in Milan and Rome. Luxury, confidentiality, and pleasure without compromise."
            />
            <meta property="og:url" content="https://yandp.agency/" />
            <meta property="og:type" content="website" />
            <meta
                property="og:image"
                content="https://yandp.agency/images/banner-image.png"
            />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta
                property="og:image:alt"
                content="Y&P Agency banner image"
            />

            {/* --- Twitter fallback (used by Meta bots too) --- */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta
                name="twitter:title"
                content="Y&P Agency — Luxury Companionship in Italy"
            />
            <meta
                name="twitter:description"
                content="Exclusive encounters with elegant Slavic ladies in Milan and Rome. Luxury, confidentiality, and pleasure without compromise."
            />
            <meta
                name="twitter:image"
                content="https://yandp.agency/images/banner-image.png"
            />

            {/* --- Favicon --- */}
            <link
                rel="icon"
                href="https://yandp.agency/favicon.png"
                type="image/png"
                sizes="64x64"
            />
        </head>
        <body>
        <PageWrapper>
            <ScrollToTop />
            {children}
        </PageWrapper>
        </body>
        </html>
    );
}
