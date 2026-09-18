import { createContext, useContext, useState, useCallback } from "react";

const TourContext = createContext(null);

export function TourProvider({ children }) {
  const [active, setActive] = useState(false);

  const startTour = useCallback(() => setActive(true), []);
  const endTour = useCallback(() => setActive(false), []);

  return (
    <TourContext.Provider value={{ active, startTour, endTour }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a TourProvider");
  return ctx;
}