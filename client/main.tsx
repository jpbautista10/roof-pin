import { createRoot } from "react-dom/client";
import App from "./App";
import "mapbox-gl/dist/mapbox-gl.css";

const container = document.getElementById("root")!;

if (!container._reactRoot) {
  container._reactRoot = createRoot(container);
}

container._reactRoot.render(<App />);
