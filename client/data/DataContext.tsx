import { createContext, useContext, useState, useCallback } from "react";
import { Tenant, Pin } from "@/types";
import { mockTenants, mockPins } from "./mock";

interface DataContextValue {
  tenant: Tenant;
  pins: Pin[];
  updateTenant: (updates: Partial<Tenant>) => void;
  addPin: (pin: Pin) => void;
  editPin: (id: string, updates: Partial<Pin>) => void;
  removePin: (id: string) => void;
  togglePinVisibility: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant>(mockTenants[0]);
  const [pins, setPins] = useState<Pin[]>(mockPins);

  const updateTenant = useCallback((updates: Partial<Tenant>) => {
    setTenant((prev) => ({ ...prev, ...updates }));
  }, []);

  const addPin = useCallback((pin: Pin) => {
    setPins((prev) => [pin, ...prev]);
  }, []);

  const editPin = useCallback((id: string, updates: Partial<Pin>) => {
    setPins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  }, []);

  const removePin = useCallback((id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const togglePinVisibility = useCallback((id: string) => {
    setPins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p)),
    );
  }, []);

  return (
    <DataContext.Provider
      value={{
        tenant,
        pins,
        updateTenant,
        addPin,
        editPin,
        removePin,
        togglePinVisibility,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
