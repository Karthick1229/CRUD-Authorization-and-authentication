import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    withCredentials: true,
});

function readCookie(name) {
    const entry = document.cookie
        .split("; ")
        .find((value) => value.startsWith(`${name}=`));
    return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

api.interceptors.request.use((config) => {
    const token = readCookie("XSRF-TOKEN");
    if (
        token &&
        !["get", "head", "options"].includes(config.method?.toLowerCase())
    ) {
        config.headers["X-XSRF-TOKEN"] = token;
    }
    return config;
});

export async function refreshCsrf() {
    const { data } = await api.get("/auth/csrf");
    return data.token;
}

export default api;
