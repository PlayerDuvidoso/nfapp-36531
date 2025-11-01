import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/env"; // Validate environment variables at startup

createRoot(document.getElementById("root")!).render(<App />);
