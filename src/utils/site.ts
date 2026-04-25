export const SITE_NAME = "Y&P Agency";
export const SITE_URL = "https://www.youngandpretty.agency";

export function getSiteUrl(path = "/"): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return new URL(normalizedPath, SITE_URL).toString();
}
