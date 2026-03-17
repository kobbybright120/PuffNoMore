import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  LayoutChangeEvent,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type Props = {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onValueChange?: (v: number) => void;
  width?: number;
};

const ElegantSlider: React.FC<Props> = ({
  min = 1,
  max = 5,
  step = 1,
  value = 3,
  onValueChange,
  width = 300,
}) => {
  const range = max - min;
  const normalized = (value - min) / (range || 1);
  const progress = useRef(new Animated.Value(normalized)).current;
  const displayProgress = useRef(new Animated.Value(normalized)).current;
  const isActive = useRef(new Animated.Value(0)).current;
  const [layoutWidth, setLayoutWidth] = useState(width);
  const layoutWidthRef = useRef(layoutWidth);
  const [current, setCurrent] = useState<number>(value);

  useEffect(() => {
    const to = (value - min) / (range || 1);
    Animated.timing(progress, {
      toValue: to,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
    Animated.timing(displayProgress, {
      toValue: to,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
    setCurrent(value);
  }, [value]);

  const getValueFromX = (x: number) => {
    const pct = Math.max(
      0,
      Math.min(1, x / (layoutWidthRef.current || layoutWidth)),
    );
    const raw = min + pct * range;
    const stepped = Math.round((raw - min) / step) * step + min;
    return Math.max(min, Math.min(max, stepped));
  };

  const containerRef = useRef<any>(null);
  const containerLeftRef = useRef(0);
  const startProgressRef = useRef<number>(normalized);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Haptics.selectionAsync?.();
        Animated.timing(isActive, {
          toValue: 1,
          duration: 160,
          useNativeDriver: false,
        }).start();
        try {
          progress.stopAnimation((val: any) => {
            startProgressRef.current =
              typeof val === "number" ? val : normalized;
          });
        } catch (err) {
          startProgressRef.current = normalized;
        }
      },
      onPanResponderMove: (e, gestureState) => {
        const w = layoutWidthRef.current || layoutWidth;
        const start = startProgressRef.current || 0;
        const pct = Math.max(
          0,
          Math.min(1, start + gestureState.dx / (w || 1)),
        );
        const x = pct * (w || 1);
        const candidate = getValueFromX(x);

        try {
          progress.setValue((candidate - min) / (range || 1));
        } catch (err) {
          try {
            progress.stopAnimation();
          } catch (e) {}
        }

        try {
          Animated.timing(displayProgress, {
            toValue: (candidate - min) / (range || 1),
            duration: 60,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }).start();
        } catch (err) {}

        setCurrent(candidate);
        onValueChange && onValueChange(candidate);
      },
      onPanResponderRelease: (e, gestureState) => {
        Haptics.selectionAsync?.();
        Animated.timing(isActive, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }).start();

        const w = layoutWidthRef.current || layoutWidth;
        const start = startProgressRef.current || 0;
        const pct = Math.max(
          0,
          Math.min(1, start + gestureState.dx / (w || 1)),
        );
        const x = pct * (w || 1);
        const candidate = getValueFromX(x);

        Animated.timing(progress, {
          toValue: (candidate - min) / (range || 1),
          duration: 160,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();

        try {
          Animated.timing(displayProgress, {
            toValue: (candidate - min) / (range || 1),
            duration: 160,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
        } catch (err) {}

        setCurrent(candidate);
        onValueChange && onValueChange(candidate);
      },
    }),
  ).current;

  const onLayout = (ev: LayoutChangeEvent) => {
    const w = ev.nativeEvent.layout.width;
    setLayoutWidth(w);
    layoutWidthRef.current = w;
    // eslint-disable-next-line no-console
    console.log("ElegantSlider:onLayout", { width: w });
    // measure container position in window and cache left offset
    try {
      if (containerRef.current && containerRef.current.measure) {
        // measure asynchronously; store left offset for touch math
        containerRef.current.measure(
          (
            fx: number,
            fy: number,
            mw: number,
            mh: number,
            px: number,
            py: number,
          ) => {
            containerLeftRef.current = px || 0;
            // eslint-disable-next-line no-console
            console.log(
              "ElegantSlider:measured containerLeft",
              containerLeftRef.current,
            );
          },
        );
      }
    } catch (err) {
      // ignore
    }
  };

  const thumbSize = 36;
  const fillWidth = displayProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, layoutWidth],
  });

  const thumbLeft = displayProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-(thumbSize / 2), layoutWidth - thumbSize / 2],
  });

  const trackHeight = isActive.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 24],
  });
  const thumbScale = isActive.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const tickCount = Math.floor(range / step) + 1;
  const ticks = Array.from({ length: tickCount }, (_, i) => min + i * step);

  const lowActive = current <= min + 1; // 1-2
  const midActive = current === Math.round(min + range / 2); // 3
  const highActive = current >= max - 1; // 4-5

  return (
    <View style={styles.wrapper}>
      <View style={[styles.iconRow, { width: layoutWidth }]}>
        <View style={[styles.iconWrap, lowActive && styles.iconWrapActive]}>
          <MaterialIcons
            name="sentiment-very-dissatisfied"
            size={lowActive ? 36 : 30}
            color={lowActive ? "#fff" : "rgba(255,255,255,0.9)"}
          />
        </View>

        <View style={[styles.iconWrap, midActive && styles.iconWrapActive]}>
          <MaterialIcons
            name="sentiment-neutral"
            size={midActive ? 36 : 30}
            color={midActive ? "#fff" : "rgba(255,255,255,0.9)"}
          />
        </View>

        <View style={[styles.iconWrap, highActive && styles.iconWrapActive]}>
          <MaterialIcons
            name="mood"
            size={highActive ? 36 : 30}
            color={highActive ? "#fff" : "rgba(255,255,255,0.9)"}
          />
        </View>
      </View>
      <View
        ref={containerRef}
        onLayout={onLayout}
        style={[styles.trackContainer, { width: layoutWidth }]}
        {...pan.panHandlers}
      >
        <Animated.View
          style={[
            styles.trackBackground,
            {
              height: trackHeight,
              top: "50%",
              transform: [{ translateY: Animated.multiply(trackHeight, -0.5) }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.fill,
            {
              width: fillWidth,
              height: trackHeight,
              top: "50%",
              transform: [{ translateY: Animated.multiply(trackHeight, -0.5) }],
            },
          ]}
        >
          <LinearGradient
            colors={["#63a96a", "#8DD38C"]}
            start={[0, 0]}
            end={[1, 0]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.thumb,
            {
              top: "50%",
              transform: [
                { translateX: thumbLeft },
                { translateY: -thumbSize / 2 },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.halo,
              {
                opacity: isActive.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.12],
                }),
                transform: [
                  {
                    scale: isActive.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.08],
                    }),
                  },
                ],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.thumbInner,
              {
                width: 20,
                height: 20,
                borderRadius: 10,
                transform: [{ scale: thumbScale }],
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.08)",
              },
            ]}
          />
        </Animated.View>

        {/* numbers/labels are shown below the slider */}
      </View>

      <View style={[styles.labelsRow, { width: layoutWidth }]}>
        {ticks.map((t) => (
          <Text
            key={t}
            style={[styles.labelText, current === t && styles.labelTextActive]}
          >
            {t}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: "center" },
  trackBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  fill: {
    position: "absolute",
    left: 0,
    height: 16,
    borderRadius: 999,
    overflow: "hidden",
  },
  thumb: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  thumbInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  halo: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 6,
    paddingHorizontal: 6,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapActive: {
    backgroundColor: "transparent",
    transform: [{ scale: 1.08 }],
  },
  valueBubble: {
    position: "absolute",
    top: -42,
    marginLeft: -18,
    width: 36,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 6,
  },
  valueText: { color: "#63a96a", fontWeight: "700" },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  labelText: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  labelTextActive: { color: "#fff", fontWeight: "700" },
  trackContainer: {
    height: 80,
    justifyContent: "center",
  },
});

export default ElegantSlider;
