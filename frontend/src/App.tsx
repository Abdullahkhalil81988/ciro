import { Routes, Route } from "react-router-dom";
import { Nav } from "./components/landing/Nav";
import { CursorHalo } from "./components/landing/CursorHalo";
import { Dashboard } from "./pages/Dashboard";
import { EventsPage } from "./pages/EventsPage";
import { MapPage } from "./pages/MapPage";
import { AlertsPage } from "./pages/AlertsPage";
import { SimulatePage } from "./pages/SimulatePage";
import { useWebSocket } from "./hooks/useWebSocket";

export default function App() {
  useWebSocket();
  return (
    <>
      <CursorHalo />
      <Nav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/simulate" element={<SimulatePage />} />
      </Routes>
    </>
  );
}
