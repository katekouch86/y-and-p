"use client";

import React, { useEffect, useRef } from "react";
import "./ModelVideo.scss";
import { ModelVideoProps } from "@/types/model-video";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";

export default function ModelAboutSection({ name, city, videos = [], about }: ModelVideoProps) {
    const aboutText =
        (about && about.trim()) ||
        `${name}: professional gymnast, loves white wine and warm hugs. Always energetic, with a charisma that can be felt even through the screen. Every meeting with her turns into a unique experience.`;
    const prevRef = useRef<HTMLButtonElement | null>(null);
    const nextRef = useRef<HTMLButtonElement | null>(null);
    const swiperRef = useRef<SwiperType | null>(null);

    const handleScroll = () => {
        const el = document.getElementById("availability");
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const videoList = videos.filter(Boolean);
    const hasVideo = videoList.length > 0;
    const hasVideoSlider = videoList.length > 1;

    useEffect(() => {
        if (!hasVideoSlider || !swiperRef.current || !prevRef.current || !nextRef.current) return;

        const navParams = swiperRef.current.params
            .navigation as unknown as { prevEl?: HTMLElement | null; nextEl?: HTMLElement | null } | undefined;

        if (navParams) {
            navParams.prevEl = prevRef.current;
            navParams.nextEl = nextRef.current;
        }

        (swiperRef.current as SwiperType & {
            navigation?: { destroy: () => void; init: () => void; update: () => void };
        }).navigation?.destroy();
        (swiperRef.current as SwiperType & {
            navigation?: { destroy: () => void; init: () => void; update: () => void };
        }).navigation?.init();
        (swiperRef.current as SwiperType & {
            navigation?: { destroy: () => void; init: () => void; update: () => void };
        }).navigation?.update();
    }, [hasVideoSlider]);

    const renderVideo = (src: string, index: number) => (
        <div className="model-video__media">
            <video
                src={src}
                controls
                playsInline
                className="model-video__video"
                aria-label={`${name} vertical video ${index + 1}`}
            />
        </div>
    );

    return (
        <section className="model-video" aria-label={`${name} about`}>
            <div className="model-video__container">
                <header className="model-video__head">
                    <h2 className="model-video__title">{hasVideo ? "Video" : "About"}</h2>
                    <p className="model-video__subtitle">
                        A short look at <strong>{name}</strong>
                        {city && (
                            <>
                                {" "}
                                in <span className="model-video__city">{city}</span>
                            </>
                        )}
                    </p>
                </header>

                <div className="model-video__wrap">
                    {hasVideo && (
                        <div className="model-video__card">
                            {hasVideoSlider ? (
                                <div className="model-video__slider">
                                    <Swiper
                                        className="model-video__swiper"
                                        modules={[Navigation, Pagination, A11y]}
                                        slidesPerView={1}
                                        spaceBetween={12}
                                        pagination={{
                                            el: ".model-video__dots",
                                            clickable: true,
                                            dynamicBullets: true,
                                            dynamicMainBullets: 5,
                                        }}
                                        onBeforeInit={(swiper) => {
                                            swiperRef.current = swiper as SwiperType;
                                        }}
                                    >
                                        {videoList.map((videoSrc, index) => (
                                            <SwiperSlide className="model-video__slide" key={`${videoSrc}-${index}`}>
                                                {renderVideo(videoSrc, index)}
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>

                                    <div className="model-video__controls">
                                        <button
                                            ref={prevRef}
                                            className="model-video__nav model-video__nav--prev"
                                            aria-label="Previous video"
                                        >
                                            <MdOutlineKeyboardArrowLeft />
                                        </button>
                                        <ul className="model-video__dots" />
                                        <button
                                            ref={nextRef}
                                            className="model-video__nav model-video__nav--next"
                                            aria-label="Next video"
                                        >
                                            <MdOutlineKeyboardArrowRight />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                renderVideo(videoList[0], 0)
                            )}
                            <div className="model-video__hint">Best viewed with sound on 🔊</div>
                        </div>
                    )}

                    <aside
                        className="model-video__info"
                        style={!hasVideo ? { flex: "1 1 100%" } : undefined}
                    >
                        <div className="model-video__infocard">
                            <h3 className="model-video__infotitle">{name}</h3>
                            <p className="model-video__about">{aboutText}</p>

                            <button className="model-video__btn" onClick={handleScroll}>
                                Check availability
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
