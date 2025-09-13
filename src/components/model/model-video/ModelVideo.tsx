"use client";

import React from "react";
import "./ModelVideo.scss";
import {ModelVideoProps} from "@/types/model-video";

export default function ModelVideo({ name, city, videoUrl, about }: ModelVideoProps) {
    if (!videoUrl) return null;

    const aboutText =
        (about && about.trim()) ||
        `${name}: профессиональная гимнастка, любит белое вино и тёплые объятия. Всегда энергична, с харизмой, которая чувствуется даже через экран. С ней каждая встреча превращается в уникальное впечатление.`;

    return (
        <section className="model-video" aria-label={`${name} video`}>
            <div className="model-video__container">
                <header className="model-video__head">
                    <h2 className="model-video__title">Video</h2>
                    <p className="model-video__subtitle">
                        A short look at <strong>{name}</strong>
                        {city ? <> in <span className="model-video__city">{city}</span></> : null}
                    </p>
                </header>

                <div className="model-video__wrap">
                    <div className="model-video__card">
                        <div className="model-video__media">
                            <video
                                src={videoUrl}
                                controls
                                playsInline
                                className="model-video__video"
                                aria-label={`${name} vertical video`}
                            />
                        </div>
                        <div className="model-video__hint">Best viewed with sound on 🔊</div>
                    </div>

                    <aside className="model-video__info">
                        <div className="model-video__infocard">
                            <h3 className="model-video__infotitle">{name}</h3>
                            <p className="model-video__about">{aboutText}</p>

                            <div className="model-video__cta">
                                <a className="model-video__btn">Check availability</a>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
