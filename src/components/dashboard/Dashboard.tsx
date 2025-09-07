"use client";

import React, { useEffect, useState } from "react";
import "./Dashboard.scss";
import {Summary} from "@/types/summary";
import Loading from "@/components/loading/Loading";

const Dashboard = () => {
    const [summary, setSummary] = useState<Summary | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            const res = await fetch("/api/models/summary");
            const data = await res.json();
            setSummary(data);
        };
        fetchSummary();
    }, []);

    if (!summary) return <Loading/>;

    return (
        <div className="dashboard">
            <header className="dashboard__header">
                <h1 className="dashboard__title">Admin Dashboard</h1>
                <h2 className="dashboard__subtitle">
                    Welcome to the admin dashboard. Here you can manage your application.
                </h2>
            </header>

            <div className="dashboard__available-container">
                <div className="dashboard__available-card">
                    <h3 className="dashboard__available-title">Available Now:</h3>
                    <p className="dashboard__text">{summary.availableNow}</p>
                </div>
                <div className="dashboard__available-card">
                    <h3 className="dashboard__available-title">Milan:</h3>
                    <p className="dashboard__text">{summary.milanCount}</p>
                </div>
                <div className="dashboard__available-card">
                    <h3 className="dashboard__available-title">Rome:</h3>
                    <p className="dashboard__text">{summary.romeCount}</p>
                </div>
                <div className="dashboard__available-card">
                    <h3 className="dashboard__available-title">Models:</h3>
                    <p className="dashboard__text">{summary.totalModels}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
