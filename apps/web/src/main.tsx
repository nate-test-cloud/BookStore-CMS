import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// Configure API client with base URL
setBaseUrl(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000");

createRoot(document.getElementById("root")!).render(<App />);
