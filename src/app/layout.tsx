import type {Metadata} from "next";
import "./globals.css";
import PageWrapper from "@/components/page-wrapper/PageWrapper";
import ScrollToTop from "@/utils/ScrollToTop";

export const metadata: Metadata = {
    title: "Y&P Agency — Luxury Companionship in Italy",
    description: "Exclusive encounters with elegant Slavic ladies in Milan and Rome. Luxury, confidentiality, and pleasure without compromise.",
    icons: {
        icon: [{ url: "/favicon.png", type: "image/png", sizes: "64x64" }],
    },
    robots: "index, follow",
    openGraph: {
        title: "Y&P Agency — Luxury Companionship in Italy",
        description: "Exclusive encounters with elegant Slavic ladies in Milan and Rome. Luxury, confidentiality, and pleasure without compromise.",
        url: "https://yandp.agency/",
        siteName: "Y&P Agency",
        images: [{url: "/images/banner-image.png", width: 1200, height: 630, alt: "Y&P Agency banner image"}],
        locale: "en_US",
        type: "website",
    },
    alternates: {canonical: "https://yandp.agency/"},
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <meta name="robots" content="index, follow"/>
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
