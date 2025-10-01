"use client";

import React, { useState, FormEvent } from "react";
import { OutlinedInput, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "../../../../public/images/logo.svg";
import "./Login.scss";

const Login = () => {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: value }),
            });

            const data = await res.json();
            if (res.ok) router.push("/admin/dashboard");
            else setError(data.message);
        } catch {
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="login">
            <Image src={Logo} alt="Logo" className="login__img" />
            <h1 className="login__title">Admin Login</h1>
            <form className="login__form" onSubmit={handleSubmit}>
                <OutlinedInput
                    className="login__input"
                    placeholder="Enter Admin Password"
                    fullWidth
                    type="password"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <Button
                    variant="contained"
                    disableElevation
                    type="submit"
                    sx={{ bgcolor: "var(--background)", color: "var(--primary-color)" }}
                >
                    Login
                </Button>
                {error && <div className="login__error">{error}</div>}
            </form>
        </div>
    );
};

export default Login;
