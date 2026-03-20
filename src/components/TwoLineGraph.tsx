import React, { useMemo, useRef, useEffect } from "react";
import { View, Text, useWindowDimensions, Animated } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { darkTheme } from "../theme/theme";
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
  TSpan,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

type TwoLineConfig = {
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  animation?: string;
};

// Example dataset: left = PuffNoMore gradual reduction (smooth decline)
// right = Cold-turkey attempts (starts high, sharp drops + rebounds)
const sampleData = [
  { label: "Week 1", left: 10, right: 12, milestone: "10/day", relapse: false },
  { label: "Week 2", left: 9, right: 3, milestone: "9/day", relapse: true },
  { label: "Week 3", left: 8, right: 14, milestone: "8/day", relapse: true },
  { label: "Week 4", left: 6, right: 4, milestone: "6/day", relapse: true },
  { label: "Week 5", left: 4, right: 11, milestone: "4/day", relapse: true },
  { label: "Week 6", left: 2, right: 5, milestone: "2/day", relapse: true },
  { label: "Week 7", left: 1, right: 7, milestone: "1/day", relapse: true },
];

export const TwoLineGraph: React.FC<{
  config?: TwoLineConfig;
  width?: number;
  height?: number;
  isOnboarding?: boolean;
}> = ({ config: _config, width, height, isOnboarding = false }) => {
  const { width: screenW } = useWindowDimensions();
  const w = width || Math.min(760, screenW - 40);
  const h = height || 220;
  const pad = 28;
  // small vertical shift to move the whole chart content down
  const vshift = 10;
  // horizontal edge margin so rounded border isn't clipped
  const edgeMargin = 8;
  // additional bottom offset for week labels so they don't sit on the border
  const weekLabelBottomOffset = 12;
  const innerW = Math.max(0, w - edgeMargin * 2);
  const theme = useTheme();
  const isDarkTheme =
    theme.colors.primaryBackground === darkTheme.colors.primaryBackground;
  const borderStroke = isDarkTheme
    ? "rgba(255,255,255,0.18)"
    : "rgba(0,0,0,0.14)";
  const borderStrokeWidth = isDarkTheme ? 1.4 : 1.2;

  // Colors: ensure gradual reduction is green and cold-turkey is red.
  // Determine which series trends downward (gradual) by comparing start/end values.
  const defaultGradual = "#90b855"; // green
  const defaultCold = "#E53935"; // red
  // Make the PuffNoMore (left) series a straight linear decline across weeks
  // Start the green (left) series at the same initial value as the red (right) series
  // so both lines originate from the same point visually.
  const leftStart =
    Array.isArray(sampleData) && sampleData.length
      ? typeof sampleData[0].right === "number"
        ? sampleData[0].right
        : sampleData[0].left
      : 7;
  const leftEnd =
    Array.isArray(sampleData) && sampleData.length
      ? sampleData[sampleData.length - 1].left
      : 1;
  const valuesLeft = Array.isArray(sampleData)
    ? Array.from({ length: sampleData.length }, (_, i) => {
        const t = sampleData.length > 1 ? i / (sampleData.length - 1) : 0;
        return leftStart + t * (leftEnd - leftStart);
      })
    : [];
  const valuesRight = Array.isArray(sampleData)
    ? sampleData.map((d) => (typeof d.right === "number" ? d.right : 0))
    : [];
  const maxVal = Math.max(
    ...(valuesLeft.length ? valuesLeft : [0]),
    ...(valuesRight.length ? valuesRight : [0]),
    1,
  );

  // Labels to show near red markers for weeks 1..6
  // Simplified, consistent labels for instability markers
  const markerLabels: (string | null)[] = [
    null,
    "Stress builds",
    "Craving",
    "Relapse",
    null,
    null,
    "Same bullsh** Cycle",
  ];

  // Enforce semantic colors: left = gradual (green), right = cold-turkey (red)
  const leftColor = defaultGradual;
  const rightColor = defaultCold;

  // Helper: build smooth cubic-bezier path from points
  const buildPath = (pts: { x: number; y: number }[]) => {
    if (!pts || pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    const smoothing = 0.28; // increased smoothing for softer curves
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) * smoothing;
      const cp1y = p1.y + (p2.y - p0.y) * smoothing;
      const cp2x = p2.x - (p3.x - p1.x) * smoothing;
      const cp2y = p2.y - (p3.y - p1.y) * smoothing;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  // Precompute coordinates for each sample so markers and dots align with polylines
  const coords = Array.isArray(sampleData)
    ? sampleData.map((_d, i) => {
        const x = pad + (i * (innerW - pad * 2)) / (sampleData.length - 1);
        const yL = h - pad - ((valuesLeft[i] ?? 0) / maxVal) * (h - pad * 2);
        const yR = h - pad - ((valuesRight[i] ?? 0) / maxVal) * (h - pad * 2);
        return { x, yL, yR };
      })
    : [];

  // build arrays of {x,y} for left and right
  const leftCoords = coords.map((c) => ({ x: c.x, y: c.yL }));
  const rightCoords = coords.map((c) => ({ x: c.x, y: c.yR }));
  // Memoize path computations to avoid re-calculating on every render
  const leftPath = useMemo(() => buildPath(leftCoords), [leftCoords]);
  const rightPath = useMemo(() => buildPath(rightCoords), [rightCoords]);

  // Build closed area paths (line down to baseline and close) for subtle fills
  const buildAreaPath = (pts: { x: number; y: number }[]) => {
    const base = buildPath(pts);
    if (!base) return "";
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `${base} L ${last.x} ${h - pad} L ${first.x} ${h - pad} Z`;
  };
  const leftAreaPath = useMemo(
    () => buildAreaPath(leftCoords),
    [leftCoords, innerW, h],
  );
  const rightAreaPath = useMemo(
    () => buildAreaPath(rightCoords),
    [rightCoords, innerW, h],
  );

  // Simple draw-on-mount animation using Animated and stroke dashoffset
  const AnimatedPath = Animated.createAnimatedComponent(Path as any);
  const AnimatedCircle = Animated.createAnimatedComponent(Circle as any);
  const strokeAnim = useRef(new Animated.Value(1000)).current;
  const areaAnim = useRef(new Animated.Value(0)).current;
  const markerScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    strokeAnim.setValue(1000);
    areaAnim.setValue(0);
    markerScale.setValue(0);
    Animated.parallel([
      Animated.timing(strokeAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: false,
      }),
      Animated.timing(areaAnim, {
        toValue: 1,
        duration: 800,
        delay: 120,
        useNativeDriver: false,
      }),
      Animated.spring(markerScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: false,
      }),
    ]).start();
  }, [leftPath, rightPath]);

  const markerR = markerScale.interpolate
    ? markerScale.interpolate({ inputRange: [0, 1], outputRange: [0, 3.6] })
    : 3;

  const containerStyle: any = {
    width: w,
    paddingHorizontal: edgeMargin,
    alignSelf: "center",
    borderRadius: 14,
    overflow: "hidden",
    // outer shadow wrapper
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 10,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
  };

  return (
    <View style={containerStyle}>
      <Svg width={innerW} height={h + vshift}>
        <G transform={`translate(0, ${vshift})`}>
          <Rect x={0} y={0} width={innerW} height={h} fill="transparent" />
          {/* inset rounded border to avoid clipping on container edges */}
          {(() => {
            const inset = 6;
            // Use a glassy, translucent white border/fill for onboarding-themed graphs
            const onboardingStroke = "rgba(255,255,255,0.18)";
            // remove the glassy background fill so only the lines are shown
            const onboardingFill = "transparent";
            return (
              <Rect
                x={inset}
                y={inset}
                width={Math.max(0, innerW - inset * 2)}
                height={Math.max(0, h - inset * 2)}
                rx={12}
                ry={12}
                // remove stroke so no inner border is shown
                stroke={"transparent"}
                strokeWidth={0}
                fill={isOnboarding ? onboardingFill : "transparent"}
              />
            );
          })()}
          <Defs>
            <LinearGradient id="leftGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={leftColor} stopOpacity={0.12} />
              <Stop offset="100%" stopColor={leftColor} stopOpacity={0.02} />
            </LinearGradient>
            <LinearGradient id="rightGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={rightColor} stopOpacity={0.12} />
              <Stop offset="100%" stopColor={rightColor} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>
          {/* grid lines removed for a cleaner look */}

          {/* subtle filled areas under each series for depth */}
          {rightAreaPath ? (
            <AnimatedPath
              d={rightAreaPath}
              fill="url(#rightGrad)"
              opacity={areaAnim}
            />
          ) : null}
          {leftAreaPath ? (
            <AnimatedPath
              d={leftAreaPath}
              fill="url(#leftGrad)"
              opacity={areaAnim}
            />
          ) : null}

          {/* right series shadow/glow (soft behind) */}
          {rightPath ? (
            <Path
              d={rightPath}
              fill="none"
              stroke={rightColor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.08}
            />
          ) : null}
          {/* left series shadow/glow (soft behind) */}
          {leftPath ? (
            <Path
              d={leftPath}
              fill="none"
              stroke={leftColor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.08}
            />
          ) : null}

          {/* right series (cold turkey) solid smooth path (animated draw) */}
          {rightPath ? (
            <AnimatedPath
              d={rightPath}
              fill="none"
              stroke={rightColor}
              strokeWidth={3.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={1}
              strokeDasharray={[1000]}
              strokeDashoffset={strokeAnim}
            />
          ) : null}

          {/* left series (PuffNoMore) smooth path (animated draw) */}
          {leftPath ? (
            <AnimatedPath
              d={leftPath}
              fill="none"
              stroke={leftColor}
              strokeWidth={3.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={1}
              strokeDasharray={[1000]}
              strokeDashoffset={strokeAnim}
            />
          ) : null}

          {/* in-graph legend removed; parent renders legend outside the card */}

          {/* dots, milestones & labels */}
          {sampleData.map((d, i) => {
            const c = coords[i] || { x: 0, yL: 0, yR: 0 };
            const markerSize = 6;
            // label layout: detect horizontal overflow and switch to vertical (rotated) text
            const label = markerLabels[i];
            let labelFont = 12;
            const approxCharWidth = labelFont * 0.6; // estimate per-character width in px
            // align the label's first character with the marker (small nudge for readability)
            const labelX = c.x + 2;
            const labelWidth = label ? label.length * approxCharWidth : 0;
            const willOverflowRight = label
              ? labelX + labelWidth > w - pad
              : false;
            // rendering anchor (kept local so we can adjust only this label)
            let renderX = labelX;
            let textAnchor: "start" | "middle" = "start";
            // vertical placement: put label above the red marker but close to it
            const verticalGap = 2; // px between marker and label (reduced to sit closer)
            let labelY = Math.max(pad + 8, c.yR - markerSize - verticalGap);

            // Minimal, localized special-case: move W2 label below marker and center it
            if (i === 1 && label) {
              labelFont = 11;
              const bottomGap = 6;
              const maxY = h - pad - 4; // avoid colliding with bottom axis
              labelY = Math.min(maxY, c.yR + markerSize + bottomGap);
              renderX = c.x;
              textAnchor = "middle";
            }

            // Minimal, localized special-case: make W3 "Craving Spike" smaller and above marker
            if (i === 2 && label) {
              labelFont = 11;
              const extraTopGap = 16; // push slightly higher above marker (increased)
              labelY = Math.max(
                pad + 8,
                c.yR - markerSize - verticalGap - extraTopGap,
              );
              // nudge: move label right so it clears the marker (14px)
              renderX = c.x + 14;
              textAnchor = "start";
            }

            // Minimal, localized special-case: move W4 "Relapse Again" below marker (like W2)
            if (i === 3 && label) {
              labelFont = 11;
              const bottomGap = 6;
              const maxY = h - pad - 4; // avoid colliding with bottom axis
              labelY = Math.min(maxY, c.yR + markerSize + bottomGap);
              renderX = c.x;
              textAnchor = "middle";
            }

            // Minimal, localized special-case: center W5 "Slip Back" above marker with a small upward nudge
            if (i === 4 && label) {
              labelFont = 11;
              const extraTopGap = 4; // user-chosen nudge in px
              labelY = Math.max(
                pad + 8,
                c.yR - markerSize - verticalGap - extraTopGap,
              );
              renderX = c.x;
              textAnchor = "middle";
            }

            // Minimal, localized special-case: move final week label (Week 7) below marker
            if (i === coords.length - 1 && label) {
              // Move the final-week label slightly above the marker and
              // use the same font size as other instability labels.
              labelFont = 12; // match default marker label size
              const smallTopShift = 6; // px to nudge upward
              labelY = Math.max(
                pad + 8,
                c.yR - markerSize - verticalGap - smallTopShift,
              );
              // keep the visual horizontal placement we last used but
              // center the label there
              renderX = c.x + 12;
              textAnchor = "middle";
            }

            return (
              <React.Fragment key={i}>
                <Circle
                  cx={c.x}
                  cy={c.yL}
                  r={i === 0 || i === coords.length - 1 ? 7 : 4}
                  fill={leftColor}
                  stroke="#fff"
                  strokeWidth={1}
                />
                <SvgText
                  x={c.x}
                  y={c.yL - 12}
                  fontSize={12}
                  fill={leftColor}
                  textAnchor="middle"
                  alignmentBaseline="baseline"
                  fontWeight="600"
                  fontFamily="Inter"
                >
                  <TSpan>{`${Math.max(1, 7 - i)}/day`}</TSpan>
                </SvgText>
                <Circle
                  cx={c.x}
                  cy={c.yR}
                  r={i === 0 || i === coords.length - 1 ? 10 : 7}
                  fill={rightColor}
                  opacity={0.1}
                />
                <AnimatedCircle
                  cx={c.x}
                  cy={c.yR}
                  r={markerR}
                  fill={rightColor}
                  stroke="#fff"
                  strokeWidth={0.9}
                  opacity={0.98}
                />
                {i === 0 || i === coords.length - 1 ? (
                  <Circle
                    cx={c.x}
                    cy={c.yR}
                    r={4.2}
                    fill={rightColor}
                    stroke="#fff"
                    strokeWidth={1.4}
                  />
                ) : null}
                {/* (Removed off-line milestone markers; only on-line markers remain) */}
                {/* relapse marker: draw red X when this week is marked as relapse */}
                {d.relapse ? (
                  <>
                    <Line
                      x1={c.x - markerSize}
                      y1={c.yR - markerSize}
                      x2={c.x + markerSize}
                      y2={c.yR + markerSize}
                      stroke={defaultCold}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <Line
                      x1={c.x - markerSize}
                      y1={c.yR + markerSize}
                      x2={c.x + markerSize}
                      y2={c.yR - markerSize}
                      stroke={defaultCold}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </>
                ) : null}
                {/* week-specific instability labels (Week 1..6) near red markers */}
                {label ? (
                  willOverflowRight ? (
                    <SvgText
                      x={renderX}
                      y={labelY}
                      fontSize={12}
                      fill={rightColor}
                      textAnchor={textAnchor}
                      alignmentBaseline="middle"
                      fontWeight="700"
                      fontFamily="Inter"
                      transform={`rotate(-90 ${renderX} ${labelY})`}
                    >
                      <TSpan>{label}</TSpan>
                    </SvgText>
                  ) : (
                    <SvgText
                      x={renderX}
                      y={labelY}
                      fontSize={12}
                      fill={rightColor}
                      textAnchor={textAnchor}
                      alignmentBaseline="middle"
                      fontWeight="700"
                      fontFamily="Inter"
                    >
                      <TSpan>{label}</TSpan>
                    </SvgText>
                  )
                ) : null}
                {/* week label */}
                <SvgText
                  x={c.x}
                  y={h - weekLabelBottomOffset}
                  fontSize={10}
                  fill={isOnboarding ? "rgba(255,255,255,0.95)" : "#6b7280"}
                  textAnchor="middle"
                >
                  <TSpan>{d.label}</TSpan>
                </SvgText>
              </React.Fragment>
            );
          })}
        </G>
      </Svg>

      {/* Legend below the chart */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          marginTop: 10,
          paddingBottom: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 6,
              backgroundColor: theme.colors.primaryGreen,
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: theme.fonts.size.small,
              color: isOnboarding
                ? "rgba(255,255,255,0.9)"
                : theme.colors.textSecondary,
              fontWeight: "600",
            }}
          >
            Success milestones
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              color: defaultCold,
              fontWeight: "700",
              marginRight: 8,
              fontSize: 14,
            }}
          >
            ✕
          </Text>
          <Text
            style={{
              fontSize: theme.fonts.size.small,
              color: isOnboarding
                ? "rgba(255,255,255,0.9)"
                : theme.colors.textSecondary,
              fontWeight: "600",
            }}
          >
            Relapse points
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TwoLineGraph;
