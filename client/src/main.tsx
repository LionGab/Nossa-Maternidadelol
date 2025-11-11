import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, setupInstallPrompt } from "./register-sw";

// Register Service Worker for PWA
if (import.meta.env.PROD) {
  registerServiceWorker();
  setupInstallPrompt();
}

createRoot(document.getElementById("root")!).render(<App />);
