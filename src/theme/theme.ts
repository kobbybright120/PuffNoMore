import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const baseTheme = {
  fonts: {
    family: {
      regular: "Inter",
      bold: "Inter",
    },
    size: {
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 24,
      xxlarge: 32,
    },
    weight: {
      normal: "400" as const,
      bold: "700" as const,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
  },
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  dimensions: {
    screenWidth: width,
    screenHeight: height,
  },
};

export const darkTheme = {
  ...baseTheme,
  colors: {
    primaryBackground: "#0f0f0f",
    primaryGreen: "#90b855",
    secondaryGreen: "#63a96a",
    text: "#ffffff",
    textSecondary: "#CCCCCC",
  },
};

export const lightTheme = {
  ...baseTheme,
  colors: {
    primaryBackground: "#ffffff",
    primaryGreen: "#90b855",
    secondaryGreen: "#63a96a",
    text: "#0f0f0f",
    textSecondary: "#666666",
  },
};
