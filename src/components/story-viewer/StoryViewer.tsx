'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    memo,
} from 'react';
import {canonCity} from '@/utils/availability';
import './StoryViewer.scss';
import type {Slide, StoryViewerProps} from '@/types/story-viewer';

type WithMedia = {
    id?: string;
    slug: string;
    name: string;
    photo?: string;
    gallery?: string[];
    videos?: string[];
    city?: string;
};

type PreparedItem = {
    model: WithMedia;
    slides: Slide[];
};

function normalize(raw?: string | { src: string }): string {
    if (!raw) return '/images/placeholder.jpg';
    const src = typeof raw === 'string' ? raw : raw.src;
    if (!src) return '/images/placeholder.jpg';
    return !src.startsWith('http') && !src.startsWith('/') ? `/${src}` : src;
}

function isVideoUrl(s: string): boolean {
    return /\.(mp4|webm|ogg|ogv|mov|qt)(\?.*)?$/i.test(s);
}

function getModelCity(m: unknown): string {
    if (m && typeof m === 'object' && 'city' in m) {
        const city = (m as { city?: string }).city;
        return typeof city === 'string' ? city : '';
    }
    return '';
}

const Bar = memo(function Bar({
                                  filled,
                                  activeWidth,
                              }: {
    filled: boolean;
    activeWidth: number;
}) {
    return (
        <span className="story__bar">
      <span
          className="story__bar-fill"
          style={{width: filled ? '100%' : `${activeWidth}%`}}
      />
    </span>
    );
});

export default function StoryViewer({
                                        models,
                                        startModelIndex,
                                        onClose,
                                        city,
                                    }: StoryViewerProps) {
    const prepared: PreparedItem[] = useMemo(() => {
        return models
            .map((m) => {
                const uniq = new Set<string>();

                if ('videos' in m && Array.isArray(m.videos)) {
                    for (const v of m.videos) uniq.add(normalize(v));
                }

                if ('photo' in m && typeof m.photo === 'string') {
                    uniq.add(normalize(m.photo));
                }

                if ('gallery' in m && Array.isArray(m.gallery)) {
                    for (const g of m.gallery) uniq.add(normalize(g));
                }

                const slides: Slide[] = Array.from(uniq).map((src) => ({
                    type: isVideoUrl(src) ? 'video' : 'image',
                    src,
                }));

                const model: WithMedia = {
                    id: 'id' in m && typeof m.id === 'string' ? m.id : undefined,
                    slug: m.slug,
                    name: m.name,
                    photo: 'photo' in m ? m.photo : undefined,
                    gallery: 'gallery' in m ? m.gallery : undefined,
                    videos: 'videos' in m ? m.videos : undefined,
                    city: 'city' in m ? m.city : undefined,
                };

                return {model, slides};
            })
            .filter((x) => x.slides.length > 0);
    }, [models]);

    const [mi, setMi] = useState(0);
    const [si, setSi] = useState(0);

    useEffect(() => {
        const clampMi = Math.min(
            Math.max(0, startModelIndex),
            Math.max(0, prepared.length - 1)
        );
        setMi(clampMi);
        setSi(0);
    }, [prepared.length, startModelIndex]);

    const hasSlides = prepared.length > 0;
    const current = hasSlides ? prepared[mi] : null;
    const total = current?.slides.length ?? 0;

    const [pendingClose, setPendingClose] = useState(false);
    useEffect(() => {
        if (!pendingClose) return;
        Promise.resolve().then(() => {
            onClose();
            setPendingClose(false);
        });
    }, [pendingClose, onClose]);

    const [progress, setProgress] = useState(0);
    const timerRef = useRef<number | null>(null);

    const [videoDurMs, setVideoDurMs] = useState<number>(8000);
    const baseDurImage = 4000;
    const dur =
        current?.slides[si]?.type === 'video' ? videoDurMs : baseDurImage;

    const next = useCallback(() => {
        if (!hasSlides || total === 0) {
            setPendingClose(true);
            return;
        }
        setSi((prevSi) => {
            if (prevSi + 1 < total) return prevSi + 1;
            setMi((prevMi) => {
                if (prevMi + 1 < prepared.length) return prevMi + 1;
                setPendingClose(true);
                return prevMi;
            });
            return 0;
        });
    }, [hasSlides, total, prepared.length]);

    const prev = useCallback(() => {
        if (!hasSlides || total === 0) return;
        setSi((prevSi) => {
            if (prevSi > 0) return prevSi - 1;
            setMi((prevMi) => {
                if (prevMi > 0) {
                    const prevSlidesCount = prepared[prevMi - 1].slides.length;
                    setSi(prevSlidesCount - 1);
                    return prevMi - 1;
                }
                return prevMi;
            });
            return prevSi;
        });
    }, [hasSlides, total, prepared]);

    useEffect(() => {
        if (!hasSlides || total === 0) return;
        setProgress(0);
        if (timerRef.current) window.clearInterval(timerRef.current);

        const started = performance.now();
        const id = window.setInterval(() => {
            const t = performance.now() - started;
            const p = Math.min(100, (t / dur) * 100);
            setProgress(p);
            if (t >= dur) {
                window.clearInterval(id);
                next();
            }
        }, 50);

        timerRef.current = id;
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [mi, si, dur, next, hasSlides, total]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPendingClose(true);
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [next, prev]);

    if (!hasSlides || !current) return null;

    const m = current.model;
    const slide = current.slides[si];
    const cityForLink = canonCity(city ?? getModelCity(m));

    return (
        <div
            className="story"
            role="dialog"
            aria-modal="true"
            onClick={() => setPendingClose(true)}
        >
            <div className="story__wrap" onClick={(e) => e.stopPropagation()}>
                <div className="story__top">
                    <div className="story__bars">
                        {current.slides.map((_, i) => (
                            <Bar
                                key={i}
                                filled={i < si}
                                activeWidth={i === si ? progress : 0}
                            />
                        ))}
                    </div>
                    <button
                        className="story__close"
                        type="button"
                        aria-label="Close"
                        onClick={() => setPendingClose(true)}
                    >
                        ×
                    </button>
                </div>

                <div className="story__media">
                    <div className="story__box">
                        {slide.type === 'image' ? (
                            <Image
                                src={slide.src}
                                alt={m.name}
                                fill
                                sizes="(max-width: 768px) 90vw, 540px"
                                priority
                                unoptimized
                                style={{objectFit: 'contain'}}
                            />
                        ) : (
                            <video
                                className="story__video"
                                src={slide.src}
                                autoPlay
                                muted
                                playsInline
                                onLoadedMetadata={(e) => {
                                    const sec = e.currentTarget.duration;
                                    const ms = Math.max(
                                        8000,
                                        Math.min(15000, (Number.isFinite(sec) ? sec : 8) * 1000)
                                    );
                                    setVideoDurMs(ms);
                                }}
                                onEnded={next}
                            />
                        )}
                    </div>

                    <button
                        className="story__tap story__tap--left"
                        type="button"
                        aria-label="Prev"
                        onClick={prev}
                    />
                    <button
                        className="story__tap story__tap--right"
                        type="button"
                        aria-label="Next"
                        onClick={next}
                    />
                </div>

                <div className="story__info">
                    <div className="story__name">{m.name}</div>
                    <Link
                        className="story__link"
                        href={`/city/${cityForLink}/model/${m.slug}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Open profile
                    </Link>
                </div>
            </div>
        </div>
    );
}
