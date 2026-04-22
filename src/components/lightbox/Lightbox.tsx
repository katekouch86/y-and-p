"use client";

import Image from "next/image";
import {useEffect, useState, useCallback} from "react";
import "./Lightbox.scss";
import {IoMdClose} from "react-icons/io";
import {MdOutlineKeyboardArrowLeft} from "react-icons/md";
import {MdOutlineKeyboardArrowRight} from "react-icons/md";
import {LightboxProps} from "@/types/lightbox";
import { normalizeSrc, shouldBypassImageOptimization } from "@/utils/image";

export default function Lightbox({images, name, initialIndex = 0, onClose}: LightboxProps) {
    const safeStart = Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0));
    const [active, setActive] = useState(safeStart);
    const maxVisibleDots = 9;

    const prev = useCallback(() => setActive(i => (i - 1 + images.length) % images.length), [images.length]);
    const next = useCallback(() => setActive(i => (i + 1) % images.length), [images.length]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose, prev, next]);

    if (!images.length) return null;

    const activeSrc = normalizeSrc(images[active]);
    const unoptimized = shouldBypassImageOptimization(activeSrc);
    const hasHiddenStart = images.length > maxVisibleDots && active > Math.floor(maxVisibleDots / 2);
    const hasHiddenEnd = images.length > maxVisibleDots && active < images.length - Math.ceil(maxVisibleDots / 2);
    const windowStart = images.length <= maxVisibleDots
        ? 0
        : Math.min(
            Math.max(active - Math.floor(maxVisibleDots / 2), 0),
            images.length - maxVisibleDots,
        );
    const visibleIndices = images
        .map((_, index) => index)
        .slice(windowStart, windowStart + Math.min(maxVisibleDots, images.length));

    return (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${name} photo viewer`} onClick={onClose}>
            <button className="lightbox__close" aria-label="Close" onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}>
                <IoMdClose/>
            </button>

            <button className="lightbox__nav lightbox__nav--prev" aria-label="Previous" onClick={(e) => {
                e.stopPropagation();
                prev();
            }}>
                <MdOutlineKeyboardArrowLeft/>
            </button>

            <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
                <Image
                    src={activeSrc}
                    alt={`${name} photo ${active + 1}`}
                    fill
                    sizes="100vw"
                    priority
                    unoptimized={unoptimized}
                    style={{objectFit: "contain"}}
                />
            </div>

            <button className="lightbox__nav lightbox__nav--next" aria-label="Next" onClick={(e) => {
                e.stopPropagation();
                next();
            }}>
                <MdOutlineKeyboardArrowRight/>
            </button>

            <div className="lightbox__dots" aria-label="Select photo">
                {hasHiddenStart && <span className="lightbox__dots-ellipsis" aria-hidden="true">...</span>}
                {visibleIndices.map((i) => (
                    <button
                        key={i}
                        className={`lightbox__dot${i === active ? " lightbox__dot--active" : ""}`}
                        aria-current={i === active}
                        aria-label={`Go to ${i + 1}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActive(i);
                        }}
                    />
                ))}
                {hasHiddenEnd && <span className="lightbox__dots-ellipsis" aria-hidden="true">...</span>}
            </div>
        </div>
    );
}
