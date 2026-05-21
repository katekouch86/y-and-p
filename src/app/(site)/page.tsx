import CompanyInfoBar from "@/components/company-info-bar/CompanyInfoBar";
import HeroSection from "@/components/hero-section/HeroSection";
import SeoText from "@/components/seo-text/SeoText";
import { CITIES } from "@/constants/cities";
import { SITE_NAME, SITE_URL } from "@/utils/site";

const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: [
        "Y and P Agency",
        "Young and Pretty",
        "Young and Pretty Agency",
        "Young & Pretty",
        "YP Agency",
    ],
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.svg`,
    sameAs: ["https://x.com/youngandpr", "https://wa.me/380738620859"],
};

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Luxury Escort Companionship in Italy",
    serviceType: [
        "Escort Service",
        "Luxury Companionship",
        "VIP Escort Service",
        "Elite Escort Agency",
    ],
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
            {/*<SeoText />*/}
        </>
    );
}
