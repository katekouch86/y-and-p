import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { formatCityList, CITIES } from "@/constants/cities";
import "./globals.css";
import PageWrapper from "@/components/page-wrapper/PageWrapper";
import ScrollToTop from "@/utils/ScrollToTop";
import { SITE_NAME, SITE_URL } from "@/utils/site";

const CITY_COPY = formatCityList(CITIES);
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Y&P Agency — Luxury Escort Companionship in Italy | Rome, Milan, Florence",
        template: `%s | ${SITE_NAME}`,
    },
    description:
        `Y&P Agency offers exclusive escort companionship in ${CITY_COPY}. Elegant Slavic models available for private meetings, travel, and events. Luxury, discretion, and unforgettable experiences in Italy.`,
    keywords: [
        "escort",
        "escort Italy",
        "luxury companionship Italy",
        "escort Rome",
        "escort Milan",
        "escort Florence",
        "escort Bologna",
        "escort Turin",
        "Y&P Agency",
        "Slavic escort Italy",
        "escort agency Italy",
    ],
    icons: {
        icon: [{ url: "/favicon.png", type: "image/png", sizes: "64x64" }],
    },
    applicationName: SITE_NAME,
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
    openGraph: {
        title: "Y&P Agency — Luxury Escort Companionship in Italy",
        description:
            `Y&P Agency offers exclusive escort companionship in ${CITY_COPY}. Elegant Slavic models for private meetings, travel, and events. Luxury, discretion, and unforgettable experiences.`,
        url: "/",
        siteName: SITE_NAME,
        images: [
            {
                url: "/images/banner-image.png",
                width: 1200,
                height: 630,
                alt: "Y&P Agency — Luxury Escort Companionship in Italy",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Y&P Agency — Luxury Escort Companionship in Italy",
        description:
            `Y&P Agency offers exclusive escort companionship in ${CITY_COPY}. Elegant Slavic models for private meetings, travel, and events.`,
        images: ["/images/banner-image.png"],
    },
    alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <PageWrapper>
            <ScrollToTop />
            {children}
        </PageWrapper>
        </body>
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
        </html>
    );
}
