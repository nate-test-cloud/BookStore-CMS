import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

// Configure API client with base URL
setBaseUrl(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000");

// Configure API client to send JWT token from localStorage
setAuthTokenGetter(() => localStorage.getItem('accessToken'));

createRoot(document.getElementById("root")!).render(<App />);
