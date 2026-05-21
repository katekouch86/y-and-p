import CompanyInfoBar from "@/components/company-info-bar/CompanyInfoBar";
import HeroSection from "@/components/hero-section/HeroSection";
import { CITIES } from "@/constants/cities";
import { SITE_NAME, SITE_URL } from "@/utils/site";

const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.svg`,
    sameAs: ["https://x.com/youngandpr", "https://wa.me/380738620859"],
};

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Luxury Escort Companionship in Italy",
    provider: { "@type": "Organization", name: SITE_NAME },
    areaServed: CITIES.map((city) => ({
        "@type": "City",
        name: city,
        addressCountry: "IT",
    })),
};

export default function Home() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <HeroSection />
            <CompanyInfoBar />
        </>
    );
}
