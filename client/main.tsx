import { createRoot } from "react-dom/client";
import App from "./App";
import "leaflet/dist/leaflet.css";

const container = document.getElementById("root")!;

if (!container._reactRoot) {
  container._reactRoot = createRoot(container);
}

container._reactRoot.render(<App />);
