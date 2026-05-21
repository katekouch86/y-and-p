import React from 'react';
import Link from 'next/link';
import './Footer.scss';
import { CITIES, CITY_TO_SLUG } from "@/constants/cities";

const Footer = () => {
    const year: number = new Date().getFullYear();

    return (
        <footer className="footer" aria-label="Site footer">
            <nav className="footer__cities" aria-label="Cities navigation">
                {CITIES.map((city) => (
                    <Link key={city} href={`/city/${CITY_TO_SLUG[city]}`} className="footer__city-link">
                        Escort {city}
                    </Link>
                ))}
            </nav>
            <p className="footer__text">
                &copy; {year} Y&amp;P Agency. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;
