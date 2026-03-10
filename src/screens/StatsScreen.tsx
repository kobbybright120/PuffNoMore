import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { usePuff } from "../context/PuffContext";
import { BarChart } from "react-native-gifted-charts";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";
import * as SafeHaptics from "../utils/haptics";

const { width: screenWidth } = Dimensions.get("window");

type RangeKey = "daily" | "weekly" | "monthly" | "yearly";

const RANGE_LABELS: Record<RangeKey, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const StatsScreen: React.FC = () => {
  const theme = useTheme();
  const { weeklyCounts, events, totalPuffs, baseHistory } = usePuff();
  const [range, setRange] = useState<RangeKey>("daily");
  const [showAvoidedBreakdown, setShowAvoidedBreakdown] = useState(false);

  const chartData = useMemo(() => {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    // DAILY: last 7 days (labels are weekday short names), dynamic based on today
    if (range === "daily") {
      // Use the weeklyCounts array which is maintained as Sun..Sat indexes.
      const days =
        Array.isArray(weeklyCounts) && weeklyCounts.length === 7
          ? weeklyCounts.slice()
          : new Array(7).fill(0);

      const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const labels = days.map((_, i) => weekdayNames[i]);

      return days.map((v, i) => ({
        value: v,
        label: labels[i],
        frontColor: v > (totalPuffs ?? 0) ? "#fd9308" : "#63a96a",
        gradientColor: v > (totalPuffs ?? 0) ? "#f6c548" : "#90b855",
      }));
    }

    // WEEKLY: aggregate counts per week for the last 8 weeks (oldest -> newest)
    if (range === "weekly") {
      // Find the earliest event
      let minDate = events.length > 0 ? new Date(events[0]) : new Date();
      for (const s of events) {
        const d = new Date(s);
        if (!isNaN(d.getTime()) && d < minDate) minDate = d;
      }
      minDate.setHours(0, 0, 0, 0);
      // Move minDate to the start of its week (Sunday)
      minDate.setDate(minDate.getDate() - minDate.getDay());

      // Find the current week start
      const nowStart = new Date(now);
      nowStart.setHours(0, 0, 0, 0);
      nowStart.setDate(nowStart.getDate() - nowStart.getDay());

      // Calculate number of weeks from minDate to nowStart (inclusive)
      const weekMs = dayMs * 7;
      const numWeeks = Math.max(
        1,
        Math.floor((nowStart.getTime() - minDate.getTime()) / weekMs) + 1
      );
      const byWeek = new Array(numWeeks).fill(0);
      const weekLabels: string[] = [];

      for (let i = 0; i < numWeeks; i++) {
        weekLabels.push(`Week ${i + 1}`);
      }

      for (const s of events) {
        const d = new Date(s).getTime();
        if (isNaN(d)) continue;
        const idx = Math.floor((d - minDate.getTime()) / weekMs);
        if (idx >= 0 && idx < numWeeks) byWeek[idx] += 1;
      }

      return byWeek.map((v, i) => ({
        value: v,
        label: weekLabels[i],
        frontColor: "#63a96a",
        gradientColor: "#90b855",
      }));
    }

    // MONTHLY: aggregate by month starting at the earliest event's month
    // and include months up to and including the current month.
    if (range === "monthly") {
      // Find earliest event date (or default to now)
      let minDate = events.length > 0 ? new Date(events[0]) : new Date();
      for (const s of events) {
        const d = new Date(s);
        if (!isNaN(d.getTime()) && d < minDate) minDate = d;
      }
      // Normalize to the first day of that month
      minDate.setHours(0, 0, 0, 0);
      minDate.setDate(1);

      // Start of current month
      const nowStart = new Date(now);
      nowStart.setHours(0, 0, 0, 0);
      nowStart.setDate(1);

      // Number of months between minDate and nowStart (inclusive)
      const monthsDiff =
        (nowStart.getFullYear() - minDate.getFullYear()) * 12 +
        (nowStart.getMonth() - minDate.getMonth());
      const numMonths = Math.max(1, monthsDiff + 1);

      const byMonth = new Array(numMonths).fill(0);
      const monthShortNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthLabels: string[] = [];
      for (let i = 0; i < numMonths; i++) {
        const monthIndex = (minDate.getMonth() + i) % 12;
        monthLabels.push(monthShortNames[monthIndex]);
      }

      for (const s of events) {
        const d = new Date(s);
        if (isNaN(d.getTime())) continue;
        const idx =
          (d.getFullYear() - minDate.getFullYear()) * 12 +
          (d.getMonth() - minDate.getMonth());
        if (idx >= 0 && idx < numMonths) byMonth[idx] += 1;
      }

      return byMonth.map((v, i) => ({
        value: v,
        label: monthLabels[i],
        frontColor: "#63a96a",
        gradientColor: "#90b855",
      }));
    }

    // YEARLY: aggregate by year
    if (range === "yearly") {
      const yearsMap: Record<number, number> = {};
      for (const s of events) {
        const d = new Date(s);
        if (isNaN(d.getTime())) continue;
        yearsMap[d.getFullYear()] = (yearsMap[d.getFullYear()] || 0) + 1;
      }
      const years = Object.keys(yearsMap)
        .map((y) => Number(y))
        .sort((a, b) => a - b);
      return years.map((y) => ({
        value: yearsMap[y],
        label: String(y),
        frontColor: "#63a96a",
        gradientColor: "#90b855",
      }));
    }

    return []; // fallback, though range should always match
  }, [range, events, weeklyCounts, theme.colors.primaryGreen, totalPuffs]);

  const isDark =
    (theme.colors.primaryBackground || "").toLowerCase() === "#0f0f0f";
  const isLight = !isDark;
  const cardBackground = isLight ? theme.colors.primaryBackground : "#0f1a1d";
  const cardBorderColor = isLight
    ? theme.colors.primaryGreen + "10"
    : "rgba(255,255,255,0.12)";
  const cardShadow = isLight
    ? theme.shadows.medium
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.36,
        shadowRadius: 12,
        elevation: 8,
      };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.primaryBackground },
    scrollContainer: {
      paddingBottom: theme.spacing.xl,
    },
    summaryCard: {
      backgroundColor: cardBackground,
      borderRadius: theme.borderRadius.large,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.md,
      borderWidth: isLight ? 0 : 1,
      borderColor: cardBorderColor,
      ...cardShadow,
    },
    summaryLeft: { flexDirection: "column" },
    summaryTotal: {
      fontSize: theme.fonts.size.xlarge,
      fontFamily: theme.fonts.family.bold,
      color: theme.colors.text,
    },
    summaryLabel: {
      fontSize: theme.fonts.size.small,
      color: theme.colors.text,
      fontFamily: theme.fonts.family.regular,
      marginTop: theme.spacing.xs,
    },
    summaryRight: {
      alignItems: "flex-end",
    },
    summaryPeriod: {
      fontSize: theme.fonts.size.small,
      color: isDark ? "#E0E0E0" : theme.colors.textSecondary,
      fontFamily: theme.fonts.family.regular,
    },
    controls: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.md,
      justifyContent: "center",
      marginVertical: theme.spacing.sm,
    },
    segWrap: {
      flexDirection: "row",
      backgroundColor: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
      borderRadius: theme.borderRadius.xlarge,
      padding: theme.spacing.xs / 2,
    },
    controlBtn: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.xlarge,
      marginHorizontal: theme.spacing.xs / 2,
    },
    controlText: {
      fontSize: theme.fonts.size.small,
      fontFamily: theme.fonts.family.regular,
      color: theme.colors.text,
    },
    chartWrap: {
      backgroundColor: cardBackground,
      borderRadius: theme.borderRadius.large,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
      marginTop: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: isLight ? 0 : 1,
      borderColor: cardBorderColor,
      overflow: "visible",
      ...cardShadow,
    },
    innerChart: {
      borderRadius: theme.borderRadius.large,
      // ensure inner content aligns with outer padding
      marginHorizontal: -theme.spacing.md,
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: theme.spacing.sm,
      backgroundColor: "transparent",
    },
    chartHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
    },
    chartHeaderTitle: {
      fontSize: theme.fonts.size.medium,
      color: theme.colors.text,
      fontFamily: theme.fonts.family.bold,
    },
    chartHeaderAction: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.small,
    },
    chartHeaderActionText: {
      fontSize: theme.fonts.size.small,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs / 2,
      fontFamily: theme.fonts.family.regular,
    },
    legendContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: theme.borderRadius.small,
      marginRight: theme.spacing.xs,
    },
    legendText: {
      fontSize: theme.fonts.size.small,
      color: theme.colors.text,
      fontFamily: theme.fonts.family.regular,
    },
    // container for modular cards above or below the chart
    cardsContainer: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    cumCard: {
      backgroundColor: cardBackground,
      borderRadius: theme.borderRadius.large,
      marginTop: theme.spacing.xs,
      paddingRight: theme.spacing.md,
      paddingLeft: theme.spacing.md + 36,
      paddingVertical: theme.spacing.md,
      borderWidth: isLight ? 0 : 1,
      borderColor: cardBorderColor,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "visible",
      ...cardShadow,
    },
    cumLeft: { flexDirection: "row", alignItems: "center" },
    cumIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.colors.primaryGreen,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    cumIcon: { fontSize: 22 },
    cumMainText: {
      fontSize: theme.fonts.size.large,
      fontFamily: theme.fonts.family.bold,
      color: theme.colors.text,
      flexWrap: "wrap",
      flexShrink: 1,
      textAlign: "left",
    },
    cumTextWrap: {
      flex: 1,
      alignItems: "flex-start",
      paddingLeft: theme.spacing.sm / 2,
    },
    cumSubtitle: {
      fontSize: theme.fonts.size.small,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.family.regular,
      marginTop: theme.spacing.xs / 2,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6,
      width: "100%",
    },
    infoText: {
      flex: 1,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: theme.fonts.size.small,
      textAlign: "left",
    },
    infoIcon: {
      marginLeft: theme.spacing.xs,
      padding: 6,
    },
    cumAccent: {
      position: "absolute",
      left: theme.spacing.md + 8,
      top: theme.spacing.md + 4,
      bottom: theme.spacing.md + 4,
      width: 6,
      borderRadius: theme.borderRadius.small,
      backgroundColor: theme.colors.primaryGreen,
    },
  });

  // Responsive bar sizing: compute barWidth and spacing so the whole chart fits
  // chartWrap has marginHorizontal: 16 and paddingHorizontal: 16, so total horizontal space used: 64
  const containerPadding = 32; // accounts for margins and padding: 16 + 16 + 16 + 16 = 64, so /2 = 32
  const availableWidth = Math.max(280, screenWidth - containerPadding * 2);
  const itemCount = Math.max(1, chartData.length);
  const spacingRatio = 0.4; // spacing relative to bar width
  // compute a bar width that guarantees total fits: total = bar*(n + (n-1)*r)
  let barWidthComputed = Math.floor(
    availableWidth / (itemCount + (itemCount - 1) * spacingRatio)
  );
  // clamp to reasonable bounds so bars are not tiny or enormous
  barWidthComputed = Math.max(8, Math.min(barWidthComputed, 32));
  const spacingComputed = Math.max(
    6,
    Math.floor(barWidthComputed * spacingRatio)
  );
  const chartWidth = availableWidth; // force chart to fit container (no horizontal scroll)

  // key derived from current data values to force BarChart remount when data changes
  const chartKey = chartData.map((d) => String(d.value)).join("|");

  // Ensure Y axis labels are integer values (no decimals).
  const yAxisSections = 4;
  const maxValue = Math.max(
    1,
    ...chartData.map((c) => (typeof c.value === "number" ? c.value : 0))
  );
  const yStep = Math.max(1, Math.ceil(maxValue / yAxisSections));
  // Compute chart max as the step * sections so grid lines align with labels
  const chartMax = yStep * yAxisSections;

  // Build labels bottom->top from 0 -> chartMax so labels correspond to
  // grid lines starting at the axis intersection (bottom) and increasing upward.
  const yAxisLabelTexts = [] as string[];
  for (let i = 0; i <= yAxisSections; i++) {
    yAxisLabelTexts.push(String(i * yStep));
  }

  // Cumulative reduction calculation vs baseline (baseline = daily `totalPuffs`)
  const dayMs = 24 * 60 * 60 * 1000;
  // Compute expected cigarettes using historical baseline changes (baseHistory)
  const earliestTs =
    events && events.length > 0
      ? Math.min(...events.map((s) => new Date(s).getTime()))
      : null;
  const startDate = earliestTs ? new Date(earliestTs) : new Date();
  startDate.setHours(0, 0, 0, 0);
  const todayMid = new Date();
  todayMid.setHours(0, 0, 0, 0);
  const daysCovered = Math.max(
    1,
    Math.floor((Number(todayMid) - Number(startDate)) / dayMs) + 1
  );

  // ensure baseHistory is sorted ascending by timestamp
  const sortedBaseHistory = Array.isArray(baseHistory)
    ? [...baseHistory].sort(
        (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
      )
    : [];

  // For each day from startDate -> todayMid, pick the latest baseHistory entry whose ts <= day
  // We'll compute two avoidance components:
  // 1) plannedAvoided: reduction in baseline vs starting baseline (promotions)
  // 2) extraAvoided: daily extra avoidance when user smokes less than that day's baseline
  // (expectedSinceBaseline removed; we now compute plannedAvoided and extraAvoided separately)
  let plannedAvoided = 0;
  let extraAvoided = 0;
  let plannedProvisional = 0;
  let extraProvisional = 0;

  // Build per-day actual counts (aligned to startDate)
  const dayCounts = new Array(daysCovered).fill(0);
  if (events && events.length > 0) {
    const dayEnd = todayMid.getTime() + dayMs - 1;
    for (const s of events) {
      const t = new Date(s).getTime();
      if (isNaN(t)) continue;
      if (t < startDate.getTime() || t > dayEnd) continue;
      const idx = Math.floor((t - startDate.getTime()) / dayMs);
      if (idx >= 0 && idx < daysCovered) dayCounts[idx] += 1;
    }
  }

  // determine a starting baseline to measure planned reductions against
  const startingBaseline =
    sortedBaseHistory[0]?.base ??
    (typeof totalPuffs === "number" ? totalPuffs : 0);

  for (let i = 0; i < daysCovered; i++) {
    const day = new Date(startDate.getTime() + i * dayMs);
    // find last history entry with ts <= day
    let applicable =
      sortedBaseHistory[0]?.base ??
      (typeof totalPuffs === "number" ? totalPuffs : 0);
    for (const h of sortedBaseHistory) {
      if (new Date(h.ts).getTime() <= day.getTime()) applicable = h.base;
      else break;
    }
    // expectedSinceBaseline intentionally not used; keeping per-day computations below

    // planned avoidance is difference between starting baseline and the applicable baseline
    const planForDay = Math.max(0, startingBaseline - applicable);

    // extra avoidance is how many fewer puffs than the day's baseline the user logged
    const actualForDay = dayCounts[i] ?? 0;
    const extraForDay = Math.max(0, applicable - actualForDay);

    // Only count completed days toward the main avoided total. Today's
    // contributions are provisional and will be applied after the 24h day ends.
    const isToday = i === daysCovered - 1;
    if (isToday) {
      plannedProvisional = planForDay;
      extraProvisional = extraForDay;
    } else {
      plannedAvoided += planForDay;
      extraAvoided += extraForDay;
    }
  }

  // total avoided is planned + extra (never negative)
  const avoided = Math.max(0, plannedAvoided + extraAvoided);
  // subtitle removed per user request

  return (
    <View style={styles.container}>
      <AppHeader title="Usage Stats" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Summary card removed as requested */}

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            activeOpacity={0.92}
            accessibilityRole="button"
            onPress={async () => {
              try {
                await SafeHaptics.selectionAsync();
              } catch (e) {}
              setShowAvoidedBreakdown((s) => !s);
            }}
            style={styles.cumCard}
          >
            <View style={styles.cumAccent} />
            <View style={styles.cumLeft}>
              <View style={styles.cumIconWrap}>
                <MaterialCommunityIcons
                  name="smoking-off"
                  size={22}
                  color={theme.colors.primaryBackground}
                />
              </View>
              <View style={styles.cumTextWrap}>
                <Text
                  style={styles.cumMainText}
                  numberOfLines={showAvoidedBreakdown ? undefined : 2}
                  ellipsizeMode="tail"
                >
                  {`${avoided} cigarette${
                    avoided === 1 ? "" : "s"
                  } avoided since you started`}
                </Text>

                <View style={styles.infoRow}>
                  <Text
                    style={styles.infoText}
                    numberOfLines={showAvoidedBreakdown ? undefined : 1}
                  >
                    Includes your reduction plan and extra effort
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.chartHeaderActionText}>
                      {showAvoidedBreakdown ? "Hide" : "Details"}
                    </Text>
                    <MaterialCommunityIcons
                      name={
                        showAvoidedBreakdown ? "chevron-up" : "chevron-down"
                      }
                      size={18}
                      color={theme.colors.textSecondary}
                      style={{ marginLeft: theme.spacing.xs }}
                    />
                  </View>
                </View>
                {showAvoidedBreakdown && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.cumSubtitle, { textAlign: "left" }]}>
                      This includes:
                    </Text>
                    <Text
                      style={[
                        styles.cumSubtitle,
                        { textAlign: "left", marginTop: 4 },
                      ]}
                    >
                      • {plannedAvoided} from your reduction plan
                    </Text>
                    <Text
                      style={[
                        styles.cumSubtitle,
                        { textAlign: "left", marginTop: 2 },
                      ]}
                    >
                      • {extraAvoided} from extra effort
                    </Text>
                    {(plannedProvisional > 0 || extraProvisional > 0) && (
                      <View style={{ marginTop: 6 }}>
                        <Text
                          style={[styles.cumSubtitle, { textAlign: "left" }]}
                        >
                          Provisional today (counted at day end):
                        </Text>
                        {plannedProvisional > 0 && (
                          <Text
                            style={[
                              styles.cumSubtitle,
                              { textAlign: "left", marginTop: 4 },
                            ]}
                          >
                            • {plannedProvisional} from today's plan change
                          </Text>
                        )}
                        {extraProvisional > 0 && (
                          <Text
                            style={[
                              styles.cumSubtitle,
                              { textAlign: "left", marginTop: 2 },
                            ]}
                          >
                            • {extraProvisional} from extra effort today
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.chartWrap}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartHeaderTitle}>Usage</Text>
            <View style={styles.chartHeaderAction}>
              <MaterialCommunityIcons
                name="calendar"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.chartHeaderActionText}>
                {RANGE_LABELS[range]}
              </Text>
            </View>
          </View>
          <View style={styles.controls}>
            <View style={styles.segWrap}>
              {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
                <TouchableOpacity
                  key={k}
                  onPress={async () => {
                    try {
                      await SafeHaptics.selectionAsync();
                    } catch (e) {
                      // ignore haptics errors
                    }
                    setRange(k);
                  }}
                  style={[
                    styles.controlBtn,
                    {
                      backgroundColor:
                        range === k ? theme.colors.primaryGreen : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.controlText,
                      {
                        color:
                          range === k
                            ? theme.colors.primaryBackground
                            : theme.colors.textSecondary,
                        fontFamily:
                          range === k
                            ? theme.fonts.family.bold
                            : theme.fonts.family.regular,
                      },
                    ]}
                  >
                    {RANGE_LABELS[k]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.innerChart}>
            <BarChart
              key={chartKey}
              data={chartData}
              // slightly narrower so horizontal grid lines don't reach card edges
              width={chartWidth * 0.86}
              height={range === "yearly" ? 380 : 340}
              barWidth={Math.max(8, Math.floor(barWidthComputed * 0.9))}
              spacing={Math.max(6, Math.floor(spacingComputed * 0.9))}
              roundedTop
              barBorderRadius={1}
              isAnimated
              animationDuration={600}
              showVerticalLines={false}
              noOfSections={yAxisSections}
              yAxisTextStyle={{
                color: theme.colors.textSecondary,
                fontFamily: theme.fonts.family.regular,
              }}
              yAxisColor={theme.colors.textSecondary}
              yAxisOffset={0}
              yAxisLabelTexts={yAxisLabelTexts}
              maxValue={chartMax}
              xAxisLabelTextStyle={{
                color: theme.colors.textSecondary,
                fontSize: range === "yearly" ? 9 : 10,
                fontFamily: theme.fonts.family.regular,
              }}
              xAxisColor={theme.colors.textSecondary}
              xAxisTextNumberOfLines={1}
              rotateLabel={range === "yearly"}
              labelsExtraHeight={range === "yearly" ? 44 : 30}
              showGradient={true}
              gradientColor={theme.colors.primaryGreen}
              frontColor={theme.colors.primaryGreen}
              initialSpacing={12}
              barInnerComponent={(item: any) => {
                if (!item || typeof item.value !== "number" || item.value === 0)
                  return null;
                if (barWidthComputed < 16) return null;
                return (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 2,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          item.value > (totalPuffs ?? 0) && range === "daily"
                            ? "#000"
                            : "rgba(255,255,255,0.95)",
                        fontSize: Math.min(
                          14,
                          Math.max(10, Math.floor(barWidthComputed / 2.5))
                        ),
                        fontFamily: theme.fonts.family.bold,
                      }}
                    >
                      {String(item.value)}
                    </Text>
                  </View>
                );
              }}
              showValuesAsTopLabel={false}
              // lightweight press handler for accessibility/tooltip extension
              onPress={(item: any, index: number) => {
                // placeholder: could open a tooltip/modal showing details
                // keep lightweight in production; implement full tooltip later
                return;
              }}
            />
          </View>
        </View>
        {/* Weekly progress card placed below the chart in its own container */}
        <View
          style={{
            marginHorizontal: theme.spacing.md,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.md,
          }}
        >
          <View
            style={{
              backgroundColor: cardBackground,
              borderRadius: theme.borderRadius.large,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.md,
              borderWidth: isLight ? 0 : 1,
              borderColor: cardBorderColor,
              ...cardShadow,
            }}
          >
            {(() => {
              const todayIdx = new Date().getDay();
              const counts = Array.isArray(weeklyCounts)
                ? weeklyCounts
                : new Array(7).fill(0);
              const baseline = typeof totalPuffs === "number" ? totalPuffs : 0;
              // Separate past days (exclude today) from today's provisional state
              const pastCounts = counts.slice(0, todayIdx);
              const pastSuccessful = pastCounts.filter(
                (c) => c > 0 && c <= baseline
              ).length;
              const pastOversmoked = pastCounts.filter(
                (c) => c > baseline
              ).length;
              const todayCount = counts[todayIdx] ?? 0;
              const todayOversmoked = todayCount > baseline;
              // treat today as completed only if there was recorded activity
              // and the count is within the baseline (not oversmoked)
              const todayCompleted = todayCount > 0 && todayCount <= baseline;
              // provisional on-target: some logs today but not yet reached baseline
              const todayProvisionalOnTarget =
                todayCount > 0 && todayCount < baseline;
              const displayedSuccessful =
                pastSuccessful + (todayCompleted ? 1 : 0);
              const remaining = Math.max(0, 7 - displayedSuccessful);
              const segments = counts.map((c, i) => {
                const isPastOrToday = i <= todayIdx;
                // only mark as on-target if there was a recorded count (>0)
                const onTarget = isPastOrToday ? c > 0 && c <= baseline : false;
                const neutralColor = isLight
                  ? "rgba(0,0,0,0.06)"
                  : "rgba(255,255,255,0.04)";
                const bg = isPastOrToday
                  ? c === 0
                    ? neutralColor
                    : onTarget
                    ? theme.colors.primaryGreen
                    : "#fd9308"
                  : neutralColor;
                return (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: 12,
                      marginRight: i < 6 ? theme.spacing.xs / 2 : 0,
                      borderRadius: 6,
                      backgroundColor: bg,
                    }}
                  />
                );
              });

              return (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.fonts.size.small,
                        color: theme.colors.text,
                        fontFamily: theme.fonts.family.bold,
                      }}
                    >
                      Weekly Progress
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.fonts.size.small,
                        color: theme.colors.text,
                        fontFamily: theme.fonts.family.bold,
                      }}
                    >
                      {`${displayedSuccessful} of 7 days on target`}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginVertical: theme.spacing.sm,
                    }}
                  >
                    {segments}
                  </View>

                  <Text
                    numberOfLines={3}
                    style={[
                      styles.cumSubtitle,
                      {
                        fontFamily: theme.fonts.family.bold,
                        marginTop: theme.spacing.sm,
                        textAlign: "left",
                      },
                    ]}
                  >
                    {(() => {
                      const totalOversmoked =
                        pastOversmoked + (todayOversmoked ? 1 : 0);
                      if (totalOversmoked > 0) {
                        return `You exceeded your daily target on ${totalOversmoked} day${
                          totalOversmoked === 1 ? "" : "s"
                        }. You are not eligible for promotion next week.`;
                      }

                      if (displayedSuccessful >= 7) {
                        return "You're eligible for promotion next week 🎉";
                      }

                      // Past successes (exclude today) are counted as completed days
                      if (pastSuccessful > 0) {
                        if (todayCompleted) {
                          return `Nice you've met your target today. You've hit your target on ${displayedSuccessful} day${
                            displayedSuccessful === 1 ? "" : "s"
                          } this week. Only ${remaining} more day${
                            remaining === 1 ? "" : "s"
                          } to qualify for promotion next week.`;
                        }

                        if (todayProvisionalOnTarget) {
                          const remainingIfTodayCounts = Math.max(
                            0,
                            7 - (pastSuccessful + 1)
                          );
                          return `Nice you've met your target on ${pastSuccessful} day${
                            pastSuccessful === 1 ? "" : "s"
                          } so far. Today you're currently ${todayCount}/${baseline} (so far). Only ${remainingIfTodayCounts} more day${
                            remainingIfTodayCounts === 1 ? "" : "s"
                          } this week to qualify for promotion next week.`;
                        }

                        return `Great you've hit your daily target ${pastSuccessful} day${
                          pastSuccessful === 1 ? "" : "s"
                        } so far. Only ${remaining} more day${
                          remaining === 1 ? "" : "s"
                        } this week to qualify for promotion next week.`;
                      }

                      // No past successes
                      if (todayCompleted) {
                        return `Nice you've hit your target today. 1 of 7 days on target. Only ${remaining} more day${
                          remaining === 1 ? "" : "s"
                        } to qualify for promotion next week.`;
                      }

                      if (todayProvisionalOnTarget) {
                        const remainingIfTodayCounts = Math.max(0, 7 - 1);
                        return `You're on track today (so far): ${todayCount}/${baseline}. Only ${remainingIfTodayCounts} more day${
                          remainingIfTodayCounts === 1 ? "" : "s"
                        } this week to be eligible for promotion next week.`;
                      }

                      if (todayCount > 0) {
                        return `Today: ${todayCount}/${baseline} (so far). You need ${remaining} more day${
                          remaining === 1 ? "" : "s"
                        } this week to be eligible for promotion next week.`;
                      }

                      return `No recorded on-target days yet this week. You need ${remaining} more day${
                        remaining === 1 ? "" : "s"
                      } to be eligible for promotion next week.`;
                    })()}
                  </Text>
                </>
              );
            })()}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default StatsScreen;
