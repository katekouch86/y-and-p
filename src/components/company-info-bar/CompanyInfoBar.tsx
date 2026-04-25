"use client";

import Link from "next/link";
import Image from "next/image";
import { CITIES, CITY_TO_SLUG, formatCityList } from "@/constants/cities";
import "./CompanyInfoBar.scss";
import BannerImage from "../../../public/images/banner-image.png";

export default function CompanyInfoBar() {
    return (
        <section className="company-info" aria-labelledby="company-info__title">
            <div className="company-info__top">
                <header className="company-info__head" aria-label="Company info header">

                    <h2 id="company-info__title" className="company-info__title">
                        Escort in Italy
                    </h2>
                    <p className="company-info__lead">
                        The reference point for classy experiences and unforgettable moments in Italy.
                    </p>
                </header>
                <div className="company-info__body">
                    <p className="company-info__text">
                        We offer exclusive escort encounters with elegant and refined ladies for private dinners, travel,
                        business events, or a true girlfriend experience.
                    </p>
                    <p className="company-info__text">
                        Our mission is discreet, tailored service — connecting clients with women selected for beauty,
                        charm, and professionalism. Whether in {formatCityList(CITIES)}, you’ll find the perfect companion for any
                        occasion.
                    </p>
                </div>
            </div>
            <div className="company-info__middle">
                <nav className="company-info__actions" aria-label="Service cities">
                    {CITIES.map((city, index) => (
                        <Link
                            key={city}
                            href={`/city/${CITY_TO_SLUG[city]}`}
                            className={`company-info__btn${index % 2 === 1 ? " company-info__btn--ghost" : ""}`}
                        >
                            {city}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="company-info__bottom">
                <div className="company-info__body">
                    <h3 className="company-info__lead company-info__lead--bottom">Exclusive Telegram Channel And Lotalty Program</h3>
                    <p className="company-info__text company-info__text--bottom">
                        We have created an exclusive Telegram channel, designed for those who wish to stay constantly
                        updated with the utmost discretion and receive information in advance. Inside, you will find all
                        the latest updates and have the opportunity to make priority bookings before the official
                        announcements are published.
                    </p>
                    <p className="company-info__text company-info__text--bottom">
                        In addition, channel members can enjoy dedicated benefits, including a <span className="company-info__text--bold">special 40% promotion </span>
                        starting from the tenth appointment.
                    </p>
                    <p className="company-info__text company-info__text--bottom">
                        A private, refined environment, tailored for those who appreciate a privileged experience.
                    </p>
                </div>
                <figure className="company-info__media">
                    <Image
                        src={BannerImage}
                        alt="Y&P Agency banner image, elegant evening ambience in Italy"
                        className="company-info__img"
                        priority
                        unoptimized
                    />
                </figure>
            </div>
        </section>
    );
}
