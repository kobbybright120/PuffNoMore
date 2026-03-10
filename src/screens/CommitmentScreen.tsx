import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  PanResponder,
  TouchableOpacity,
  Text,
} from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

type Props = {
  onSave: (strokes: any) => void;
  onFinish: () => void;
  onBack?: () => void;
};

export default function CommitmentScreen({ onSave, onFinish, onBack }: Props) {
  const theme = useTheme();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const [strokes, setStrokes] = useState<any[]>([]);

  const hasSignature =
    strokes && strokes.length > 0 && strokes.some((s) => s && s.length > 0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, _gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        setStrokes((prev) => [...prev, [{ x: locationX, y: locationY }]]);
      },
      onPanResponderMove: (evt, _gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        setStrokes((prev) => {
          if (prev.length === 0) return prev;
          const copy = prev.slice();
          const last = copy[copy.length - 1].slice();
          last.push({ x: locationX, y: locationY });
          copy[copy.length - 1] = last;
          return copy;
        });
      },
      onPanResponderRelease: () => {},
      onPanResponderTerminate: () => {},
    })
  ).current;

  const handleFinish = async () => {
    try {
      onSave && onSave(strokes);
    } catch (e) {
      console.warn(e);
    }
    onFinish && onFinish();
  };

  const boxHeight = Math.max(
    180,
    Math.min(Math.floor(screenHeight * 0.36), 320)
  );

  const boxWidth = Math.max(280, Math.min(Math.floor(screenWidth * 0.85), 720));

  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 720,
          alignSelf: "center",
          alignItems: "center",
          paddingVertical: theme.spacing.md,
        }}
      >
        <View
          {...panResponder.panHandlers}
          style={{
            width: boxWidth,
            alignSelf: "center",
            height: boxHeight,
            backgroundColor: "#F3F5F7",
            borderRadius: 20,
            padding: 0,
            borderWidth: 1,
            borderColor: "#D9E2EA",
            overflow: "hidden",
            // soft shadow for depth
            ...theme.shadows.medium,
          }}
        >
          <Svg style={StyleSheet.absoluteFill}>
            {strokes.map((stroke, i) => {
              const points = (stroke || [])
                .map((p: any) => `${p.x},${p.y}`)
                .join(" ");
              return (
                <Polyline
                  key={i}
                  points={points}
                  fill="none"
                  stroke="#0B0B0B"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </Svg>
        </View>

        {/* Guide text is rendered by the parent so it sits between Clear and the action button */}

        {/* Clear control outside the pad (bottom-left) */}
        <View
          style={{
            width: boxWidth,
            alignSelf: "center",
            marginTop: 10,
            paddingHorizontal: 6,
            flexDirection: "row",
            justifyContent: "flex-start",
          }}
        >
          <TouchableOpacity
            onPress={() => setStrokes([])}
            disabled={!hasSignature}
            accessibilityLabel="Clear signature"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 8,
            }}
          >
            <Text
              style={{
                color: hasSignature ? "#FFFFFF" : "rgba(255,255,255,0.65)",
                fontFamily: theme.fonts.family.bold,
                fontSize: 16,
                textShadowColor: "rgba(0,0,0,0.45)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
