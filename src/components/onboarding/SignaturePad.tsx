import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  useWindowDimensions,
} from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";

type Point = { x: number; y: number };

type Props = {
  strokeColor?: string;
  strokeWidth?: number;
  onSave?: (strokes: Point[][]) => void;
  onChange?: (strokes: Point[][]) => void;
  onClear?: () => void;
};

export default function SignaturePad({
  strokeColor,
  strokeWidth = 3,
  onSave,
  onChange,
  onClear,
}: Props) {
  void onSave;
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const strokesRef = useRef<Point[][]>([]);
  const current = useRef<Point[]>([]);
  const safeOnChange = (next: Point[][]) => {
    if (!onChange) return;
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => onChange(next));
    } else {
      setTimeout(() => onChange(next), 0);
    }
  };
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const theme = useTheme();
  const strokeCol = strokeColor ?? theme.colors.text;
  const boxHeight = Math.max(
    280,
    Math.min(Math.floor(screenHeight * 0.5), 700)
  );
  const horizontalPadding = theme.spacing.md * 2; // container left+right padding
  const maxBoxWidth = Math.min(
    Math.max(0, Math.floor(screenWidth - horizontalPadding)),
    1200
  );
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current = [{ x: locationX, y: locationY }];
        setStrokes((s) => {
          const next = [...s, [...current.current]];
          strokesRef.current = next;
          safeOnChange(next);
          return next;
        });
      },
      onPanResponderMove: (
        e: GestureResponderEvent,
        _gs: PanResponderGestureState
      ) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current.push({ x: locationX, y: locationY });
        setStrokes((s) => {
          const copy = s.slice(0, -1);
          const next = [...copy, [...current.current]];
          strokesRef.current = next;
          safeOnChange(next);
          return next;
        });
      },
      onPanResponderRelease: () => {
        current.current = [];
      },
      onPanResponderTerminate: () => {
        current.current = [];
      },
    })
  ).current;

  const handleClear = () => {
    setStrokes([]);
    strokesRef.current = [];
    safeOnChange([]);
    onClear && onClear();
  };

  return (
    <View
      style={{
        height: boxHeight,
        width: "100%",
        alignSelf: "stretch",
        borderRadius: theme.borderRadius.medium,
        backgroundColor: theme.colors.primaryBackground,
        borderColor: theme.colors.textSecondary || "#e5e7eb",
        borderWidth: 1,
        borderStyle: "dashed",
        overflow: "hidden",
        position: "relative",
      }}
      {...pan.panHandlers}
    >
      <Svg style={{ flex: 1 }}>
        {strokes.map((stroke, i) => {
          const points = stroke.map((p) => `${p.x},${p.y}`).join(" ");
          return (
            <Polyline
              key={i}
              points={points}
              fill="none"
              stroke={strokeCol}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", alignItems: "center" },
});
