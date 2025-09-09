import axios from 'axios';

let token = "";
if (typeof document !== "undefined") {
    token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1] || "";
}

export const newRequest = axios.create({
    timeout: 5000,
    withCredentials: true,
    headers: {
        Authorization: token ? `Bearer ${token}` : "",
    }
});