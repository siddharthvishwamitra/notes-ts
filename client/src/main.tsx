import "@/lib/polyfills"; // Import polyfills first
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeDb } from "@/lib/indexedDB";

// Initialize IndexedDB
initializeDb().catch(error => {
  console.error("Failed to initialize IndexedDB:", error);
});

createRoot(document.getElementById("root")!).render(<App />);
