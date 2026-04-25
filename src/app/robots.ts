import type { MetadataRoute } from "next";
import { getSiteUrl, SITE_URL } from "@/utils/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/api"],
            },
        ],
        host: SITE_URL,
        sitemap: getSiteUrl("/sitemap.xml"),
    };
}
