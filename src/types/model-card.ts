import type { StaticImageData } from "next/image";

export interface ModelCardProps {
    src: string | StaticImageData;
    name: string;
    href: string;
    alt?: string;
    priority?: boolean;
}
