import React, { createContext, useContext } from "react";
import { lightTheme } from "../theme/theme";

// Single app theme — dark/light preference removed.
export type AppTheme = typeof lightTheme;

const ThemeContext = createContext<AppTheme>(lightTheme);

export const useTheme = (): AppTheme => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeContext.Provider value={lightTheme}>{children}</ThemeContext.Provider>
  );
};
