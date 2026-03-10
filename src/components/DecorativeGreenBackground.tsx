import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { useWindowDimensions } from "react-native";

type Props = {
  colors?: [string, string, string];
  dotColor?: string; // rgba
  spacing?: number;
  radius?: number;
  pointerEvents?: "none" | "auto";
};

const DecorativeGreenBackground: React.FC<Props> = ({
  colors = ["#2d5a3d", "#2f6f4a", "#234f3a"],
  dotColor = "rgba(255,255,255,0.06)",
  spacing = 40,
  radius = 1.8,
  pointerEvents = "none",
}) => {
  const { width, height } = useWindowDimensions();
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);

  const dots: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = Math.round(spacing / 2 + c * spacing);
      const cy = Math.round(spacing / 2 + r * spacing);
      dots.push(
        <Circle key={`${r}-${c}`} cx={cx} cy={cy} r={radius} fill={dotColor} />
      );
    }
  }

  return (
    <>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} pointerEvents={pointerEvents}>
        {dots}
      </Svg>
    </>
  );
};

export default DecorativeGreenBackground;
