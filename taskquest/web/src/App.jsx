import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BadgesPage from "./pages/BadgesPage.jsx";
import ProductivityPage from "./pages/ProductivityPage.jsx";
import DevToolsPage from "./pages/DevToolsPage.jsx";
import OnboardingTour from "./components/OnboardingTour.jsx";
import { TourProvider, useTour } from "./context/TourContext.jsx";
import { TOUR_STEPS } from "./lib/tourSteps.js";

export default function App() {
  return (
    <TourProvider>
      <AppShell />
    </TourProvider>
  );
}

function AppShell() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("taskquest_theme") === "dark";
  });
  const { active, endTour } = useTour();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("taskquest_theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <>
      <NavBar dark={dark} onToggleDark={() => setDark((d) => !d)} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/badges"
          element={
            <ProtectedRoute>
              <BadgesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <ProductivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dev-tools"
          element={
            <ProtectedRoute>
              <DevToolsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <OnboardingTour steps={TOUR_STEPS} active={active} onFinish={endTour} />
    </>
  );
}
