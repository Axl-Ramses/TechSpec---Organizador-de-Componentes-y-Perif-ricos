import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


// ── Paleta de colores ──────────────────────────────────────────────────────
const lightTheme = {
  brand:       "#1D9E75",
  brandDark:   "#085041",
  brandLight:  "#E1F5EE",
  background:  "#F5F5F0",
  card:        "#FFFFFF",
  border:      "#E0DFD8",
  text:        "#1A1A1A",
  textSub:     "#6B6B6B",
  textMuted:   "#9A9A9A",
  danger:      "#E24B4A",
  white:       "#FFFFFF",
  isDark:      false,
};

const darkTheme = {
  brand:       "#1D9E75",
  brandDark:   "#04342C",
  brandLight:  "#0A3D2E",
  background:  "#111110",
  card:        "#1C1C1A",
  border:      "#2E2E2B",
  text:        "#EDEDE8",
  textSub:     "#9A9A92",
  textMuted:   "#5F5E5A",
  danger:      "#E24B4A",
  white:       "#FFFFFF",
  isDark:      true,
};

export type Theme = typeof lightTheme;

// Clave de AsyncStorage donde se conserva la preferencia elegida por el usuario
const THEME_STORAGE_KEY = "techspec:theme";

/** "light" / "dark" = elección explícita del usuario; null = seguir al sistema. */
type ThemePreference = "light" | "dark" | null;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  /** true cuando no hay preferencia guardada y se respeta el tema del sistema. */
  followsSystem: boolean;
  /** Borra la preferencia guardada y vuelve a seguir el tema del sistema. */
  useSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
  followsSystem: true,
  useSystemTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Tema configurado en el sistema operativo del teléfono
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(null);
  // Evita mostrar la app con el tema equivocado mientras se lee AsyncStorage
  const [hydrated, setHydrated] = useState(false);

  // Carga la preferencia persistida al arrancar la app
  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then(stored => {
        if (!active) return;
        if (stored === "light" || stored === "dark") {
          setPreference(stored);
        }
      })
      .catch(() => {
        // Si el almacenamiento falla simplemente se sigue el tema del sistema
      })
      .finally(() => {
        if (active) setHydrated(true);
      });

    return () => { active = false; };
  }, []);

  // Sin preferencia guardada manda el sistema; con preferencia manda el usuario
  const isDark = preference !== null ? preference === "dark" : systemScheme === "dark";

  const persist = (value: ThemePreference) => {
    if (value === null) {
      AsyncStorage.removeItem(THEME_STORAGE_KEY).catch(() => {});
      return;
    }
    AsyncStorage.setItem(THEME_STORAGE_KEY, value).catch(() => {});
  };

  const toggleTheme = () => {
    const next: ThemePreference = isDark ? "light" : "dark";
    setPreference(next);
    persist(next);
  };

  const useSystemTheme = () => {
    setPreference(null);
    persist(null);
  };

  const theme = isDark ? darkTheme : lightTheme;

  // Primer render: se pinta solo el fondo hasta saber qué tema corresponde,
  // para no mostrar un destello claro cuando la preferencia guardada es oscura.
  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        followsSystem: preference === null,
        useSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
