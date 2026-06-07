import React, { createContext, useContext, useState } from "react";

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

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ theme: isDark ? darkTheme : lightTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
