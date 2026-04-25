import type { Metadata } from "next";
import { formatCityList, CITIES } from "@/constants/cities";
import "./globals.css";
import PageWrapper from "@/components/page-wrapper/PageWrapper";
import ScrollToTop from "@/utils/ScrollToTop";
import { SITE_NAME, SITE_URL } from "@/utils/site";

const CITY_COPY = formatCityList(CITIES);

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Y&P Agency — Luxury Companionship in Italy",
        template: `%s | ${SITE_NAME}`,
    },
    description:
        `Exclusive encounters with elegant Slavic ladies in ${CITY_COPY}. Luxury, confidentiality, and pleasure without compromise.`,
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
        title: "Y&P Agency — Luxury Companionship in Italy",
        description:
            `Exclusive encounters with elegant Slavic ladies in ${CITY_COPY}. Luxury, confidentiality, and pleasure without compromise.`,
        url: "/",
        siteName: SITE_NAME,
        images: [
            {
                url: "/images/banner-image.png",
                width: 1200,
                height: 630,
                alt: "Y&P Agency banner image",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Y&P Agency — Luxury Companionship in Italy",
        description:
            `Exclusive encounters with elegant Slavic ladies in ${CITY_COPY}. Luxury, confidentiality, and pleasure without compromise.`,
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
        </html>
    );
}
