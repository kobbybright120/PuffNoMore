import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme } from "../theme/theme";

export type AppTheme = typeof lightTheme;

const ThemeContext = createContext<AppTheme>(lightTheme);

type ThemeName = "light" | "dark" | "system";

type ThemeSetter = {
  themeName: ThemeName;
  setThemeName: (n: ThemeName) => void;
};

const ThemeSetterContext = createContext<ThemeSetter | undefined>(undefined);

export const useTheme = (): AppTheme => useContext(ThemeContext);

export const useThemeSetter = (): ThemeSetter => {
  const ctx = useContext(ThemeSetterContext);
  if (!ctx) {
    throw new Error("useThemeSetter must be used within a ThemeProvider");
  }
  return ctx;
};

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  initialThemeName?: ThemeName;
}> = ({ children, initialThemeName }) => {
  const system = Appearance.getColorScheme();
  const defaultName =
    initialThemeName ?? (system === "dark" ? "dark" : "light");
  const [themeNameState, setThemeNameState] = useState<ThemeName>(defaultName);

  // read persisted preference on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("app:themePreference");
        if (raw === "light" || raw === "dark" || raw === "system") {
          setThemeNameState(raw);
          return;
        }
      } catch {}
      // fall back to initial/default
      setThemeNameState(defaultName);
    })();
  }, []);

  const setThemeName = (n: ThemeName) => {
    try {
      AsyncStorage.setItem("app:themePreference", n + "");
    } catch {}
    setThemeNameState(n);
  };

  const resolvedName =
    themeNameState === "system"
      ? system === "dark"
        ? "dark"
        : "light"
      : themeNameState;

  const theme = useMemo(
    () => (resolvedName === "dark" ? darkTheme : lightTheme),
    [resolvedName],
  );

  return (
    <ThemeSetterContext.Provider
      value={{ themeName: themeNameState, setThemeName }}
    >
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </ThemeSetterContext.Provider>
  );
};
