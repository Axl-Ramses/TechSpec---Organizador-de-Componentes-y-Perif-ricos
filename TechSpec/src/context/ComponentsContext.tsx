import React, { createContext, useContext, useState } from "react";
import { COMPONENTS as INITIAL } from "../../assets/data";
import { HardwareComponent } from "../../assets/data";

interface ComponentsContextType {
  components: HardwareComponent[];
  addComponent: (c: Omit<HardwareComponent, "id" | "createdAt" | "updatedAt">) => void;
}

const ComponentsContext = createContext<ComponentsContextType>({
  components: INITIAL,
  addComponent: () => {},
});

export const ComponentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<HardwareComponent[]>(INITIAL);

  const addComponent = (data: Omit<HardwareComponent, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString().split("T")[0];
    const newComp: HardwareComponent = {
      ...data,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    setComponents(prev => [newComp, ...prev]);
  };

  return (
    <ComponentsContext.Provider value={{ components, addComponent }}>
      {children}
    </ComponentsContext.Provider>
  );
};

export const useComponents = () => useContext(ComponentsContext);