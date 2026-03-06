import { createRoot } from "react-dom/client";
import App from "./App";
import "mapbox-gl/dist/mapbox-gl.css";

// Suppress benign Mapbox GL AbortError from internal tile cancellation
window.addEventListener("unhandledrejection", (event) => {
  if (event.reason?.name === "AbortError") {
    event.preventDefault();
  }
});

const container = document.getElementById("root")!;

if (!container._reactRoot) {
  container._reactRoot = createRoot(container);
}

container._reactRoot.render(<App />);
