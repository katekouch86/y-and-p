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
        default: "Y&P Agency (Young and Pretty) — Luxury Escort Companionship in Italy | Rome, Milan, Florence, Bologna, Turin",
        template: `%s | ${SITE_NAME}`,
    },
    description:
        `Y&P Agency (Young and Pretty) is a premier escort agency in Italy offering luxury companionship in ${CITY_COPY}. Discover elite Slavic and Eastern European models for private dinners, travel, business events, and VIP escort experiences across Italy.`,
    keywords: [
        // Brand
        "Y&P Agency", "Y and P Agency", "Young and Pretty", "Young and Pretty Agency",
        "Young & Pretty escort", "YP Agency", "youngandpretty",
        // Italy — general
        "escort Italy", "escort service Italy", "escort agency Italy",
        "luxury escort Italy", "elite escort Italy", "VIP escort Italy",
        "Slavic escort Italy", "Ukrainian escort Italy", "Eastern European escort Italy",
        "companionship Italy", "luxury companionship Italy",
        "escort girls Italy", "escort models Italy",
        // Rome
        "escort Rome", "escort service Rome", "escort agency Rome",
        "escort girls Rome", "escort models Rome", "luxury escort Rome", "VIP escort Rome", "Slavic escort Rome",
        // Milan
        "escort Milan", "escort service Milan", "escort agency Milan",
        "luxury escort Milan", "VIP escort Milan", "Slavic escort Milan",
        // Florence
        "escort Florence", "escort service Florence", "luxury escort Florence", "VIP escort Florence",
        // Bologna
        "escort Bologna", "escort service Bologna", "luxury escort Bologna",
        // Turin
        "escort Turin", "escort service Turin", "luxury escort Turin",
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
        title: "Y&P Agency (Young and Pretty) — Luxury Escort Companionship in Italy",
        description:
            `Y&P Agency (Young and Pretty) offers exclusive escort companionship in ${CITY_COPY}. Elite Slavic models for private dinners, travel, and VIP events across Italy.`,
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
        title: "Y&P Agency (Young and Pretty) — Luxury Escort Companionship in Italy",
        description:
            `Y&P Agency (Young and Pretty) offers exclusive escort companionship in ${CITY_COPY}. Elite Slavic models for private dinners, travel, and VIP events.`,
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
