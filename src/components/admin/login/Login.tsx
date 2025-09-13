"use client"
import {Button} from '@mui/material';
import {OutlinedInput} from '@mui/material';
import React, {useState, FormEvent} from 'react';
import { useRouter } from 'next/navigation';
import './Login.scss';
import Logo from '../../../../public/images/logo.svg';
import Image from "next/image";

const Login = () => {
    const [value, setValue] = useState<string>('');
    const [error, setError] = useState<string>('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({password: value})
            })
            const data = await res.json()
            if (res.ok) router.push("/admin/dashboard")
            else setError(data.message)
        } catch {
            setError("An error occurred. Please try again.")
        }
    }

    return (
        <div className="login">
            <Image
                src={Logo}
                alt="Y&P Agency logo"
                className="login__img"
            />
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
                <Button variant="contained" disableElevation type="submit"
                        sx={{
                            bgcolor: 'var(--background)',
                            color: 'var(--primary-color)',
                        }}>
                    Login
                </Button>
                {error && <div className="login__error">{error}</div>}
            </form>
        </div>
    );
};

export default Login;