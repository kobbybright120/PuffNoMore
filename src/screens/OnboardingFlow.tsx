import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Image,
  useWindowDimensions,
  Alert,
  Platform,
  PanResponder,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Polyline,
  Polygon,
  Text as SvgText,
  Path,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";
import { usePuff } from "../context/PuffContext";
import { useTheme } from "../context/ThemeContext";
import { darkTheme } from "../theme/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import spec from "../onboarding/onboardingSpec.json";
import DecorativeGreenBackground from "../components/DecorativeGreenBackground";
import OnboardingLottie from "../components/OnboardingLottie";
import CommitmentBackground202 from "../components/CommitmentBackground202";
import PlanCard from "../components/PlanCard";
import CommitmentScreen from "./CommitmentScreen";
import { BarChart } from "react-native-gifted-charts";
import TwoLineGraph from "../components/TwoLineGraph";
// Attempt to load the native Welcome screen. If `react-native-reanimated` is
// not installed or import fails, fall back to a Reanimated-free implementation.
let WelcomeNative: any = null;
try {
  // prefer the full-featured Reanimated version
  WelcomeNative = require("../../next onboarding screen/WelcomeScreen").default;
} catch {
  try {
    WelcomeNative =
      require("../../next onboarding screen/WelcomeScreen_fallback").default;
  } catch {
    WelcomeNative = null;
  }
}
// WebView removed; rating screen ported to native below

const OnboardingFlow: React.FC = () => {
  const {
    saveOnboardingAnswer,
    setOnboardingCompleted,
    setTotalPuffs,
    onboardingResponses,
  } = usePuff();
  const nav = useNavigation<any>();
  const screens = (spec as any).screens || [];
  console.log &&
    console.log(
      "OnboardingFlow - loaded screens:",
      (screens || []).map((s: any) => s && s.id)
    );
  // Helper: resolve simple tokens in spec strings using onboarding responses
  function resolveTokenText(text?: string): string {
    if (!text || typeof text !== "string") return text || "";
    let out = text;
    const name =
      onboardingResponses?.fullName || onboardingResponses?.name || "";
    if (out.includes("{fullName}")) out = out.replace(/\{fullName\}/g, name);
    if (out.includes("{quitTargetDate}")) {
      // Prefer explicit quitTargetDate; if missing or invalid, compute the
      // same derived quit date used by PlanCard (startDate + plan weeks).
      const rawQuit = onboardingResponses?.quitTargetDate;
      const rawStart = onboardingResponses?.startDate;
      const baseline = Number(onboardingResponses?.cigarettesPerDay) || 0;
      const totalWeeks = baseline >= 1 ? Math.max(1, Math.round(baseline)) : 8;
      try {
        const months = [
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
        if (rawQuit) {
          const d = new Date(rawQuit);
          if (d && !isNaN(d.getTime())) {
            const fmt = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
            out = out.replace(/\{quitTargetDate\}/g, fmt);
            // done
          } else {
            // fall through to computed date
            const start = rawStart ? new Date(rawStart) : new Date();
            const quitDate = new Date(
              start.getTime() + totalWeeks * 7 * 24 * 60 * 60 * 1000
            );
            const fmt = `${months[quitDate.getMonth()]} ${quitDate.getDate()}, ${quitDate.getFullYear()}`;
            out = out.replace(/\{quitTargetDate\}/g, fmt);
          }
        } else {
          const start = rawStart ? new Date(rawStart) : new Date();
          const quitDate = new Date(
            start.getTime() + totalWeeks * 7 * 24 * 60 * 60 * 1000
          );
          const fmt = `${months[quitDate.getMonth()]} ${quitDate.getDate()}, ${quitDate.getFullYear()}`;
          out = out.replace(/\{quitTargetDate\}/g, fmt);
        }
      } catch {
        out = out.replace(/\{quitTargetDate\}/g, "—");
      }
    }
    return out;
  }
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [textValue, setTextValue] = useState<string>("");
  const [numberValue, setNumberValue] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState<number | null>(null);

  // slider state + refs for draggable control
  const pan = useRef(new Animated.Value(0)).current;
  const trackWidth = useRef(0);
  const trackRef = useRef<any>(null);
  const panResponder = useRef<any>(null);
  const panValueRef = useRef(0);
  const trackLeft = useRef(0);
  // removed runtime interstitial state: value screens are defined in the spec
  const theme = useTheme();

  // Onboarding-local Text wrapper that ensures Inter font is applied
  const OText: React.FC<any> = (props) => {
    const { style, children, ...rest } = props;
    const hasFont = (s: any): boolean => {
      if (!s) return false;
      if (Array.isArray(s)) return s.some(hasFont);
      return typeof s === "object" && s.fontFamily;
    };
    const finalStyle = hasFont(style)
      ? style
      : ([{ fontFamily: theme.fonts.family.regular }, style] as any);
    return (
      // preserve Text for native behavior but inject Inter when absent
      <Text {...rest} style={finalStyle}>
        {children}
      </Text>
    );
  };

  // Shadow native `Text` within this component so all in-file <Text/> uses
  // default to Inter unless an explicit `fontFamily` is provided.
  const Text: any = OText;

  // Helper: verify MaterialCommunityIcons contains the requested glyph name
  const isValidMCIcon = (name?: string) => {
    try {
      const map = (MaterialCommunityIcons as any)?.glyphMap;
      if (!map || !name) return false;
      return Object.prototype.hasOwnProperty.call(map, name);
    } catch {
      return false;
    }
  };
  const anim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const spinnerAnim = useRef(new Animated.Value(0)).current;
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [loadingValue, setLoadingValue] = useState(0);
  const [circularIndex, setCircularIndex] = useState(0);
  const autoAdvanceTriggeredRef = useRef(false);
  // Progress should end on the value screen with id 102 (quitting target).
  // If that screen exists in the spec, treat it as the last screen for the
  // progress indicator so the progress bar reaches 100% there and subsequent
  // interstitials don't extend the progress fill.
  const progressEndIndex = screens.findIndex((s: any) => s && s.id === 102);
  const initialCount =
    progressEndIndex >= 0 ? progressEndIndex + 1 : screens.length;

  // Local testimonial assets (fallback to remote URLs removed; use local images placed in assets/testimonials)
  const testimonials = [
    {
      name: "Michael Stevens",
      avatar: require("../../assets/testimonials/casual-dressed-man-mockup-psd-playing-with-phone-outdoor-photoshoot_53876-1082530.jpg"),
      quote:
        "PuffNoMore’s progress tracker kept me motivated. Watching smoke-free days grow gave me pride and determination to continue.",
    },
    {
      name: "Tony Coleman",
      avatar: require("../../assets/testimonials/front-view-tired-man-gym.jpg"),
      quote:
        "The Craving Crusher tool gave me instant relief during urges. It felt supportive and helped me stay smoke-free longer.",
    },
    {
      name: "Sofia Ramos",
      avatar: require("../../assets/testimonials/medium-shot-girl-making-gum-balloon.jpg"),
      quote:
        "The delay timer was a game‑changer. Instead of giving in right away, I learned to pause. Those few minutes often made the urge fade, and I felt proud of myself.",
    },
    {
      name: "David Kim",
      avatar: require("../../assets/testimonials/portrait-man-against-wall-home_1605455-165.jpg"),
      quote:
        "Every time I opened the app, my personal reason to quit was right there. That reminder kept me grounded and motivated, even on tough days.",
    },
    {
      name: "Jordan Lee",
      avatar: require("../../assets/testimonials/young-man-preparing-play-basketball-game.jpg"),
      quote:
        "The guided breathing exercise became my go‑to whenever cravings hit. PuffNoMore’s calm rhythm helped me slow down, breathe, and remember I’m in control.",
    },
  ];

  // progress is handled by dash indicator for the initial screens
  useEffect(() => {
    const filled = Math.min(index + 1, initialCount);
    const ratio = initialCount > 0 ? filled / initialCount : 0;
    Animated.timing(progressAnim, {
      toValue: ratio,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [index, progressAnim, initialCount]);

  useEffect(() => {
    const s = screens[index];
    let animRef: any = null;
    if (s && s.type === "loading" && s.id === 14) {
      spinnerAnim.setValue(0);
      // Prefer syncing spinner duration to the circularAnalyzer subtexts
      const cfg = (s.ui && s.ui.circularAnalyzer) || null;
      let duration = (s.ui && s.ui.durationMs) || 4000;
      if (
        cfg &&
        Array.isArray(cfg.subtexts) &&
        cfg.subtexts.length > 0 &&
        typeof cfg.subtextIntervalMs === "number"
      ) {
        duration = cfg.subtextIntervalMs * cfg.subtexts.length;
      }

      const timing = Animated.timing(spinnerAnim, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      });

      // For the primary loading analyzer screen (id 14) we want a single
      // run that completes and then advances the flow. Do not loop here
      // even if the spec requests looping.
      animRef = timing;
      animRef.start();
    } else {
      spinnerAnim.stopAnimation && spinnerAnim.stopAnimation();
      spinnerAnim.setValue(0);
    }
    return () => {
      if (animRef) animRef.stop && animRef.stop();
    };
  }, [index, screens, spinnerAnim]);

  useEffect(() => {
    const id = spinnerAnim.addListener(({ value }: any) => {
      setLoadingValue(value);
      setLoadingPercent(Math.round(value * 100));
    });
    return () => spinnerAnim.removeListener(id);
  }, [spinnerAnim]);

  // Rotate the circularAnalyzer subtexts when the analysis screen is active
  useEffect(() => {
    const s = screens[index];
    const cfg = s?.ui?.circularAnalyzer;
    if (!cfg || !Array.isArray(cfg.subtexts) || cfg.subtexts.length === 0) {
      setCircularIndex(0);
      return;
    }

    setCircularIndex(0);
    const intervalMs =
      typeof cfg.subtextIntervalMs === "number" ? cfg.subtextIntervalMs : 1400;
    let shouldLoop = cfg.loop !== false;
    // If this is the main loading screen (id 14) we should not loop the
    // subtexts indefinitely — they should run through once to match the
    // spinner duration and then stop so we can auto-advance.
    if (s && s.type === "loading" && s.id === 14) shouldLoop = false;
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i >= cfg.subtexts.length) {
        if (shouldLoop) i = 0;
        else return clearInterval(id);
      }
      setCircularIndex(i);
    }, intervalMs);
    return () => clearInterval(id);
  }, [index, screens]);

  // Reset auto-advance trigger whenever the active index changes
  useEffect(() => {
    autoAdvanceTriggeredRef.current = false;
  }, [index]);

  // When the loading spinner reaches 100% on the analyzer screen, advance.
  useEffect(() => {
    const s = screens[index];
    if (
      s &&
      s.type === "loading" &&
      s.id === 14 &&
      loadingPercent >= 100 &&
      !autoAdvanceTriggeredRef.current
    ) {
      autoAdvanceTriggeredRef.current = true;
      // Use goNext() to preserve end-of-flow behavior
      goNext();
    }
  }, [loadingPercent, index, screens]);

  const goNext = async () => {
    // advance normally; value screens are part of the spec and will be handled by index

    const s = screens[index];
    if (!s) return;
    try {
      if (s.type === "question") {
        const key = s.key || `q_${index}`;
        const input = s.input || {};
        let valueToSave: any = null;
        if (input.type === "number") {
          const min = typeof input.min === "number" ? input.min : undefined;
          if (
            s.validation?.required &&
            (numberValue === null || isNaN(numberValue))
          ) {
            Alert.alert("Please enter a number");
            return;
          }
          if (
            typeof min === "number" &&
            numberValue !== null &&
            numberValue < min
          ) {
            Alert.alert(`Value must be at least ${min}`);
            return;
          }
          valueToSave = numberValue ?? 0;
        } else if (input.type === "options") {
          const firstOpt = input.options && input.options[0];
          const firstLabel =
            typeof firstOpt === "string" ? firstOpt : firstOpt?.label;
          valueToSave = selectedOption ?? firstLabel ?? null;
        } else if (input.type === "multiselect") {
          const minSelected = s.validation?.minSelected || 0;
          if (
            s.validation?.required &&
            (selectedMulti || []).length < minSelected
          ) {
            Alert.alert(
              `Please select at least ${minSelected} option${
                minSelected === 1 ? "" : "s"
              }`
            );
            return;
          }
          valueToSave = selectedMulti || [];
        } else if (input.type === "slider") {
          const min = typeof input.min === "number" ? input.min : 0;
          const max = typeof input.max === "number" ? input.max : min + 1;
          valueToSave =
            typeof sliderValue === "number"
              ? Math.round(sliderValue)
              : Math.round((min + max) / 2);
        } else if (input.type === "text") {
          const trimmed = (textValue || "").trim();
          if (s.validation?.required && trimmed === "") {
            Alert.alert("Please enter your name");
            return;
          }
          // Disallow numeric characters in the name
          if (/\d/.test(trimmed)) {
            Alert.alert("Name cannot contain numbers");
            return;
          }
          valueToSave = trimmed;
        }
        await saveOnboardingAnswer(key, valueToSave);
        if (key === "cigarettesPerDay" && typeof valueToSave === "number") {
          try {
            await setTotalPuffs(valueToSave);
          } catch {}
        }

        // runtime interstitial logic removed — value screens should be placed in the spec
      }
      const next = index + 1;
      if (next >= screens.length) {
        await setOnboardingCompleted(true);
        nav.reset({ index: 0, routes: [{ name: "RootTabs" }] });
        return;
      }
      setIndex(next);
      setSelectedOption(null);
      setTextValue("");
      setSelectedMulti([]);
      setSliderValue(null);
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "Could not save answer.");
    }
  };

  // (rating WebView handler removed; native UI will call `goNext()` directly)

  const current = screens[index] || { header: "", subtext: "" };
  // Error boundary to catch render errors from dynamically loaded native components
  class ErrorBoundary extends React.Component<
    any,
    { hasError: boolean; error?: any }
  > {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError(error: any) {
      return { hasError: true, error };
    }
    componentDidCatch(error: any, info: any) {
      console.warn("ErrorBoundary caught:", error, info);
    }
    render() {
      if ((this.state as any).hasError) {
        return (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <OText style={{ color: "#fff", marginBottom: 12 }}>
              Something went wrong rendering this screen.
            </OText>
            <TouchableOpacity
              onPress={() => {
                try {
                  this.setState({ hasError: false, error: undefined });
                  if (index > 0) setIndex((i) => Math.max(0, i - 1));
                  else if ((nav as any)?.canGoBack) (nav as any).goBack();
                } catch {}
              }}
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                padding: 10,
                borderRadius: 8,
              }}
            >
              <OText style={{ color: "#fff" }}>Go back</OText>
            </TouchableOpacity>
          </View>
        );
      }
      return this.props.children;
    }
  }
  // If the spec requests a native component for this screen, map and render it.
  const nativeComponents: Record<string, any> = {
    WelcomeNative,
  };
  const requestedComponent = (current as any)?.ui?.component;
  // Components that should be treated as backgrounds (rendered full-bleed)
  // rather than mounted inline as part of the content. This lets the spec
  // point at a converted React->React Native screen and use it as an
  // animated background.
  const backgroundComponents = ["WelcomeNative", "WelcomeScreen"];
  // Resolve native component (if any). Do not early-return here — keep hooks
  // order stable by rendering the native component inside the main JSX below.
  const NativeComp = requestedComponent
    ? nativeComponents[requestedComponent]
    : null;
  const renderComponentAsBackground =
    typeof requestedComponent === "string" &&
    backgroundComponents.includes(requestedComponent) &&
    !!NativeComp;
  const shouldRenderNative = !!NativeComp && !renderComponentAsBackground;
  // Center subtext for the goals screen (id 32) and the next four screens
  const goalsScreenIndex = screens.findIndex((s: any) => s && s.id === 32);
  const centerGoalsRange =
    goalsScreenIndex >= 0 &&
    index >= goalsScreenIndex &&
    index <= goalsScreenIndex + 4;
  const isPositiveLike = !!(current as any)?.ui?._positiveLike;
  // Animated dots for the scare screens (include social-impact id 21)
  const scareDotsIds = [18, 19, 20, 21];
  const dotAnimsRef = useRef(scareDotsIds.map(() => new Animated.Value(0)));

  useEffect(() => {
    // animate dots when active screen changes
    const activeIndex = scareDotsIds.indexOf((current as any)?.id);
    const toRuns = dotAnimsRef.current.map((a, i) =>
      Animated.timing(a, {
        toValue: i === activeIndex ? 1 : 0,
        duration: 320,
        useNativeDriver: true,
      })
    );
    Animated.parallel(toRuns).start();
  }, [index]);
  const smallHeader = (current as any).ui?.smallHeader;
  const hideProgress = (current as any).ui?.hideProgress === true;
  // Include 32 so onboarding screen id 32 shows the back button
  const specialHeaderIds = [32, 33, 103];
  // screens that use the commitment-style white back overlay (only show that)
  const commitmentBackIds = [32, 201, 202, 203, 204, 205, 206, 207];
  const showBack = (() => {
    // If this screen uses the commitment-style overlay back, don't show the main header back
    const currentId = (screens[index] || {}).id;
    if (commitmentBackIds.includes(currentId)) return false;
    // hide back button on screens that come after the progress end (id: 102),
    // but explicitly allow it for our special header screens so users can go back.
    const allowedBySpecial = specialHeaderIds.includes(currentId);
    if (typeof progressEndIndex === "number" && progressEndIndex >= 0) {
      return (index > 0 && index <= progressEndIndex) || allowedBySpecial;
    }
    return index > 0 || allowedBySpecial; // fallback
  })(); // hide back button only on the very first (splash) screen
  const isWelcome =
    (current as any).id === 1 ||
    ((current as any).type === "value" && (current as any).ui?.centered);
  const isCardless = !isWelcome; // treat all non-welcome screens as cardless
  const isMatchGender = !isWelcome; // apply the same typography scaling to all non-welcome screens

  // Add top padding so content (title) sits below the header/progress bar
  const topContentPadding = !hideProgress && index < initialCount ? 44 : 12;

  // Determine commitment range early so downstream logic (action labels,
  // button styles) can reference it without forward-reference errors.
  const commitmentStartIndex = screens.findIndex((s: any) => s && s.id === 202);
  const inCommitmentRange =
    typeof commitmentStartIndex === "number" &&
    commitmentStartIndex >= 0 &&
    index >= commitmentStartIndex;

  // Find the onboarding screen that introduces the personalized plan and
  // center headers/subtext from that screen onward.
  const centerPlanStartIndex = screens.findIndex(
    (s: any) =>
      s &&
      s.header === "Based on your answers, we've built a plan just for you."
  );
  const inCenterRange =
    typeof centerPlanStartIndex === "number" &&
    centerPlanStartIndex >= 0 &&
    index >= centerPlanStartIndex;

  // Action label for the bottom button — override on analysis screen.
  let actionLabel =
    (current as any)?.type === "analysis"
      ? "Check your symptoms"
      : (current as any)?.ui?.actionButton?.label
        ? (current as any).ui.actionButton.label
        : "Next";

  // For screens in the commitment range (202 and onward) use a consistent
  // affirmative action label so users see the same call-to-action across
  // the commitment flow. Override regardless of spec-per-screen label.
  if (inCommitmentRange) {
    actionLabel = "Let’s Go";
  }
  if ((current as any)?.id === 204) {
    actionLabel = "Become a PufNoMore";
  }

  const animationKey =
    (current as any).animation ||
    current.ui?.animation ||
    current.ui?.twoBarGraph?.animation ||
    current.ui?.barChart?.animation;

  // responsive spacing and heights for the line chart

  const barCfg = (current as any).ui?.barChart;
  const showBar = current.type === "value" && !!barCfg;

  const summaryCards = (current as any).ui?.summaryCards;
  const showSummary = current.type === "value" && !!summaryCards;

  const formatCardValue = (key: string) => {
    try {
      const v = (onboardingResponses || {})[key];
      if (Array.isArray(v)) {
        return v.slice(0, 2).join(", ") || "—";
      }
      if (v === null || v === undefined || v === "") return "—";
      return String(v);
    } catch {
      return "—";
    }
  };

  const renderInsight = () => {
    const tpl = (current as any).ui?.insightTemplate || "";

    const makeYearsText = (v: any) => {
      const n = Number(v);
      if (!v && v !== 0) return null;
      if (isNaN(n) || n <= 0) return "less than a year";
      if (n === 1) return "about 1 year";
      return `about ${n} years`;
    };

    const makeTriggersText = (arr: any) => {
      if (!Array.isArray(arr) || arr.length === 0) return null;
      const picks = arr.slice(0, 3);
      if (picks.length === 1) return picks[0];
      if (picks.length === 2) return `${picks[0]} and ${picks[1]}`;
      return `${picks.slice(0, -1).join(", ")}, and ${picks[picks.length - 1]}`;
    };

    const makePastAttemptsText = (v: any) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(String(v).replace(/[^0-9]/g, ""));
      if (!isNaN(n) && n > 0) return `${n} time${n > 1 ? "s" : ""}`;
      return String(v);
    };

    const yearsText = makeYearsText(onboardingResponses?.yearsSmoking);
    const triggersText = makeTriggersText(onboardingResponses?.triggers);
    const pastAttemptsText = makePastAttemptsText(
      onboardingResponses?.pastAttempts
    );
    const quitReasonText = onboardingResponses?.quitReason || null;

    if (tpl) {
      const subs = {
        yearsSmoking: yearsText || "—",
        topTriggers: triggersText || "—",
        pastAttempts: pastAttemptsText || "—",
        quitReason: quitReasonText || "—",
      } as Record<string, string>;
      return tpl
        .replace(/{yearsSmoking}/g, subs.yearsSmoking)
        .replace(/{topTriggers}/g, subs.topTriggers)
        .replace(/{pastAttempts}/g, subs.pastAttempts)
        .replace(/{quitReason}/g, subs.quitReason);
    }

    const parts: string[] = [];
    if (yearsText) parts.push(`You've been smoking for ${yearsText}.`);
    if (triggersText)
      parts.push(
        `${triggersText} ${
          triggersText.endsWith("s") ? "are" : "is"
        } your main trigger${triggersText.includes(" and ") ? "s" : ""}.`
      );
    if (pastAttemptsText)
      parts.push(`You've tried quitting ${pastAttemptsText} before.`);
    if (quitReasonText)
      parts.push(`This time your reason is ${quitReasonText}.`);

    if (parts.length === 0) return null;
    // Friendly coach-style reflection instead of raw data summary
    return "Don't worry about how long you've smoked or what your triggers are. PuffNoMore is designed to guide you step by step, making each week easier until you're smoke-free.";
  };

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isCompact = screenHeight < 700 || screenWidth < 360;
  const thumbSize = isCompact ? 34 : screenWidth > 420 ? 44 : 38;

  // reserve extra bottom space for fixed action bar on small devices
  const captionBottomReserve = Math.max(110, Math.floor(screenHeight * 0.16));

  // Analysis bar sizing (used by the `analysis` screen)
  // enlarge area so bars are visually dominant
  const analysisBoxHeight = Math.min(
    380,
    Math.max(200, Math.floor(screenHeight * 0.34))
  );
  // scale up heights more for a bolder visual
  const analysisScale = 2.6;
  let analysisRedHeight = Math.min(
    analysisBoxHeight - 12,
    Math.round(analysisBoxHeight * 0.56 * analysisScale)
  );
  let analysisGreenHeight = Math.min(
    analysisBoxHeight - 16,
    Math.round(analysisBoxHeight * 0.12 * analysisScale)
  );
  // ensure red is always taller than green with a minimum gap
  const analysisMinGap = Math.max(12, Math.round(analysisBoxHeight * 0.06));
  if (analysisGreenHeight + analysisMinGap >= analysisRedHeight) {
    analysisRedHeight = Math.min(
      analysisBoxHeight - 12,
      analysisGreenHeight + analysisMinGap
    );
    if (analysisRedHeight > analysisBoxHeight - 12) {
      analysisRedHeight = analysisBoxHeight - 12;
      analysisGreenHeight = Math.max(8, analysisRedHeight - analysisMinGap);
    }
  }
  // Helper: map x (0..trackWidth) -> discrete value (min..max)
  const computeValueFromX = (x: number, sIdx = index) => {
    const s = screens[sIdx] || {};
    const min = typeof s.input?.min === "number" ? s.input.min : 1;
    const max = typeof s.input?.max === "number" ? s.input.max : min + 1;
    const width = trackWidth.current || 0;
    if (width <= 0 || max === min) return min;
    // return a continuous (float) value while dragging so the thumb moves smoothly
    const frac = Math.max(0, Math.min(1, x / width));
    const raw = min + frac * (max - min);
    return Math.max(min, Math.min(max, raw));
  };

  // Helper: map discrete value -> x position on track
  const computeXFromValue = (v: number, sIdx = index) => {
    const s = screens[sIdx] || {};
    const min = typeof s.input?.min === "number" ? s.input.min : 1;
    const max = typeof s.input?.max === "number" ? s.input.max : min + 1;
    const width = trackWidth.current || 0;
    if (width <= 0 || max === min) return 0;
    const frac = (v - min) / (max - min);
    return Math.max(0, Math.min(width, frac * width));
  };

  // --- Rating / Store helpers -------------------------------------------------
  // Replace these placeholders with your actual App Store / Play Store ids
  const APPLE_APP_ID = "YOUR_APPLE_APP_ID"; // e.g. 1234567890
  const ANDROID_PACKAGE = "com.example.yourapp"; // e.g. com.example.app
  // Debug toggle: set true to force the external store confirmation path
  const DEBUG_FORCE_FALLBACK_REVIEW = false;

  const openStoreForRating = async () => {
    try {
      if (Platform.OS === "ios") {
        // direct to app review page on iOS
        const url = `itms-apps://itunes.apple.com/app/id${APPLE_APP_ID}?action=write-review`;
        try {
          await Linking.openURL(url);
        } catch {
          // fallback to web
          await Linking.openURL(`https://apps.apple.com/app/id${APPLE_APP_ID}`);
        }
      } else {
        // Android: try Play Store app first, then web fallback
        const marketUrl = `market://details?id=${ANDROID_PACKAGE}`;
        const webUrl = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
        try {
          await Linking.openURL(marketUrl);
        } catch {
          await Linking.openURL(webUrl);
        }
      }
    } catch (e) {
      console.warn("openStoreForRating error:", e);
    }
  };

  const promptInAppReview = async () => {
    // Try Expo StoreReview if available, otherwise open store page
    try {
      // dynamically require to avoid breaking non-expo setups
      const StoreReview = require("expo-store-review");
      if (StoreReview && StoreReview.isAvailableAsync) {
        const available = await StoreReview.isAvailableAsync();
        if (available) {
          await StoreReview.requestReview();
          return true;
        }
      }
    } catch {
      // ignore - fallback to opening store
    }

    await openStoreForRating();
    return false;
  };

  // Handler that confirms opening the store when in-app review isn't available
  const handleRateNow = async () => {
    console.log && console.log("handleRateNow invoked");
    try {
      // On web, native Alert handlers may not behave as on mobile —
      // skip prompts and advance immediately so the Next button works.
      if (Platform.OS === "web") {
        goNext();
        return;
      }
      // Check if expo-store-review is available first
      let storeReviewAvailable = false;
      try {
        const StoreReview = require("expo-store-review");
        if (StoreReview && StoreReview.isAvailableAsync) {
          storeReviewAvailable = await StoreReview.isAvailableAsync();
        }
      } catch {
        storeReviewAvailable = false;
      }

      // allow forcing the fallback path during testing
      if (DEBUG_FORCE_FALLBACK_REVIEW) storeReviewAvailable = false;

      console.log && console.log("storeReviewAvailable:", storeReviewAvailable);

      if (storeReviewAvailable) {
        try {
          await promptInAppReview();
        } catch (e) {
          console.warn(e);
        }
        try {
          Alert.alert("Thanks!", "Thanks for rating PuffNoMore.");
        } catch {}
        goNext();
        return;
      }

      // If in-app review not available, show a platform-specific message
      const storeName = Platform.OS === "android" ? "Play Store" : "App Store";
      Alert.alert(
        "Enjoying PuffNoMore?",
        `Tap a star to rate it on the ${storeName}.`,
        [
          {
            // primary action: open store — show unfilled spaced stars
            text: "☆  ☆  ☆  ☆  ☆",
            onPress: async () => {
              try {
                await openStoreForRating();
                try {
                  Alert.alert("Thanks!", "Thanks for supporting PuffNoMore.");
                } catch {}
              } catch (e) {
                console.warn(e);
              }
              goNext();
            },
          },
          // cancel action: stars prepended to "Not Now"
          { text: "Not Now", onPress: () => goNext() },
        ]
      );
    } catch (e) {
      console.warn(e);
      goNext();
    }
  };
  useEffect(() => {
    // keep panValueRef in sync with Animated.Value
    const id = (pan as any).addListener(({ value }: any) => {
      panValueRef.current = value;
    });

    // create pan responder for draggable slider (map pageX to track)
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: any) => {
        pan.stopAnimation && pan.stopAnimation();
        const pageX = evt.nativeEvent?.pageX ?? 0;
        const raw = pageX - (trackLeft.current || 0);
        const clamped = Math.max(0, Math.min(trackWidth.current || 0, raw));
        pan.setValue(clamped);
        const v = computeValueFromX(clamped, index);
        setSliderValue(v);
      },
      onPanResponderMove: (evt: any, _gestureState: any) => {
        const pageX = evt.nativeEvent?.pageX ?? _gestureState?.moveX ?? 0;
        const raw = pageX - (trackLeft.current || 0);
        const x = Math.max(0, Math.min(trackWidth.current || 0, raw));
        pan.setValue(x);
        const v = computeValueFromX(x, index);
        setSliderValue(v);
      },
      onPanResponderRelease: () => {
        // during drag we keep a continuous value; on release snap to nearest integer
        const raw =
          typeof sliderValue === "number"
            ? sliderValue
            : computeValueFromX(panValueRef.current, index);
        const final = Math.round(raw);
        const toX = computeXFromValue(final, index);
        Animated.spring(pan, {
          toValue: toX,
          friction: 8,
          tension: 40,
          useNativeDriver: false,
        }).start(() => {
          panValueRef.current = toX;
          setSliderValue(final);
        });
      },
    });

    return () => {
      (pan as any).removeListener && (pan as any).removeListener(id);
    };
  }, [index, pan, screens, sliderValue]);
  // keep Animated pan in sync when sliderValue changes (tap or programmatic)
  useEffect(() => {
    const s = screens[index];
    if (
      s &&
      s.type === "question" &&
      s.input?.type === "slider" &&
      typeof sliderValue === "number"
    ) {
      const v = sliderValue;
      const toX = computeXFromValue(v, index);
      Animated.spring(pan, {
        toValue: toX,
        friction: 9,
        tension: 40,
        useNativeDriver: false,
      }).start(() => {
        panValueRef.current = toX;
      });
    }
  }, [sliderValue, index, pan, screens]);
  // slider logic removed — slider-related effects and refs cleaned up
  const weeksCount = (() => {
    if (!barCfg) return 0;
    if (typeof barCfg.weeks === "number") return barCfg.weeks;
    // default to 8 bars for the onboarding taper chart unless explicitly configured
    return 8;
  })();

  // Use full available screen width for the onboarding chart so x-axis can reach device edges
  const containerPadding = 20; // matches styles.container.padding
  const contentPadding = 8; // matches styles.contentWrapper.paddingHorizontal
  const horizontalOffset = containerPadding + contentPadding;
  const chartWidth = Math.min(760, screenWidth);
  // For the onboarding value screen, use a static sample baseline so the chart
  // doesn't depend on other screens' answers. The spec can provide an optional
  // `baseline` under `ui.barChart`; otherwise fall back to 7 (show labels 1..7).
  const chartBaseline =
    (barCfg && (barCfg.baseline || barCfg.staticBaseline)) || 7;
  const chartData = showBar
    ? Array.from({ length: weeksCount }, (_, i) => {
        const value = Math.round(
          chartBaseline * (1 - i / Math.max(1, weeksCount - 1))
        );
        const labelText =
          Platform.OS === "android" ? `Wk ${i + 1}` : `Week ${i + 1}`;
        return { value, label: labelText };
      })
    : [];

  // Configure Y axis sections/labels for the onboarding chart so labels run 1..N
  // where N is the baseline (default 7). This keeps the onboarding chart static
  // and readable during the onboarding flow.
  const yAxisSections = Math.max(1, Number(chartBaseline));
  const yAxisLabelTexts = Array.from({ length: yAxisSections }, (_, i) =>
    String(i + 1)
  );
  // Responsive chart sizing: adapt height for small, large phones and tablets
  const isLargePhone = screenWidth > 420;
  const isTablet = screenWidth >= 768;
  const maxChartHeight = isTablet ? 420 : isLargePhone ? 360 : 260;
  const widthFactor = isTablet ? 0.6 : isLargePhone ? 0.56 : 0.52;
  const heightFactor = isTablet ? 0.45 : 0.32;
  const heightCandidate = Math.floor(
    Math.min(screenWidth * widthFactor, screenHeight * heightFactor)
  );
  const chartHeight = Math.min(maxChartHeight, Math.max(160, heightCandidate));

  // responsive spacing and heights for the line chart (dependent on screenWidth/chartHeight)

  // Minimum spacing depends on screen width so bars don't become cramped on small devices
  const minSpacing = screenWidth < 360 ? 4 : screenWidth < 420 ? 6 : 8;
  const desiredSpacing = Math.max(minSpacing, Math.floor(chartWidth * 0.02));
  const spacingComputed = desiredSpacing;
  const totalSpacing = Math.max(0, (weeksCount - 1) * spacingComputed);

  // Compute an initial bar width that fits the available chart width
  let barWidthComputed = Math.floor(
    (chartWidth - totalSpacing) / Math.max(1, weeksCount)
  );
  // allow slightly smaller bars on very small screens
  if (screenWidth < 360) {
    barWidthComputed = Math.max(6, barWidthComputed);
  } else {
    barWidthComputed = Math.max(8, barWidthComputed);
  }

  // If bars would overflow, progressively reduce spacing (but not below minSpacing)
  let usedBarsWidth =
    weeksCount * barWidthComputed +
    Math.max(0, weeksCount - 1) * spacingComputed;
  let spacingTry = spacingComputed;
  while (usedBarsWidth > chartWidth && spacingTry > minSpacing) {
    spacingTry = spacingTry - 1;
    usedBarsWidth =
      weeksCount * barWidthComputed + Math.max(0, weeksCount - 1) * spacingTry;
  }
  const finalSpacing = Math.max(minSpacing, spacingTry);
  usedBarsWidth =
    weeksCount * barWidthComputed + Math.max(0, weeksCount - 1) * finalSpacing;

  // Grow bar width slightly for emphasis but never exceed available space
  const maxBarWidthAvailable = Math.floor(
    (chartWidth - Math.max(0, weeksCount - 1) * finalSpacing) /
      Math.max(1, weeksCount)
  );
  // emphasize bars more on larger devices
  const barGrowFactor =
    screenWidth > 420 ? 1.35 : screenWidth > 360 ? 1.2 : 1.05;
  const increasedBarWidth = Math.min(
    maxBarWidthAvailable,
    Math.floor(barWidthComputed * barGrowFactor)
  );
  barWidthComputed = Math.max(screenWidth < 360 ? 6 : 8, increasedBarWidth);

  // Recompute used width after adjustments
  usedBarsWidth =
    weeksCount * barWidthComputed + Math.max(0, weeksCount - 1) * finalSpacing;
  const initialSpacing = Math.max(
    screenWidth < 360 ? 4 : screenWidth > 420 ? 12 : 8,
    Math.floor((chartWidth - usedBarsWidth) / 2)
  );
  // arrow overlay removed

  const isDarkTheme =
    theme.colors.primaryBackground === darkTheme.colors.primaryBackground;
  const welcomeGradient = isDarkTheme
    ? ["#071018", "#021018"]
    : ["#E6F8EA", "#F7FBFF"];
  const diagonalTint = isDarkTheme
    ? theme.colors.primaryGreen + "12"
    : theme.colors.primaryGreen + "22";
  const circleLargeOpacity = isDarkTheme ? "12" : "28";
  const circleSmallOpacity = isDarkTheme ? "08" : "14";
  const accentLargeOpacity = isDarkTheme ? "08" : "18";

  const animatedBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.colors.primaryBackground,
      current.ui?.backgroundColor || "#b71c1c",
    ],
  });

  // For screens that explicitly want a persistent background (e.g. scare id 18),
  // use the spec color directly so it doesn't flash away when `anim` changes.
  const forceBg =
    (current as any)?.id === 18 && (current as any)?.ui?.backgroundColor;
  const containerBgStyle: any = forceBg
    ? { backgroundColor: (current as any).ui.backgroundColor }
    : { backgroundColor: animatedBg };

  // If we're on the commitment screen or the spec requested the commitment
  // style via `ui.background`, use a full-bleed gradient background instead
  // of the theme's solid primaryBackground so it matches rating/native
  // screens. Separately, if `renderComponentAsBackground` is true we will
  // render the native component full-bleed instead of the gradient.
  // Treat all screens from the commitment start (id 202) onward as commitment-style
  const isCommitmentBg =
    (current as any)?.type === "commitment" ||
    (current as any)?.ui?.background === "commitmentGradient" ||
    inCommitmentRange;
  const isScreen202 = (current as any)?.id === 202;
  const isReductionSpecial = [31, 32, 33, 103].includes((current as any)?.id);
  // When rendering our custom full-bleed background (native or the new
  // CommitmentBackground202), keep the container transparent so the
  // decorative layer is visible behind content.
  const useTransparentContainer =
    renderComponentAsBackground || isScreen202 || inCommitmentRange;

  // Typewriter header state for screen 202
  const [animatedHeader, setAnimatedHeader] = useState<string>(
    resolveTokenText((current as any)?.header || "") as string
  );

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // For screen 202 we avoid per-character state updates which cause
    // many re-renders. Instead reveal the full header immediately and
    // rely on the native `headerAnim` entrance (opacity/translate)
    // for perceived motion. This greatly improves responsiveness.
    if (!isScreen202) {
      setAnimatedHeader(resolveTokenText((current as any)?.header || ""));
      return;
    }
    const full = (current as any)?.header || "";
    setAnimatedHeader(resolveTokenText(full));
  }, [(current as any)?.header, isScreen202]);

  // Run a native-driver entrance animation for the header to reduce perceived slowness
  useEffect(() => {
    if (!isScreen202) return;
    headerAnim.setValue(0);
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [(current as any)?.header, isScreen202, headerAnim]);

  return (
    <Animated.View
      style={
        [
          styles.container,
          useTransparentContainer
            ? { backgroundColor: "transparent" }
            : containerBgStyle,
        ] as any
      }
    >
      {(inCommitmentRange || isScreen202) && <CommitmentBackground202 />}
      {renderComponentAsBackground && NativeComp ? (
        // Render the converted native/React-Native welcome screen as a
        // full-bleed background. Wrap in an absolute-fill View with
        // pointerEvents="auto" so the mounted component receives touches
        // while decorative overlays remain pointerEvents="none".
        <>
          <ErrorBoundary>
            <View style={StyleSheet.absoluteFill} pointerEvents="auto">
              <NativeComp
                onFinish={goNext}
                onBack={() =>
                  index > 0
                    ? setIndex((i) => Math.max(0, i - 1))
                    : nav.canGoBack && nav.goBack()
                }
                saveOnboardingAnswer={saveOnboardingAnswer}
                style={StyleSheet.absoluteFill}
              />
            </View>
          </ErrorBoundary>
          {/* Top-left back button (match rating screen) */}
          {(current as any)?.id !== 202 && (
            <TouchableOpacity
              accessibilityLabel="Back"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => {
                try {
                  if (index > 0) setIndex((i) => Math.max(0, i - 1));
                  else if ((nav as any)?.canGoBack) (nav as any).goBack();
                } catch {
                  /* ignore */
                }
              }}
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                zIndex: 999,
                padding: 8,
                borderRadius: 22,
                backgroundColor: "rgba(0,0,0,0.22)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-back" size={22} color={"#FFFFFF"} />
            </TouchableOpacity>
          )}
        </>
      ) : null}
      {/* background visuals removed */}
      {(current as any)?.type === "scare" ? (
        <View style={styles.scareHeader} pointerEvents="box-none">
          {/* Left chevron shown on the second, third and fourth scare screens (ids:19,20,21) */}
          {[19, 20, 21].includes((current as any)?.id) ? (
            <TouchableOpacity
              onPress={() => {
                // navigate to previous scare screen in the scare sequence
                const scareIds = [18, 19, 20, 21];
                const pos = scareIds.indexOf((current as any)?.id);
                if (pos > 0) {
                  const targetId = scareIds[pos - 1];
                  const targetIndex = screens.findIndex(
                    (s: any) => s && s.id === targetId
                  );
                  if (targetIndex >= 0) setIndex(targetIndex);
                } else if (index > 0) {
                  setIndex(index - 1);
                } else if ((nav as any).canGoBack) {
                  (nav as any).goBack();
                }
              }}
              accessibilityLabel="Back"
              style={styles.scareHeaderLeft}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
          <OText style={styles.scareLogoText}>PuffNoMore</OText>
        </View>
      ) : null}
      {/* If a native component is requested by the spec, render it here. */}
      {shouldRenderNative ? (
        <View style={{ flex: 1 }}>
          <ErrorBoundary>
            <NativeComp
              onFinish={goNext}
              onBack={() =>
                index > 0
                  ? setIndex((i) => Math.max(0, i - 1))
                  : nav.canGoBack && nav.goBack()
              }
              saveOnboardingAnswer={saveOnboardingAnswer}
            />
          </ErrorBoundary>
        </View>
      ) : null}
      {!shouldRenderNative && (
        <>
          {/* Decorative commitment background for specific screens (exclude 203-207 — use CommitmentBackground202 for the whole post-202 range) */}
          {([31, 32, 201] as number[]).includes((current as any)?.id) ? (
            <DecorativeGreenBackground />
          ) : null}

          {/* Back button only for commitment screens (201 onwards) */}
          {inCommitmentRange || [32, 201].includes((current as any)?.id) ? (
            <TouchableOpacity
              accessibilityLabel="Back"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => {
                try {
                  if (index > 0) setIndex((i) => Math.max(0, i - 1));
                  else if ((nav as any)?.canGoBack) (nav as any).goBack();
                } catch {
                  // ignore
                }
              }}
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                zIndex: 999,
                padding: 8,
                borderRadius: 22,
                backgroundColor: "rgba(0,0,0,0.22)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-back" size={22} color={"#FFFFFF"} />
            </TouchableOpacity>
          ) : null}
          {isWelcome ? (
            <>
              <LinearGradient
                colors={welcomeGradient as [string, string]}
                style={StyleSheet.absoluteFill}
              />
              {/* soft diagonal tint to add depth */}
              <LinearGradient
                colors={[diagonalTint, "transparent"] as [string, string]}
                start={{ x: 0.0, y: 0.0 }}
                end={{ x: 1.0, y: 0.8 }}
                style={[
                  styles.diagonalGradient,
                  { opacity: isDarkTheme ? 0.7 : 0.36 },
                ]}
              />
              <View
                style={[
                  styles.bgCircleLarge,
                  {
                    backgroundColor:
                      theme.colors.primaryGreen + circleLargeOpacity,
                  },
                ]}
              />
              <View
                style={[
                  styles.bgAccentLarge,
                  {
                    backgroundColor:
                      theme.colors.primaryGreen + accentLargeOpacity,
                  },
                ]}
              />
              <View
                style={[
                  styles.bgCircleSmall,
                  {
                    backgroundColor:
                      theme.colors.primaryGreen + circleSmallOpacity,
                  },
                ]}
              />
              {(() => {
                const headerTitle = specialHeaderIds.includes(
                  (current as any)?.id
                )
                  ? (current as any).header
                  : "PuffNoMore";
                const titleSize = specialHeaderIds.includes(
                  (current as any)?.id
                )
                  ? theme.fonts.size.large
                  : theme.fonts.size.xlarge * 1.4;
                // Hide the global header for the full-screen rating screen (id 33)
                if ((current as any)?.id === 33) {
                  return null;
                }

                return (
                  <AppHeader
                    title={headerTitle}
                    titleSize={titleSize}
                    transparent={true}
                    titleColor={theme.colors.primaryGreen}
                    animateLetters={isScreen202}
                    onBack={
                      showBack
                        ? () =>
                            index > 0
                              ? setIndex((i) => i - 1)
                              : nav.canGoBack && nav.goBack()
                        : undefined
                    }
                  />
                );
              })()}
            </>
          ) : (
            <>
              <View style={styles.headerContainer}>
                {(() => {
                  if (!showBack) return null;
                  return (
                    <TouchableOpacity
                      onPress={() =>
                        index > 0
                          ? setIndex((i) => i - 1)
                          : nav.canGoBack && nav.goBack()
                      }
                      style={[
                        styles.headerBackButton,
                        {
                          position: "absolute",
                          left: 16,
                          top: topContentPadding + 6,
                        },
                      ]}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={20}
                        color={theme.colors.primaryGreen}
                      />
                    </TouchableOpacity>
                  );
                })()}

                <View style={styles.headerCenter}>
                  {!hideProgress && index < initialCount ? (
                    <View
                      style={[
                        styles.progressTrack,
                        { backgroundColor: theme.colors.textSecondary + "30" },
                      ]}
                    >
                      <Animated.View
                        style={[
                          styles.progressFill,
                          {
                            width: progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0%", "100%"],
                            }) as any,
                            backgroundColor: theme.colors.primaryGreen,
                          },
                        ]}
                      />
                    </View>
                  ) : null}
                </View>
                {/* right-side back button removed: back icon now rendered on the left */}
              </View>
            </>
          )}
          <View
            style={[
              isWelcome
                ? styles.welcomeContainer
                : isCardless
                  ? styles.cardless
                  : styles.card,
              styles.contentWrapper,
              // (signature screen removed) keep default wrapper styles
              // when showing the onboarding taper bar chart, align header/subtext to top
              showBar && { alignItems: "flex-start" },
              // dynamic top padding so title doesn't overlap the header/progress
              { paddingTop: topContentPadding },
              // For screen 202 nudge content slightly down from the top
              (current as any)?.id === 202 && {
                paddingTop: topContentPadding + 28,
              },
              // ensure bottom spacing so the absolute Next button doesn't overlap content on small screens
              !isWelcome && {
                // For most screens keep a generous bottom padding; for the quitting-target
                // screen (id 102) reduce the large proportional padding on tall devices
                // so the top area (header + Lottie + subtext) can expand responsively.
                paddingBottom:
                  (current as any)?.id === 102
                    ? Math.max(80, Math.floor(screenHeight * 0.08))
                    : Math.max(140, Math.floor(screenHeight * 0.18)),
              },
            ]}
          >
            {/* Lottie (welcome) - placed above the header when this is the welcome screen */}
            {isWelcome && (
              <OnboardingLottie
                animationKey={animationKey}
                style={{
                  lottieWidth: 360,
                  lottieHeight: 300,
                  marginBottom: 16,
                }}
              />
            )}

            {isWelcome ? (
              <View
                style={[
                  styles.welcomeCard,
                  !isDarkTheme && {
                    backgroundColor: "rgba(255,255,255,0.88)",
                    borderWidth: 1,
                    borderColor: "#EFEFEF",
                  },
                ]}
              >
                {(current as any)?.id !== 14 && (
                  <OText
                    style={[
                      styles.header,
                      {
                        color:
                          isCommitmentBg || isReductionSpecial
                            ? "#FFFFFF"
                            : theme.colors.text,
                        fontFamily: theme.fonts.family.bold,
                      },
                      {
                        fontSize: isCommitmentBg
                          ? 34
                          : theme.fonts.size.xxlarge * 1.1,
                        textAlign: "center",
                        marginBottom: 8,
                      },
                      // center welcome header and subsequent screens when inCenterRange
                      inCenterRange && {
                        textAlign: "center",
                        alignSelf: "center",
                        width: "100%",
                      },
                    ]}
                    numberOfLines={isCardless ? 1 : undefined}
                    ellipsizeMode={isCardless ? "tail" : undefined}
                  >
                    {/** render header with tokens resolved */}
                    {resolveTokenText((current as any)?.header)}
                  </OText>
                )}
                {/* optional ui.lead (used for showing quit date or short lead text) */}
                {((current as any)?.ui?.lead || "") !== "" ? (
                  <Text
                    style={[
                      styles.smallHeaderText,
                      {
                        color:
                          isCommitmentBg || isReductionSpecial
                            ? "#FFFFFF"
                            : theme.colors.textSecondary,
                        textAlign: inCenterRange ? "center" : "left",
                        marginBottom: 12,
                      },
                    ]}
                  >
                    {resolveTokenText((current as any)?.ui?.lead)}
                  </Text>
                ) : null}
                {/* For the quitting-target screen, render the Lottie between header and subtext */}
                {(current as any).id === 102 &&
                (current as any).ui?.animation ? (
                  <OnboardingLottie
                    animationKey={(current as any).ui.animation}
                    style={{
                      ...((current as any).ui.lottieStyle || {
                        lottieWidth: 360,
                        lottieHeight: 240,
                        marginBottom: 12,
                      }),
                      _expandLottieContainer: true,
                    }}
                  />
                ) : null}

                {current.subtext && (current as any)?.id !== 14
                  ? (() => {
                      const customSubtextColor = (current as any)?.ui
                        ?.subtextStyle?.color;
                      const defaultSubtextColor =
                        isCommitmentBg || isReductionSpecial
                          ? "rgba(255,255,255,0.9)"
                          : theme.colors.textSecondary;
                      return (
                        <Text
                          style={[
                            styles.sub,
                            {
                              color: customSubtextColor || defaultSubtextColor,
                              fontFamily: theme.fonts.family.regular,
                              fontSize: theme.fonts.size.large,
                              textAlign: isCommitmentBg ? "center" : "center",
                              lineHeight: 22,
                            },
                            // center subtext for the personalized-plan range
                            inCenterRange && {
                              textAlign: "center",
                              alignSelf: "center",
                              width: "100%",
                            },
                          ]}
                          numberOfLines={isCardless ? 1 : undefined}
                          ellipsizeMode={isCardless ? "tail" : undefined}
                        >
                          {current.subtext}
                        </Text>
                      );
                    })()
                  : null}
              </View>
            ) : (
              <>
                {current.type === "analysis" ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <OText
                      style={{
                        marginRight: 8,
                        color: theme.colors.primaryGreen,
                        fontFamily: theme.fonts.family.bold,
                      }}
                    >
                      Analysis Complete
                    </OText>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={theme.colors.primaryGreen}
                    />
                  </View>
                ) : null}
                {smallHeader ? (
                  <View style={styles.smallHeaderRow}>
                    <Text
                      style={[
                        styles.smallHeaderText,
                        {
                          flex: 1,
                          textAlign: "center",
                          color: theme.colors.primaryGreen,
                          fontFamily: theme.fonts.family.bold,
                        },
                      ]}
                    >
                      {smallHeader.text}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (index > 0) return setIndex((i) => i - 1);
                        try {
                          if (nav && typeof nav.canGoBack === "function") {
                            if (nav.canGoBack()) return nav.goBack();
                          } else if (nav && nav.goBack) {
                            return nav.goBack();
                          }
                        } catch {
                          // ignore
                        }
                      }}
                      style={styles.smallHeaderBack}
                      hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                      accessible={true}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={20}
                        color={theme.colors.primaryGreen}
                      />
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Render a centered Lottie above the header only when the spec explicitly requests an expanded Lottie */}
                {(() => {
                  const lottieSpec = (current as any).ui?.lottieStyle || {};
                  const shouldExpand = !!lottieSpec._expandLottieContainer;
                  if (!(current as any).ui?.animation || !shouldExpand)
                    return null;

                  // Treat positive-like value screens similarly to scare screens for
                  // layout (expanded Lottie container and typography), but do not
                  // apply the scare background color or scare-only chrome (chevrons).
                  const isScare = (current as any).type === "scare";

                  if (isScare || isPositiveLike) {
                    const rawH =
                      lottieSpec.lottieHeight || lottieSpec.height || 160;
                    const lottieH =
                      typeof rawH === "string" && rawH.endsWith("%")
                        ? Math.round((screenHeight * parseFloat(rawH)) / 100)
                        : Number(rawH || 160);
                    // make the container tall and push its contents to the bottom
                    const containerH = Math.min(
                      Math.max(lottieH + 8, Math.round(screenHeight * 0.5)),
                      Math.round(screenHeight * 0.82)
                    );
                    return (
                      <View
                        style={{
                          width: "100%",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          height: containerH,
                          paddingBottom: 14,
                          marginBottom: 6,
                        }}
                      >
                        <OnboardingLottie
                          animationKey={(current as any).ui.animation}
                          style={lottieSpec as any}
                        />
                      </View>
                    );
                  }

                  return (
                    <OnboardingLottie
                      animationKey={(current as any).ui.animation}
                      style={lottieSpec as any}
                    />
                  );
                })()}

                {(current as any).id !== 204 && (
                  <Animated.Text
                    style={[
                      styles.header,
                      {
                        color:
                          isCommitmentBg || isReductionSpecial
                            ? "#FFFFFF"
                            : theme.colors.text,
                        fontFamily: theme.fonts.family.bold,
                      },

                      !isWelcome && {
                        fontSize: isCommitmentBg ? 34 : 26,
                        textAlign: isCommitmentBg ? "center" : "left",
                        alignSelf: "stretch",
                      },
                      isMatchGender && {
                        fontSize: theme.fonts.size.xxlarge * 1.15,
                        textAlign: "left",
                        alignSelf: "stretch",
                      },
                      // reduce header size for compact category screens (symptom screens)
                      (current as any)?.ui?.category && {
                        fontSize: 20,
                      },
                      // center and reduce header size on analysis screen
                      (current as any)?.type === "analysis" && {
                        textAlign: "center",
                        alignSelf: "center",
                        width: "100%",
                        fontSize: 22,
                      },
                      isWelcome && {
                        fontSize: theme.fonts.size.xxlarge * 1.2,
                        letterSpacing: 0.3,
                        textAlign: "center",
                      },
                      // center quitting-target header when shown inside the welcome card
                      (current as any)?.id === 102 && {
                        textAlign: "center",
                        alignSelf: "center",
                      },
                      // smaller, centered header for Reduction-related screens
                      ((current as any)?.header === "Reduction Benefits" ||
                        [31, 32, 33, 103].includes((current as any)?.id)) && {
                        fontSize: 20,
                        textAlign: "center",
                        alignSelf: "center",
                      },
                      // Special treatment for reduction screens: make title prominent
                      [31, 32, 33, 103].includes((current as any)?.id) && {
                        fontSize: 26,
                        fontFamily: theme.fonts.family.bold,
                        textAlign: "center",
                        marginBottom: 18,
                      },
                      // high-contrast centered header for scare screens; positive-like screens use same layout
                      ((current as any)?.type === "scare" ||
                        isPositiveLike) && {
                        textAlign: "center",
                        alignSelf: "center",
                        width: "100%",
                      },
                      (current as any)?.type === "scare" && {
                        color: "#FFFFFF",
                      },
                      ((current as any)?.type === "scare" ||
                        isPositiveLike) && {
                        marginTop: 2,
                      },
                      // for the bar-chart screen, reduce tight stacking and add bottom spacing
                      showBar && { marginTop: 6, marginBottom: 12 },
                      !isWelcome && { marginBottom: 18 },
                      // Explicitly center the header for the commitment screen
                      // and for screen id 202 so the title appears centered.
                      ((current as any)?.type === "commitment" ||
                        (current as any)?.id === 202) && {
                        textAlign: "center",
                        alignSelf: "center",
                        width: "100%",
                      },
                      // Reduce header size specifically for screen 202
                      (current as any)?.id === 202 && {
                        fontSize: 28,
                      },
                      // Small spacing tweak for screen 202 when placed near bottom
                      (current as any)?.id === 202 && {
                        marginTop: 6,
                      },
                      // entrance animation (apply only for screen 202)
                      (isScreen202
                        ? {
                            opacity: headerAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 1],
                            }),
                            transform: [
                              {
                                translateY: headerAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [8, 0],
                                }),
                              },
                            ],
                          }
                        : {}) as any,
                      // center headers for the personalized-plan range and onward
                      inCenterRange && {
                        textAlign: "center",
                        alignSelf: "center",
                        width: "100%",
                      },
                    ]}
                  >
                    {isScreen202
                      ? animatedHeader
                      : resolveTokenText((current as any)?.header)}
                  </Animated.Text>
                )}
                {/* For the quitting-target screen, render Lottie between header and subtext when not welcome */}
                {(current as any).id === 102 &&
                (current as any).ui?.animation ? (
                  <OnboardingLottie
                    animationKey={(current as any).ui.animation}
                    style={{
                      ...((current as any).ui.lottieStyle || {
                        lottieWidth: 360,
                        lottieHeight: 240,
                        marginBottom: 12,
                      }),
                      _expandLottieContainer: true,
                    }}
                  />
                ) : null}
                {current.subtext && (current as any).id !== 204
                  ? (() => {
                      const customSubtextColor = (current as any)?.ui
                        ?.subtextStyle?.color;
                      const defaultColor = isCommitmentBg
                        ? "rgba(255,255,255,0.9)"
                        : theme.colors.textSecondary;
                      return (
                        <Text
                          style={[
                            styles.sub,
                            {
                              color: customSubtextColor || defaultColor,
                              fontFamily: theme.fonts.family.regular,
                            },
                            !isWelcome && {
                              fontSize: 16,
                              textAlign: isCommitmentBg ? "center" : "left",
                              alignSelf: "stretch",
                            },
                            isMatchGender && {
                              fontSize: theme.fonts.size.medium * 1.1,
                              lineHeight: 20,
                              textAlign: isCommitmentBg ? "center" : "left",
                              alignSelf: "stretch",
                            },
                            // Compact, centered subtext for screen 202 placed at bottom
                            (current as any)?.id === 202 && {
                              fontSize: 17,
                              textAlign: "center",
                              lineHeight: 22,
                              alignSelf: "center",
                              width: "100%",
                            },
                            ((current as any)?.type === "scare" ||
                              isPositiveLike) && {
                              textAlign: "center",
                              alignSelf: "center",
                              width: "100%",
                              fontSize: 16,
                              lineHeight: 22,
                            },
                            centerGoalsRange && {
                              textAlign: "center",
                              alignSelf: "center",
                              width: "100%",
                            },
                            // center subtext for the personalized-plan range
                            inCenterRange && {
                              textAlign: "center",
                              alignSelf: "center",
                              width: "100%",
                            },
                            (current as any)?.type === "scare" && {
                              color: "#FFFFFF",
                            },
                            (current as any)?.type === "analysis" && {
                              textAlign: "center",
                              alignSelf: "center",
                              width: "100%",
                              fontSize: 14,
                              lineHeight: 20,
                            },
                            showBar && { marginBottom: 16 },
                          ]}
                        >
                          {current.subtext}
                        </Text>
                      );
                    })()
                  : null}
                {/* Render ui.lead (e.g. quit date) under the subtext for non-welcome screens */}
                {((current as any)?.ui?.lead || "") !== "" &&
                (current as any).id !== 204 ? (
                  <View style={{ width: "100%" }}>
                    {/* subtle spacer/divider to separate subtext from lead */}
                    <View style={{ height: 8, width: "100%" }} />
                    <View
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 22,
                        paddingVertical: 16,
                        paddingHorizontal: 20,
                        alignSelf: inCenterRange ? "center" : "flex-start",
                        marginTop: 20,
                        marginBottom: 16,
                        // subtle shadow for depth on supported platforms
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 6,
                        elevation: 3,
                      }}
                    >
                      <Text
                        style={[
                          styles.smallHeaderText,
                          {
                            color: theme.colors.text,
                            textAlign: inCenterRange ? "center" : "left",
                            fontFamily: theme.fonts.family.bold,
                            fontSize: 16,
                            lineHeight: 20,
                          },
                        ]}
                      >
                        {resolveTokenText((current as any)?.ui?.lead)}
                      </Text>
                    </View>
                  </View>
                ) : null}
                {/* Additional full-screen content only for screen id 202 */}
                {(current as any).id === 204 ? (
                  <ScrollView
                    contentContainerStyle={{
                      paddingTop: 0,
                      paddingBottom: 160,
                      minHeight: Math.max(screenHeight, 400),
                    }}
                    showsVerticalScrollIndicator={false}
                    style={{ width: "100%", maxHeight: screenHeight }}
                    keyboardShouldPersistTaps="handled"
                  >
                    {/* For id:204 place the header/subtext/lead inside the ScrollView
                        so they scroll with the body (mimics rating modal behavior) */}
                    {(current as any).id === 204 && (
                      <>
                        <Text
                          style={{
                            color: "#ffffff",
                            fontSize: 28,
                            fontWeight: "bold",
                            fontFamily: theme.fonts.family.bold,
                            textAlign: "center",
                            lineHeight: 34,
                            marginBottom: 8,
                          }}
                        >
                          {resolveTokenText((current as any)?.header)}
                        </Text>

                        <Text
                          style={{
                            color: "#ffffff",
                            fontSize: 16,
                            textAlign: "center",
                            marginBottom: 12,
                            fontFamily: theme.fonts.family.regular,
                          }}
                        >
                          {current.subtext}
                        </Text>

                        {((current as any)?.ui?.lead || "") !== "" ? (
                          <View style={{ width: "100%" }}>
                            <View style={{ height: 4, width: "100%" }} />
                            <View
                              style={{
                                backgroundColor: "#FFFFFF",
                                borderRadius: 22,
                                paddingVertical: 12,
                                paddingHorizontal: 20,
                                alignSelf: "center",
                                marginTop: 8,
                                marginBottom: 12,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 6,
                                elevation: 3,
                              }}
                            >
                              <Text
                                style={[
                                  styles.smallHeaderText,
                                  {
                                    color: theme.colors.text,
                                    textAlign: "center",
                                    fontFamily: theme.fonts.family.bold,
                                    fontSize: 16,
                                    lineHeight: 20,
                                  },
                                ]}
                              >
                                {resolveTokenText((current as any)?.ui?.lead)}
                              </Text>
                            </View>
                          </View>
                        ) : null}
                      </>
                    )}

                    {/* Decorative Line (moved below lead/date for id:204) */}
                    <View
                      style={{
                        width: 256,
                        height: 1,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        marginVertical: 32,
                        alignSelf: "center",
                      }}
                    />

                    {/* Laurel and Stars */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 24,
                      }}
                    >
                      {/* Left Laurel */}
                      <Svg width={64} height={64} viewBox="0 0 64 64">
                        <Path
                          d="M20 50C20 50 15 45 12 35C9 25 10 15 10 15C10 15 12 20 15 25C18 30 22 35 22 35"
                          fill="#d1d5db"
                          opacity="0.8"
                        />
                        <Path
                          d="M24 48C24 48 20 42 18 33C16 24 17 16 17 16C17 16 19 20 21 26C23 32 26 38 26 38"
                          fill="#d1d5db"
                          opacity="0.9"
                        />
                      </Svg>

                      {/* Stars (use per-item margin instead of `gap`) */}
                      <View
                        style={{ flexDirection: "row", marginHorizontal: 8 }}
                      >
                        {[...Array(5)].map((_, i) => (
                          <Svg
                            key={i}
                            width={32}
                            height={32}
                            viewBox="0 0 24 24"
                            fill="#fbbf24"
                            style={{ marginHorizontal: 2 }}
                          >
                            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </Svg>
                        ))}
                      </View>

                      {/* Right Laurel (mirrored) */}
                      <Svg
                        width={64}
                        height={64}
                        viewBox="0 0 64 64"
                        style={{ transform: [{ scaleX: -1 }] }}
                      >
                        <Path
                          d="M20 50C20 50 15 45 12 35C9 25 10 15 10 15C10 15 12 20 15 25C18 30 22 35 22 35"
                          fill="#d1d5db"
                          opacity="0.8"
                        />
                        <Path
                          d="M24 48C24 48 20 42 18 33C16 24 17 16 17 16C17 16 19 20 21 26C23 32 26 38 26 38"
                          fill="#d1d5db"
                          opacity="0.9"
                        />
                      </Svg>
                    </View>

                    {/* Main Message */}
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 28,
                        fontWeight: "bold",
                        textAlign: "center",
                        lineHeight: 34,
                        marginBottom: 8,
                      }}
                    >
                      {"Become the best of"}
                      {"\n"}
                      {"yourself with PuffNoMore"}
                    </Text>
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        textAlign: "center",
                        marginBottom: 24,
                      }}
                    >
                      Stronger. Healthier. Happier.
                    </Text>

                    {/* Benefit Badges - use per-badge margin instead of gap */}
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        maxWidth: 384,
                        marginBottom: 24,
                        paddingHorizontal: 16,
                      }}
                    >
                      {[
                        {
                          color: "#3a5a7a",
                          border: "#5a7a9a",
                          text: "Increased Testosterone",
                        },
                        {
                          color: "#8a6a3a",
                          border: "#aa8a5a",
                          text: "Prevent Erectile Dysfunction",
                        },
                        {
                          color: "#2a6a4a",
                          border: "#4a8a6a",
                          text: "Increased Energy",
                        },
                        {
                          color: "#7a3a6a",
                          border: "#9a5a8a",
                          text: "Increased Motivation",
                        },
                        {
                          color: "#3a6a7a",
                          border: "#5a8a9a",
                          text: "Improved Focus",
                        },
                      ].map((b, i) => (
                        <View
                          key={i}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            margin: 4,
                            backgroundColor: b.color,
                            borderWidth: 1,
                            borderColor: b.border,
                            borderRadius: 20,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                          }}
                        >
                          <Svg
                            width={16}
                            height={16}
                            viewBox="0 0 20 20"
                            fill="#ffffff"
                            style={{ marginRight: 8 }}
                          >
                            <Path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9V7h2v6z" />
                          </Svg>
                          <Text
                            style={{
                              color: "#ffffff",
                              fontSize: 12,
                              fontWeight: "500",
                            }}
                          >
                            {b.text}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* CTA removed as requested */}

                    {/* Footer moved to bottom action bar for id:204 */}

                    {/* Bottom Branding removed per request */}

                    {/* Home Indicator (hide on id:204 since branding removed) */}
                    {(current as any).id !== 204 && (
                      <View
                        style={{
                          width: 128,
                          height: 4,
                          backgroundColor: "rgba(255, 255, 255, 0.4)",
                          borderRadius: 2,
                          marginTop: 16,
                        }}
                      />
                    )}
                  </ScrollView>
                ) : null}
              </>
            )}

            {/* (Lottie removed from here; welcome Lottie is rendered above header) */}

            {/* Render the personalized plan card on the plan-intro screen (id:203) */}
            {(current as any).id === 203 ? (
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  marginTop: 12,
                  marginBottom: 18,
                }}
              >
                <PlanCard />
              </View>
            ) : null}

            {current.type === "commitment" ? (
              <>
                {/* Decorative background removed here to avoid covering header/subtext; rendered above */}
                <CommitmentScreen
                  onSave={(strokes: any) =>
                    saveOnboardingAnswer(
                      "commitmentSignature",
                      JSON.stringify(strokes)
                    )
                  }
                  onFinish={goNext}
                  onBack={() =>
                    index > 0
                      ? setIndex((i) => Math.max(0, i - 1))
                      : nav.canGoBack && nav.goBack()
                  }
                />

                {/* Guide text placed between Clear and the bottom action button */}
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    marginTop: 8,
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={[
                      styles.sub,
                      {
                        color: "#FFFFFF",
                        fontFamily: theme.fonts.family.regular,
                      },
                    ]}
                  >
                    Draw on the open space above
                  </Text>
                </View>
              </>
            ) : current.type === "loading" ? (
              (current as any)?.id === 14 ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    // reduced top margin to keep analyzer and surrounding content visually tight
                    marginTop: Math.max(12, Math.floor(screenHeight * 0.06)),
                    paddingVertical: 16,
                  }}
                >
                  <View
                    style={{
                      width: Math.min(screenWidth * 0.9, 520),
                      height: Math.min(screenWidth * 0.9, 520),
                      borderRadius: 260,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {(() => {
                      const size = Math.min(screenWidth * 0.72, 420);
                      const sSpec = screens[index] || {};
                      const defaultStroke = Math.max(
                        12,
                        Math.round(size * 0.08)
                      );
                      const strokeWidth =
                        (sSpec.ui && sSpec.ui.ringThickness) || defaultStroke;
                      const radius = (size - strokeWidth) / 2;
                      const cx = size / 2;
                      const cy = size / 2;
                      const circumference = 2 * Math.PI * radius;
                      const dashoffset =
                        circumference * (1 - (loadingValue || 0));
                      return (
                        <Svg
                          width={size}
                          height={size}
                          viewBox={`0 0 ${size} ${size}`}
                        >
                          <Defs>
                            <SvgLinearGradient
                              id={`loaderGrad${index}`}
                              gradientUnits="userSpaceOnUse"
                              x1={0}
                              x2={size}
                              y1={0}
                              y2={size}
                            >
                              <Stop
                                offset="0%"
                                stopColor="#90b855"
                                stopOpacity="1"
                              />
                              <Stop
                                offset="60%"
                                stopColor="#63a96a"
                                stopOpacity="1"
                              />
                              <Stop
                                offset="100%"
                                stopColor="#90b855"
                                stopOpacity="1"
                              />
                            </SvgLinearGradient>
                          </Defs>
                          <Circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            stroke={theme.colors.textSecondary + "55"}
                            strokeWidth={strokeWidth}
                            fill="none"
                          />
                          <Circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            stroke={`url(#loaderGrad${index})`}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${circumference}`}
                            strokeDashoffset={dashoffset}
                            rotation={-90}
                            originX={cx}
                            originY={cy}
                          />
                          <Circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            stroke="#FFFFFF"
                            strokeOpacity={0.06}
                            strokeWidth={Math.max(
                              4,
                              Math.round(strokeWidth * 0.18)
                            )}
                            fill="none"
                            strokeDasharray={`${Math.round(circumference * 0.12)} ${Math.round(
                              circumference
                            )}`}
                            rotation={-100}
                            originX={cx}
                            originY={cy}
                          />
                          <SvgText
                            x={cx}
                            y={cy + 6}
                            fontSize={20}
                            fontWeight="700"
                            fill={theme.colors.text}
                            textAnchor="middle"
                          >
                            {`${loadingPercent}%`}
                          </SvgText>
                        </Svg>
                      );
                    })()}
                  </View>
                  {/* circular analyzer text (if configured) */}
                  {(() => {
                    const cfg = (screens[index] || {}).ui?.circularAnalyzer;
                    if (
                      !cfg ||
                      !Array.isArray(cfg.subtexts) ||
                      cfg.subtexts.length === 0
                    )
                      return null;
                    return (
                      <View style={{ alignItems: "center", marginTop: 12 }}>
                        <Text
                          style={{
                            fontFamily: theme.fonts.family.bold,
                            fontSize: 30,
                            color: theme.colors.text,
                            textAlign: "center",
                          }}
                        >
                          {cfg.mainText || "Calculating"}
                        </Text>
                        <Text
                          key={circularIndex}
                          style={{
                            marginTop: 8,
                            fontFamily: theme.fonts.family.regular,
                            fontSize: 16,
                            color: theme.colors.textSecondary,
                            textAlign: "center",
                          }}
                        >
                          {cfg.subtexts[circularIndex]}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primaryGreen}
                  />
                  <Text
                    style={[
                      styles.loadingText,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.fonts.family.regular,
                      },
                    ]}
                  >
                    {current.subtext}
                  </Text>
                </View>
              )
            ) : null}

            {/* Native port of the rating screen for onboarding id 32 */}
            {(current as any).id === 33 ? (
              <Modal
                visible={true}
                animationType="fade"
                presentationStyle="fullScreen"
                onRequestClose={() => {
                  /* allow hardware back to close via goNext/back behavior if needed */
                }}
              >
                <SafeAreaView
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    padding: 20,
                  }}
                >
                  <DecorativeGreenBackground />
                  <View style={{ flex: 1 }}>
                    <ScrollView
                      contentContainerStyle={{
                        paddingTop: 12,
                        paddingBottom: 160,
                        minHeight: screenHeight,
                      }}
                      showsVerticalScrollIndicator={false}
                      style={{ flex: 1 }}
                    >
                      <View style={[styles.contentWrapper, { flex: 1 }]}>
                        {/* Title row with laurels and stars */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 18,
                            width: "100%",
                          }}
                        >
                          <View style={{ width: 36, height: 56 }} />
                          <Text
                            style={{
                              fontSize: 34,
                              color: "#fff",
                              fontFamily: theme.fonts.family.bold,
                              textAlign: "center",
                            }}
                          >
                            Give us a rating
                          </Text>
                          <View style={{ width: 36, height: 56 }} />
                        </View>

                        {/* Stars */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            marginBottom: 12,
                            width: "100%",
                          }}
                        >
                          {[...Array(5)].map((_, i) => (
                            <MaterialIcons
                              key={i}
                              name={"star"}
                              size={44}
                              color="#fbbf24"
                              style={{ marginHorizontal: 4 }}
                            />
                          ))}
                        </View>

                        <Text
                          style={{
                            color: "rgba(255,255,255,0.9)",
                            textAlign: "center",
                            fontSize: 16,
                            marginBottom: 12,
                            width: "100%",
                          }}
                        >
                          This app was designed for people like you.
                        </Text>

                        {/* Avatars + count */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 12,
                            width: "100%",
                          }}
                        >
                          <View
                            style={{ flexDirection: "row", marginRight: 8 }}
                          >
                            {testimonials.slice(0, 3).map((t, i) => (
                              <View
                                key={i}
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 20,
                                  overflow: "hidden",
                                  marginLeft: i === 0 ? 0 : -8,
                                  borderWidth: 2,
                                  borderColor: "rgba(255,255,255,0.3)",
                                }}
                              >
                                {t && t.avatar ? (
                                  <Image
                                    source={t.avatar}
                                    style={{ width: 40, height: 40 }}
                                  />
                                ) : (
                                  <View
                                    style={{
                                      flex: 1,
                                      backgroundColor: "rgba(255,255,255,0.06)",
                                    }}
                                  />
                                )}
                              </View>
                            ))}
                          </View>
                          <Text style={{ color: "#dfe7da" }}>
                            + 1,000,000 people
                          </Text>
                        </View>

                        {/* Testimonials */}
                        <View style={{ marginBottom: 12, width: "100%" }}>
                          {testimonials.map((t, idx) => (
                            <View
                              key={idx}
                              style={{
                                backgroundColor: "rgba(255,255,255,0.06)",
                                borderRadius: 16,
                                paddingVertical: 18,
                                paddingHorizontal: 14,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.06)",
                                alignSelf: "center",
                                width: "94%",
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  marginBottom: 8,
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <View
                                    style={{
                                      width: 44,
                                      height: 44,
                                      borderRadius: 22,
                                      overflow: "hidden",
                                      marginRight: 8,
                                    }}
                                  >
                                    <Image
                                      source={
                                        t.avatar || testimonials[idx]?.avatar
                                      }
                                      style={{ width: 44, height: 44 }}
                                    />
                                  </View>
                                  <View>
                                    <Text
                                      style={{
                                        color: "#fff",
                                        fontWeight: "600",
                                        fontSize: 16,
                                      }}
                                    >
                                      {t.name}
                                    </Text>
                                    <Text
                                      style={{ color: "#cbd5c4", fontSize: 13 }}
                                    >
                                      @{t.name.split(" ")[0].toLowerCase()}
                                    </Text>
                                  </View>
                                </View>

                                <View style={{ flexDirection: "row" }}>
                                  {[...Array(5)].map((_, i) => (
                                    <MaterialIcons
                                      key={i}
                                      name={"star"}
                                      size={14}
                                      color="#fbbf24"
                                    />
                                  ))}
                                </View>
                              </View>

                              <Text
                                style={{
                                  color: "#e6f0df",
                                  fontSize: 15,
                                  lineHeight: 20,
                                }}
                              >{`"${t.quote}"`}</Text>
                            </View>
                          ))}
                        </View>

                        {/* Next button is pinned to the bottom as a fixed action bar (see below) */}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Fixed bottom action bar for the rating modal */}
                  <View style={styles.bottomActionBar} pointerEvents="box-none">
                    <TouchableOpacity
                      onPress={handleRateNow}
                      style={{ width: "100%", backgroundColor: "transparent" }}
                    >
                      <LinearGradient
                        colors={["#90b855", "#63a96a"]}
                        style={{
                          paddingVertical: 14,
                          borderRadius: 28,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "700" }}>
                          Next
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  {/* Top-left back button rendered last so it's above other modal content */}
                  {(current as any)?.id !== 202 && (
                    <TouchableOpacity
                      accessibilityLabel="Back"
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => {
                        try {
                          if (index > 0) setIndex((i) => Math.max(0, i - 1));
                          else if ((nav as any)?.canGoBack)
                            (nav as any).goBack();
                        } catch {
                          // ignore
                        }
                      }}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 12,
                        zIndex: 999,
                        padding: 8,
                        borderRadius: 22,
                        backgroundColor: "rgba(0,0,0,0.22)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={22}
                        color={"#FFFFFF"}
                      />
                    </TouchableOpacity>
                  )}
                  {/* Pre-prompt removed — rating flow uses native alerts now. */}
                </SafeAreaView>
              </Modal>
            ) : null}

            {/* Pre-prompt handled inside the Modal above; duplicate removed. */}

            {current.type === "analysis" ? (
              <View style={{ height: 12 }} />
            ) : null}

            {current.type === "question" &&
            (current as any).id !== 33 &&
            (current.key === "confidence" ||
              current.input?.type === "slider") ? (
              <View
                style={{
                  alignSelf: "stretch",
                  marginTop: Math.max(24, Math.floor(screenHeight * 0.12)),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    width: "100%",
                    marginBottom: 12,
                  }}
                >
                  {[
                    { icon: "emoticon-sad-outline", value: 1 },
                    { icon: "emoticon-neutral-outline", value: 3 },
                    { icon: "emoticon-happy-outline", value: 5 },
                  ].map((it) => {
                    // bucket continuous slider values into 3 groups:
                    // 1-2 => bucket 1 (low), 3 => bucket 3 (neutral), 4-5 => bucket 5 (high)
                    const rounded =
                      typeof sliderValue === "number"
                        ? Math.round(sliderValue)
                        : null;
                    let bucket: number | null = null;
                    if (rounded !== null) {
                      if (rounded <= 2) bucket = 1;
                      else if (rounded === 3) bucket = 3;
                      else bucket = 5;
                    }
                    const sel = bucket === it.value;
                    return (
                      <TouchableOpacity
                        key={it.value}
                        onPress={() => setSliderValue(it.value)}
                        style={{ alignItems: "center", flex: 1 }}
                      >
                        <MaterialCommunityIcons
                          name={it.icon as any}
                          size={36}
                          color={
                            sel
                              ? theme.colors.primaryGreen
                              : theme.colors.textSecondary
                          }
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View
                  ref={trackRef}
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    const THUMB = thumbSize;
                    try {
                      trackRef.current?.measureInWindow(
                        (
                          x: number,
                          y: number,
                          width: number,
                          _height: number
                        ) => {
                          trackLeft.current = x + 12;
                          trackWidth.current = Math.max(0, width - THUMB - 24);
                          const v =
                            sliderValue ??
                            Math.round(
                              ((current.input?.min ?? 1) +
                                (current.input?.max ?? 5)) /
                                2
                            );
                          const toX = computeXFromValue(v, index);
                          Animated.timing(pan, {
                            toValue: toX,
                            duration: 1,
                            useNativeDriver: false,
                          }).start();
                        }
                      );
                    } catch {
                      trackWidth.current = Math.max(0, w - THUMB);
                      const v =
                        sliderValue ??
                        Math.round(
                          ((current.input?.min ?? 1) +
                            (current.input?.max ?? 5)) /
                            2
                        );
                      const toX = computeXFromValue(v, index);
                      Animated.timing(pan, {
                        toValue: toX,
                        duration: 1,
                        useNativeDriver: false,
                      }).start();
                    }
                  }}
                  style={{
                    marginTop: 12,
                    alignSelf: "stretch",
                    paddingHorizontal: 12,
                  }}
                >
                  <View
                    style={{
                      height: 8,
                      borderRadius: 8,
                      backgroundColor: theme.colors.textSecondary + "18",
                    }}
                  />

                  {/* Animated gradient fill */}
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: -1,
                      height: 10,
                      borderRadius: 8,
                      width: pan.interpolate({
                        inputRange: [0, Math.max(1, trackWidth.current || 1)],
                        outputRange: [0, Math.max(1, trackWidth.current || 1)],
                        extrapolate: "clamp",
                      }) as any,
                      overflow: "hidden",
                    }}
                  >
                    <Animated.View
                      style={{
                        flex: 1,
                        transform: [
                          {
                            translateX: pan.interpolate({
                              inputRange: [
                                0,
                                Math.max(1, trackWidth.current || 1),
                              ],
                              outputRange: [0, Math.max(-8, 8)],
                            }) as any,
                          },
                        ],
                      }}
                    >
                      <LinearGradient
                        colors={[
                          theme.colors.secondaryGreen,
                          theme.colors.primaryGreen,
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{ flex: 1 }}
                      />
                    </Animated.View>
                  </Animated.View>

                  {/* Thumb */}
                  <Animated.View
                    {...(panResponder.current
                      ? panResponder.current.panHandlers
                      : {})}
                    style={{
                      position: "absolute",
                      left: Animated.add(pan, new Animated.Value(12)),
                      top: -(thumbSize / 2) + 4,
                      width: thumbSize,
                      height: thumbSize,
                      borderRadius: thumbSize / 2,
                      justifyContent: "center",
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.12,
                      shadowRadius: 12,
                      elevation: 6,
                    }}
                  >
                    <Animated.View
                      style={{
                        width: thumbSize - 8,
                        height: thumbSize - 8,
                        borderRadius: (thumbSize - 8) / 2,
                        backgroundColor: theme.colors.primaryGreen,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: (thumbSize - 8) / 2,
                          height: (thumbSize - 8) / 2,
                          borderRadius: (thumbSize - 8) / 4,
                          backgroundColor: "#fff",
                        }}
                      />
                    </Animated.View>
                  </Animated.View>

                  {/* numeric steps (small) */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 26,
                    }}
                  >
                    {Array.from(
                      {
                        length:
                          (current.input.max || 5) -
                          (current.input.min || 1) +
                          1,
                      },
                      (_, i) => (current.input.min || 1) + i
                    ).map((v: number) => (
                      <Text
                        key={v}
                        style={{
                          color: theme.colors.textSecondary,
                          fontFamily: theme.fonts.family.regular,
                          fontSize: 13,
                        }}
                      >
                        {v}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            ) : null}

            {current.type === "analysis" ? (
              <View
                style={[
                  analyticsStyles.analysisBox,
                  { height: analysisBoxHeight },
                ]}
              >
                <View
                  style={[
                    analyticsStyles.barRow,
                    { alignItems: "flex-end", justifyContent: "center" },
                  ]}
                >
                  <View style={{ alignItems: "center", marginHorizontal: 12 }}>
                    <Text
                      style={[
                        analyticsStyles.barValueText,
                        { color: theme.colors.text, marginBottom: 4 },
                      ]}
                    >{`52%`}</Text>
                    <View
                      style={[
                        analyticsStyles.bar,
                        {
                          backgroundColor: "#E53935",
                          height: analysisRedHeight,
                          width: 68,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        analyticsStyles.barLabelText,
                        { color: theme.colors.textSecondary, marginTop: 4 },
                      ]}
                    >
                      You score
                    </Text>
                  </View>

                  <View style={{ alignItems: "center", marginHorizontal: 12 }}>
                    <Text
                      style={[
                        analyticsStyles.barValueText,
                        { color: theme.colors.text, marginBottom: 4 },
                      ]}
                    >{`13%`}</Text>
                    <View
                      style={[
                        analyticsStyles.bar,
                        {
                          backgroundColor: "#43A047",
                          height: analysisGreenHeight,
                          width: 68,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        analyticsStyles.barLabelText,
                        { color: theme.colors.textSecondary, marginTop: 4 },
                      ]}
                    >
                      Average
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            {current.type === "analysis" ? (
              <View style={{ height: 72 }} />
            ) : null}

            {/* Risk summary row for the analysis screen */}
            {current.type === "analysis" ? (
              <View
                style={[
                  analyticsStyles.footer,
                  {
                    marginTop: 0,
                    marginBottom: Math.max(80, Math.floor(screenHeight * 0.12)),
                  },
                ]}
              >
                <View style={analyticsStyles.footerRow}>
                  <Text
                    style={[
                      analyticsStyles.footerText,
                      { color: theme.colors.text },
                    ]}
                  >
                    <Text style={analyticsStyles.footerPercent}>39%</Text>{" "}
                    higher dependency on smoking
                  </Text>
                  <MaterialCommunityIcons
                    name="emoticon-sad-outline"
                    size={18}
                    color="#E53935"
                    style={{ marginLeft: 8 }}
                  />
                </View>

                <Text
                  style={[
                    analyticsStyles.footerSubtext,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  This result is an indication only, not medical diagnosis
                </Text>
              </View>
            ) : null}

            {showBar ? (
              <View
                style={{
                  alignSelf: "stretch",
                  width: chartWidth,
                  // pull the chart outward to negate parent padding so x-axis touches device frame
                  marginLeft: -horizontalOffset,
                  marginRight: -horizontalOffset,
                  alignItems: "flex-start",
                  // create more space between header/subtext and chart
                  marginTop: 20,
                }}
              >
                <BarChart
                  data={chartData}
                  width={chartWidth}
                  height={chartHeight}
                  barWidth={barWidthComputed}
                  spacing={finalSpacing}
                  roundedTop
                  barBorderRadius={1}
                  isAnimated
                  animationDuration={600}
                  showVerticalLines={false}
                  noOfSections={yAxisSections}
                  yAxisLabelTexts={yAxisLabelTexts}
                  yAxisOffset={0}
                  maxValue={Math.max(1, chartBaseline)}
                  showGradient={true}
                  gradientColor={theme.colors.primaryGreen}
                  frontColor={theme.colors.primaryGreen}
                  yAxisTextStyle={{
                    color: isDarkTheme
                      ? theme.colors.text
                      : theme.colors.textSecondary,
                    fontFamily: theme.fonts.family.regular,
                    fontSize: screenWidth > 420 ? 13 : 12,
                  }}
                  yAxisColor={
                    isDarkTheme
                      ? theme.colors.textSecondary
                      : theme.colors.textSecondary
                  }
                  xAxisLabelTextStyle={{
                    color: theme.colors.textSecondary,
                    fontSize:
                      screenWidth < 360 ? 10 : screenWidth > 420 ? 13 : 12,
                    fontFamily: theme.fonts.family.regular,
                  }}
                  xAxisColor={theme.colors.textSecondary}
                  xAxisTextNumberOfLines={1}
                  rotateLabel={screenWidth < 420}
                  labelsExtraHeight={
                    screenWidth < 360 ? 28 : screenWidth > 420 ? 56 : 44
                  }
                  initialSpacing={initialSpacing}
                  barInnerComponent={(item: any) => {
                    if (
                      !item ||
                      typeof item.value !== "number" ||
                      item.value === 0
                    )
                      return null;
                    if (barWidthComputed < 12) return null;
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
                            color: isDarkTheme
                              ? "#000"
                              : "rgba(255,255,255,0.95)",
                            fontSize: Math.min(
                              screenWidth > 420 ? 18 : 16,
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
                />
                {/* arrow overlay: weekly reduction polyline with arrowhead */}
                {chartData && chartData.length > 1 ? (
                  <Svg
                    width={chartWidth}
                    height={chartHeight}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      pointerEvents: "none",
                    }}
                  >
                    {
                      // compute points for the polyline: center-top of each bar
                    }
                    {(() => {
                      try {
                        const maxVal = Math.max(1, chartBaseline);
                        const lift = Math.max(
                          8,
                          Math.floor(barWidthComputed * 0.6)
                        );
                        const pts = chartData.map((d: any, i: number) => {
                          const x =
                            initialSpacing +
                            i * (barWidthComputed + finalSpacing) +
                            barWidthComputed / 2;
                          const barH = Math.max(
                            0,
                            (d.value / maxVal) * chartHeight
                          );
                          // lift the line above the bar top so it visually sits above bars
                          const y = Math.max(6, chartHeight - barH - lift);
                          return { x, y };
                        });

                        const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");

                        // arrow head at the last segment
                        const a = pts[pts.length - 1];
                        const b = pts[pts.length - 2];
                        const dx = a.x - b.x;
                        const dy = a.y - b.y;
                        const len = Math.hypot(dx, dy) || 1;
                        const ux = dx / len;
                        const uy = dy / len;
                        const size = Math.min(
                          18,
                          Math.max(8, Math.floor(barWidthComputed))
                        );
                        const baseX = a.x - ux * size;
                        const baseY = a.y - uy * size;
                        const perpX = -uy;
                        const perpY = ux;
                        const half = size * 0.5;
                        const p1 = `${a.x},${a.y}`;
                        const p2 = `${baseX + perpX * half},${
                          baseY + perpY * half
                        }`;
                        const p3 = `${baseX - perpX * half},${
                          baseY - perpY * half
                        }`;

                        return (
                          <>
                            <Polyline
                              points={poly}
                              fill="none"
                              stroke={theme.colors.primaryGreen}
                              strokeWidth={3}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity={0.95}
                            />
                            <Polygon
                              points={`${p1} ${p2} ${p3}`}
                              fill={theme.colors.primaryGreen}
                              opacity={0.95}
                            />
                          </>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                  </Svg>
                ) : null}
              </View>
            ) : showSummary ? (
              <View style={{ width: "100%", marginTop: 8 }}>
                <View
                  style={[
                    styles.summaryContainer,
                    {
                      borderColor: theme.colors.textSecondary + "22",
                      backgroundColor: theme.colors.primaryBackground + "03",
                    },
                  ]}
                >
                  <View style={styles.summaryGrid}>
                    {(summaryCards || []).map((c: any, i: number) => {
                      const key = c.key || "";
                      const label = c.label || c.key || "";
                      const keyIconMap: Record<string, string> = {
                        yearsSmoking: "calendar-clock",
                        triggers: "bell-outline",
                        pastAttempts: "history",
                        quitReason: "heart",
                      };
                      const suggested =
                        keyIconMap[key] || c.icon || "information-outline";
                      const value = formatCardValue(key);
                      return (
                        <View
                          key={"sum-" + i}
                          style={[
                            styles.summaryCard,
                            styles.summaryCardElevated,
                            {
                              backgroundColor:
                                theme.colors.primaryBackground + "04",
                              paddingVertical: 6,
                              paddingHorizontal: 6,
                              borderWidth: 1,
                              borderColor: theme.colors.textSecondary + "22",
                            },
                          ]}
                        >
                          <View style={styles.summaryTopRow}>
                            <View
                              style={[
                                styles.iconCircle,
                                {
                                  backgroundColor:
                                    theme.colors.primaryGreen + "22",
                                },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name={suggested}
                                size={18}
                                color={theme.colors.primaryGreen}
                              />
                            </View>
                            <Text
                              style={[
                                styles.summaryLabel,
                                { color: theme.colors.textSecondary },
                              ]}
                            >
                              {label}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.summaryValue,
                              { color: theme.colors.text },
                            ]}
                          >
                            {value}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {renderInsight() ? (
                  <Text
                    style={[
                      styles.sub,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.fonts.family.regular,
                      },
                      !isWelcome && {
                        fontSize: 16,
                        textAlign: "left",
                        alignSelf: "stretch",
                      },
                      isMatchGender && {
                        fontSize: theme.fonts.size.medium * 1.1,
                        lineHeight: 20,
                        textAlign: "left",
                        alignSelf: "stretch",
                      },
                      {
                        marginTop: isCompact ? 4 : 8,
                        marginBottom: isCompact ? 8 : 0,
                      },
                    ]}
                  >
                    {renderInsight()}
                  </Text>
                ) : null}

                {/* segmented confidence control for summary area removed (moved to question area) */}

                {(current as any).ui?.badge?.text ? (
                  <Text
                    style={{
                      marginTop: 14,
                      color: theme.colors.primaryGreen,
                      fontWeight: "700",
                    }}
                  >
                    {(current as any).ui?.badge?.text}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/* twoLineGraph: render custom two-line SVG chart when specified in spec */}
            {(current as any).ui?.twoLineGraph ? (
              <View
                style={{
                  alignSelf: "stretch",
                  width: chartWidth,
                  marginLeft: -horizontalOffset,
                  marginRight: -horizontalOffset,
                  marginTop: [31, 32, 33, 103].includes((current as any)?.id)
                    ? 28
                    : 24,
                  marginBottom: [31, 32, 33, 103].includes((current as any)?.id)
                    ? 20
                    : 12,
                }}
              >
                {(() => {
                  const cfg = (current as any).ui.twoLineGraph || {};
                  const puffLabel = "PuffNoMore Method";
                  const willLabel = "Willpower Attempts";
                  const puffColor =
                    cfg.rightColor || cfg.leftColor || "#90b855";
                  const willColor =
                    cfg.leftColor || cfg.rightColor || "#E53935";
                  return (
                    <View
                      style={{
                        width: "100%",
                        paddingHorizontal: 12,
                        marginBottom: 8,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            backgroundColor: puffColor,
                            marginRight: 8,
                          }}
                        />
                        <Text
                          style={{
                            color:
                              isReductionSpecial || isCommitmentBg
                                ? "rgba(255,255,255,0.98)"
                                : theme.colors.text,
                            fontFamily: theme.fonts.family.bold,
                          }}
                        >
                          {puffLabel}
                        </Text>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            backgroundColor: willColor,
                            marginRight: 8,
                          }}
                        />
                        <Text
                          style={{
                            color:
                              isReductionSpecial || isCommitmentBg
                                ? "rgba(255,255,255,0.98)"
                                : theme.colors.text,
                            fontFamily: theme.fonts.family.bold,
                          }}
                        >
                          {willLabel}
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                <TwoLineGraph
                  config={(current as any).ui.twoLineGraph}
                  width={Math.min(chartWidth, 920)}
                  height={
                    [31, 32, 33, 103].includes((current as any)?.id) ? 300 : 260
                  }
                  isOnboarding={isReductionSpecial || isCommitmentBg}
                />
              </View>
            ) : null}

            {/* Dominant explanatory text outside the graph */}
            {(current as any).ui?.twoLineGraph ? (
              <View
                style={{
                  alignSelf: "stretch",
                  width: chartWidth,
                  marginLeft: -horizontalOffset,
                  marginRight: -horizontalOffset,
                  paddingHorizontal: 16,
                  // move caption slightly higher on screen 31 to avoid bottom overlap
                  marginTop:
                    (current as any)?.id === 31 ? (isCompact ? 0 : 6) : 32,
                  // ensure caption doesn't get overlapped by the fixed bottom action bar
                  marginBottom:
                    (current as any)?.id === 31 ? captionBottomReserve : 18,
                }}
              >
                {(() => {
                  const cfg = (current as any).ui?.twoLineGraph || {};
                  if (!cfg.caption) return null;
                  const isSpecial = [31, 32, 33, 103].includes(
                    (current as any)?.id
                  );
                  const captionBg = isSpecial
                    ? isDarkTheme
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.03)"
                    : "transparent";
                  return (
                    <View
                      style={{
                        backgroundColor: captionBg,
                        paddingVertical: isSpecial ? (isCompact ? 10 : 16) : 0,
                        paddingHorizontal: isSpecial
                          ? isCompact
                            ? 10
                            : 12
                          : 0,
                        borderRadius: isSpecial ? 12 : 0,
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          color:
                            isReductionSpecial || isCommitmentBg
                              ? "rgba(255,255,255,0.98)"
                              : theme.colors.text,
                          fontSize: isSpecial ? (isCompact ? 14 : 17) : 18,
                          lineHeight: isCompact ? 20 : 24,
                          fontFamily: theme.fonts.family.regular,
                          fontWeight: "400",
                          opacity: 0.98,
                        }}
                      >
                        {cfg.caption}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            ) : null}

            <View style={styles.spacer} />
            {/* Render options input as stacked buttons for questions with type=options */}
            {current.type === "question" &&
            (current as any).id !== 33 &&
            current.input?.type === "options" ? (
              <ScrollView
                contentContainerStyle={[
                  styles.optionList,
                  {
                    paddingBottom: Math.max(
                      140,
                      Math.floor(screenHeight * 0.18)
                    ),
                  },
                ]}
                showsVerticalScrollIndicator={false}
              >
                {(current as any).ui?.category
                  ? (() => {
                      const headerColor =
                        (current as any)?.ui?.optionsStyle?.textColor ||
                        theme.colors.textSecondary;
                      return (
                        <Text
                          style={[
                            styles.optionGroupHeader,
                            { color: headerColor },
                            {
                              fontFamily: theme.fonts.family.bold,
                              fontSize: 14,
                            },
                          ]}
                        >
                          {(current as any).ui.category}
                        </Text>
                      );
                    })()
                  : null}
                {(current.input.options || []).map((opt: any) => {
                  const label = typeof opt === "string" ? opt : opt.label;
                  const icon = typeof opt === "string" ? null : opt.icon;
                  const isSelected = selectedOption === label;
                  const background = isSelected
                    ? theme.colors.primaryGreen
                    : "transparent";
                  const customOptionText = (current as any)?.ui?.optionsStyle
                    ?.textColor;
                  const isCustomTextWhite =
                    (customOptionText || "")
                      .toString()
                      .toLowerCase()
                      .replace(/\s/g, "") === "#ffffff" ||
                    (customOptionText || "").toString().toLowerCase() ===
                      "white" ||
                    (customOptionText || "")
                      .toString()
                      .toLowerCase()
                      .startsWith("rgba(255,255,255");
                  const border = isSelected
                    ? "transparent"
                    : isCustomTextWhite || isCommitmentBg || isReductionSpecial
                      ? "rgba(255,255,255,0.12)"
                      : theme.colors.textSecondary + "30";
                  const textColor = isSelected
                    ? "#fff"
                    : customOptionText || theme.colors.text;
                  return (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.primaryButtonFull,
                        styles.optionButton,
                        {
                          backgroundColor: background,
                          borderColor: border,
                        },
                      ]}
                      onPress={() => setSelectedOption(label)}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        {/* optional leading icon */}
                        {icon ? (
                          icon.library === "MaterialCommunityIcons" ? (
                            isValidMCIcon(icon.name) ? (
                              <MaterialCommunityIcons
                                name={icon.name}
                                size={20}
                                color={
                                  isSelected
                                    ? "#fff"
                                    : isCustomTextWhite ||
                                        isCommitmentBg ||
                                        isReductionSpecial
                                      ? "rgba(255,255,255,0.7)"
                                      : theme.colors.textSecondary
                                }
                                style={{ marginRight: 12 }}
                              />
                            ) : (
                              <MaterialIcons
                                name="help-outline"
                                size={20}
                                color={
                                  isSelected
                                    ? "#fff"
                                    : theme.colors.textSecondary
                                }
                                style={{ marginRight: 12 }}
                              />
                            )
                          ) : icon.library === "MaterialIcons" ? (
                            <MaterialIcons
                              name={icon.name}
                              size={20}
                              color={
                                isSelected
                                  ? "#fff"
                                  : isCustomTextWhite ||
                                      isCommitmentBg ||
                                      isReductionSpecial
                                    ? "rgba(255,255,255,0.7)"
                                    : theme.colors.textSecondary
                              }
                              style={{ marginRight: 12 }}
                            />
                          ) : null
                        ) : null}

                        {/* label takes remaining space */}
                        <Text
                          style={[
                            styles.primaryButtonText,
                            {
                              color: textColor,
                              fontFamily: theme.fonts.family.bold,
                              textAlign: "left",
                              flex: 1,
                            },
                          ]}
                        >
                          {label}
                        </Text>

                        {/* radio on the right */}
                        <MaterialIcons
                          name={
                            isSelected
                              ? "radio-button-checked"
                              : "radio-button-unchecked"
                          }
                          size={22}
                          color={
                            isSelected
                              ? "#fff"
                              : isCustomTextWhite ||
                                  isCommitmentBg ||
                                  isReductionSpecial
                                ? "rgba(255,255,255,0.7)"
                                : theme.colors.textSecondary
                          }
                          style={{ marginLeft: 12 }}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}

            {/* Multiselect: allow toggling multiple options */}
            {current.type === "question" &&
            (current as any).id !== 33 &&
            current.input?.type === "multiselect" ? (
              <ScrollView
                contentContainerStyle={[
                  styles.optionList,
                  {
                    paddingBottom: Math.max(
                      140,
                      Math.floor(screenHeight * 0.18)
                    ),
                  },
                ]}
                showsVerticalScrollIndicator={false}
              >
                {(current as any).ui?.category
                  ? (() => {
                      const headerColor =
                        (current as any)?.ui?.optionsStyle?.textColor ||
                        theme.colors.textSecondary;
                      return (
                        <Text
                          style={[
                            styles.optionGroupHeader,
                            { color: headerColor },
                            {
                              fontFamily: theme.fonts.family.bold,
                              fontSize: 14,
                            },
                          ]}
                        >
                          {(current as any).ui.category}
                        </Text>
                      );
                    })()
                  : null}
                {(current.input.options || []).map((opt: any) => {
                  const label = typeof opt === "string" ? opt : opt.label;
                  const icon = typeof opt === "string" ? null : opt.icon;
                  const isSelected = selectedMulti.includes(label);
                  const background = isSelected
                    ? theme.colors.primaryGreen
                    : "transparent";
                  const customOptionText = (current as any)?.ui?.optionsStyle
                    ?.textColor;
                  const isCustomTextWhite =
                    (customOptionText || "")
                      .toString()
                      .toLowerCase()
                      .replace(/\s/g, "") === "#ffffff" ||
                    (customOptionText || "").toString().toLowerCase() ===
                      "white" ||
                    (customOptionText || "")
                      .toString()
                      .toLowerCase()
                      .startsWith("rgba(255,255,255");
                  const border = isSelected
                    ? "transparent"
                    : isCustomTextWhite || isCommitmentBg || isReductionSpecial
                      ? "rgba(255,255,255,0.12)"
                      : theme.colors.textSecondary + "30";
                  const textColor = isSelected
                    ? "#fff"
                    : customOptionText || theme.colors.text;
                  return (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.primaryButtonFull,
                        styles.optionButton,
                        {
                          backgroundColor: background,
                          borderColor: border,
                        },
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedMulti((s) => s.filter((x) => x !== label));
                        } else {
                          setSelectedMulti((s) => [...s, label]);
                        }
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        {/* optional leading icon */}
                        {icon ? (
                          icon.library === "MaterialCommunityIcons" ? (
                            isValidMCIcon(icon.name) ? (
                              <MaterialCommunityIcons
                                name={icon.name}
                                size={18}
                                color={
                                  isSelected
                                    ? "#fff"
                                    : isCustomTextWhite ||
                                        isCommitmentBg ||
                                        isReductionSpecial
                                      ? "rgba(255,255,255,0.7)"
                                      : theme.colors.textSecondary
                                }
                                style={{ marginRight: 12 }}
                              />
                            ) : (
                              <MaterialIcons
                                name="help-outline"
                                size={18}
                                color={
                                  isSelected
                                    ? "#fff"
                                    : isCustomTextWhite ||
                                        isCommitmentBg ||
                                        isReductionSpecial
                                      ? "rgba(255,255,255,0.7)"
                                      : theme.colors.textSecondary
                                }
                                style={{ marginRight: 12 }}
                              />
                            )
                          ) : icon.library === "MaterialIcons" ? (
                            <MaterialIcons
                              name={icon.name}
                              size={18}
                              color={
                                isSelected ? "#fff" : theme.colors.textSecondary
                              }
                              style={{ marginRight: 12 }}
                            />
                          ) : null
                        ) : null}

                        {/* label takes remaining space */}
                        <Text
                          style={[
                            styles.primaryButtonText,
                            {
                              color: textColor,
                              fontFamily: theme.fonts.family.bold,
                              textAlign: "left",
                              flex: 1,
                            },
                          ]}
                        >
                          {label}
                        </Text>

                        {/* checkbox on the right */}
                        <MaterialCommunityIcons
                          name={
                            isSelected
                              ? "checkbox-marked-circle"
                              : "checkbox-blank-circle-outline"
                          }
                          size={20}
                          color={
                            isSelected
                              ? "#fff"
                              : isCustomTextWhite ||
                                  isCommitmentBg ||
                                  isReductionSpecial
                                ? "rgba(255,255,255,0.7)"
                                : theme.colors.textSecondary
                          }
                          style={{ marginLeft: 12 }}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}

            {current.type === "question" &&
            (current as any).id !== 33 &&
            current.input?.type === "number" ? (
              <View style={{ alignSelf: "stretch", marginTop: 18 }}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.colors.text,
                      borderColor: theme.colors.textSecondary + "20",
                      backgroundColor: theme.colors.textSecondary + "04",
                    },
                  ]}
                  placeholder={current.input?.placeholder || ""}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={numberValue !== null ? String(numberValue) : ""}
                  onChangeText={(t) => {
                    const parsed =
                      t.trim() === ""
                        ? null
                        : Number(t.replace(/[^0-9.-]/g, ""));
                    setNumberValue(parsed as any);
                  }}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            ) : null}

            {current.type === "question" &&
            (current as any).id !== 33 &&
            current.input?.type === "text" ? (
              <View style={{ alignSelf: "stretch", marginTop: 18 }}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.colors.text,
                      borderColor: theme.colors.textSecondary + "20",
                      backgroundColor: theme.colors.textSecondary + "06",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.06,
                      shadowRadius: 8,
                      elevation: 3,
                    },
                  ]}
                  placeholder={current.input?.placeholder || ""}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={textValue}
                  onChangeText={setTextValue}
                  autoFocus={true}
                  returnKeyType="done"
                />
              </View>
            ) : null}
          </View>

          {/* Welcome: show Start Quiz in the content area; other screens: fixed bottom action bar */}
          {isWelcome && (
            <View
              style={{
                alignSelf: "stretch",
                marginTop: 18,
                paddingHorizontal: 20,
              }}
            >
              <LinearGradient
                colors={[
                  theme.colors.primaryGreen,
                  theme.colors.secondaryGreen,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 28, padding: 1 }}
              >
                <PrimaryButton
                  fullWidth={true}
                  containerStyle={{ backgroundColor: "transparent" }}
                  label={"Start Quiz"}
                  onPress={goNext}
                  showChevron={true}
                />
              </LinearGradient>
            </View>
          )}

          {isWelcome ? (
            <View style={styles.welcomeSignin}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={[
                    styles.signinText,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.fonts.family.regular,
                      fontSize: 13,
                    },
                  ]}
                >
                  Already have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      (nav as any).navigate && (nav as any).navigate("SignIn");
                    } catch (err) {
                      console.log("Sign in pressed", err);
                    }
                  }}
                  style={{ marginLeft: 6 }}
                >
                  <Text
                    style={[
                      styles.signinLink,
                      {
                        color: theme.colors.primaryGreen,
                        fontFamily: theme.fonts.family.bold,
                        fontSize: 13,
                      },
                    ]}
                  >
                    Sign in
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          {/* Bottom action bar for non-welcome screens (Next button) */}
          {(() => {
            const isAnalyzerLoading =
              (current as any)?.type === "loading" &&
              (current as any)?.id === 14;
            // Never show the bottom Next action for the analyzer/loading screen (id:14)
            const showBottomAction =
              !isWelcome &&
              (current as any)?.id !== 14 &&
              (!isAnalyzerLoading || loadingPercent >= 100);
            if (!showBottomAction) return null;
            return (
              <View style={styles.bottomActionBar}>
                {(() => {
                  const isScare = (current as any)?.type === "scare";
                  // show dots only for the targeted scare screens (including id 21)
                  const scareDotsIds = [18, 19, 20, 21];
                  const showDots = scareDotsIds.includes((current as any)?.id);

                  return (
                    <>
                      {showDots ? (
                        <View
                          style={styles.progressDotsContainer}
                          pointerEvents="none"
                        >
                          {scareDotsIds.map((id, i) => {
                            const active =
                              i === scareDotsIds.indexOf((current as any)?.id);
                            const anim = dotAnimsRef.current[i];
                            const scale = anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.6],
                            }) as any;
                            const translateY = anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -6],
                            }) as any;
                            const opacity = anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.6, 1],
                            }) as any;
                            return (
                              <Animated.View
                                key={id}
                                style={[
                                  styles.progressDot,
                                  {
                                    transform: [{ scale }, { translateY }],
                                    opacity,
                                    backgroundColor: active
                                      ? "#FFFFFF"
                                      : "rgba(255,255,255,0.36)",
                                  },
                                  active && styles.progressDotElevated,
                                ]}
                              />
                            );
                          })}
                        </View>
                      ) : null}
                      {(current as any)?.ui?.actionButton?.style ===
                        "greenGradient" ||
                      (current as any)?.type === "commitment" ||
                      inCommitmentRange ? (
                        <LinearGradient
                          colors={["#90b855", "#63a96a"]}
                          style={{
                            borderRadius: 28,
                            padding: 1,
                            width: "100%",
                          }}
                        >
                          <PrimaryButton
                            fullWidth={!isScare}
                            label={actionLabel}
                            onPress={goNext}
                            showChevron={(current as any)?.id === 102}
                            containerStyle={
                              isScare
                                ? {
                                    backgroundColor: "#ffffff",
                                    width: 220,
                                    alignSelf: "center",
                                  }
                                : { backgroundColor: "transparent" }
                            }
                            // force white text on the green gradient when used
                            textColor={isScare ? "#000000" : "#FFFFFF"}
                          />
                        </LinearGradient>
                      ) : (
                        <PrimaryButton
                          fullWidth={!isScare}
                          label={actionLabel}
                          onPress={goNext}
                          showChevron={(current as any)?.id === 102}
                          containerStyle={
                            isScare
                              ? {
                                  backgroundColor: "#ffffff",
                                  width: 220,
                                  alignSelf: "center",
                                }
                              : undefined
                          }
                          // use black text on white background for visibility
                          textColor={isScare ? "#000000" : undefined}
                        />
                      )}
                      {/* Small footer copy under the bottom action for screen 204 */}
                      {(current as any)?.id === 204 ? (
                        <View style={{ alignItems: "center", marginTop: 10 }}>
                          <Text
                            style={{
                              color: isCommitmentBg
                                ? "#ffffff"
                                : theme.colors.textSecondary,
                              fontSize: 12,
                              fontWeight: "500",
                              marginTop: 6,
                            }}
                          >
                            Purchase appears Discretely
                          </Text>
                          <Text
                            style={{
                              color: isCommitmentBg
                                ? "#ffffff"
                                : theme.colors.textSecondary,
                              fontSize: 12,
                              marginTop: 2,
                            }}
                          >
                            Cancel Anytime ✅ Finally Quit Porn 🛡️
                          </Text>
                        </View>
                      ) : null}
                    </>
                  );
                })()}
              </View>
            );
          })()}
        </>
      )}
    </Animated.View>
  );
};

const PrimaryButton: React.FC<{
  label: string;
  onPress: () => void;
  fullWidth?: boolean;
  containerStyle?: any;
  showChevron?: boolean;
  textColor?: string;
}> = ({
  label,
  onPress,
  fullWidth = false,
  containerStyle,
  showChevron = true,
  textColor,
}) => {
  const theme = useTheme();
  const isDark =
    theme.colors.primaryBackground === darkTheme.colors.primaryBackground;
  const buttonTextColor = textColor ?? (isDark ? theme.colors.text : "#FFFFFF");
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.primaryButton,
        { backgroundColor: theme.colors.primaryGreen },
        fullWidth && styles.primaryButtonFull,
        containerStyle,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={[
            styles.primaryButtonText,
            { color: buttonTextColor, fontFamily: theme.fonts.family.bold },
          ]}
        >
          {label}
        </Text>
        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={buttonTextColor}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    marginTop: 100,
    marginHorizontal: 12,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.02)",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  sub: { fontSize: 15, textAlign: "center", color: "#888" },
  spacer: { height: 20 },
  progress: { position: "absolute", top: 40, left: 20 },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonFull: {
    alignSelf: "stretch",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.25,
  },
  loadingRow: { marginTop: 24, alignItems: "center" },
  loadingText: { marginTop: 12 },
  optionList: {
    marginTop: 22,
    alignSelf: "stretch",
    alignItems: "stretch",
    width: "100%",
    paddingBottom: 112,
  },
  optionGroupHeader: {
    alignSelf: "stretch",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  optionButton: {
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    marginBottom: 16,
    alignItems: "flex-start",
    width: "100%",
  },

  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  // slider-specific styles
  sliderTrackPadding: { paddingHorizontal: 12 },
  optionButtonSelected: {
    borderColor: "transparent",
  },
  optionButtonText: { fontSize: 18, color: "#222" },
  optionButtonTextSelected: { color: "#fff", fontWeight: "700" },
  textInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 18,
    backgroundColor: "transparent",
    width: "100%",
    marginBottom: 14,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 760,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  analysisBox: { marginTop: 24, width: "100%" },
  barRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  bar: { width: 80, borderRadius: 6 },
  barValueText: { fontSize: 14, fontWeight: "700" },
  barLabelText: { fontSize: 13 },
  topProgressContainer: {
    paddingHorizontal: 12,
    marginTop: 8,
    alignItems: "center",
  },
  progressTrack: {
    width: "100%",
    maxWidth: 900,
    height: 6,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6 },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    paddingTop: 6,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  smallHeaderRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 8,
    position: "relative",
    paddingHorizontal: 12,
  },
  smallHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  smallHeaderBack: {
    position: "absolute",
    left: 12,
    padding: 6,
    zIndex: 30,
  },
  headerBackButton: {
    // placed inline in header row
    padding: 6,
    marginRight: 12,
    zIndex: 20,
  },
  headerBackButtonRight: {
    // right-side back button
    padding: 6,
    marginLeft: 12,
    zIndex: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 0,
  },
  progressTrackAbsolute: {
    position: "absolute",
    height: 6,
    borderRadius: 6,
    overflow: "hidden",
    alignSelf: "stretch",
    maxWidth: 900,
  },
  dashContainer: {
    width: "70%",
    maxWidth: 420,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 12,
    marginTop: 0,
  },
  dash: { width: 18, height: 6, borderRadius: 3, marginHorizontal: 4 },
  bottomSignin: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 12,
    alignItems: "center",
  },

  bottomActionBar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 12,
    alignItems: "center",
    zIndex: 30,
  },

  progressDotsContainer: {
    position: "absolute",
    top: -36,
    alignSelf: "center",
    flexDirection: "row",
    zIndex: 40,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    marginHorizontal: 6,
    backgroundColor: "rgba(255,255,255,0.36)",
  },
  progressDotActive: {
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },

  progressDotElevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  scareHeader: {
    position: "absolute",
    top: 26,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 60,
  },
  scareHeaderLeft: {
    position: "absolute",
    left: 18,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scareLogoText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  graphContainer: { width: "100%", alignItems: "center", marginTop: 4 },
  graphArea: {
    width: "100%",
    height: 200,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#222",
    transform: [{ translateX: -4 }, { translateY: -4 }],
  },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 8,
  },
  legend: { fontSize: 13 },

  welcomeCard: {
    width: "100%",
    maxWidth: 760,
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 32,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
    marginBottom: 16,
  },
  cardless: {
    marginTop: 12,
    marginHorizontal: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  welcomeSignin: {
    marginTop: 18,
    alignSelf: "stretch",
    alignItems: "center",
    paddingBottom: 12,
    opacity: 0.9,
  },
  diagonalGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  bgAccentLarge: {
    position: "absolute",
    width: 560,
    height: 560,
    borderRadius: 280,
    top: -120,
    left: -160,
    transform: [{ scale: 1.05 }],
  },
  welcomeContainer: {
    marginTop: 12,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  summaryGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  summaryContainer: {
    width: "100%",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 12,
  },
  summaryCard: {
    width: "48%",
    padding: 8,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  summaryCardElevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  summaryLabel: { fontSize: 12, textAlign: "left" },
  summaryValue: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    textAlign: "left",
    alignSelf: "stretch",
  },
  signinText: { fontSize: 13 },
  signinLink: { fontFamily: "Inter_700Bold", fontSize: 13 },
  bgCircleLarge: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -60,
    right: -80,
  },
  bgCircleSmall: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: 80,
    left: -40,
  },
  // background visuals removed
});

// Analytics-specific styles kept separate so the analysis screen can be
// restyled without affecting other onboarding screens.
const analyticsStyles = StyleSheet.create({
  analysisBox: { marginTop: 24, width: "100%" },
  barRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  bar: { width: 80, borderRadius: 6 },
  barValueText: { fontSize: 14, fontWeight: "700" },
  barLabelText: { fontSize: 13 },
  footer: {
    alignSelf: "stretch",
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  footerText: { fontSize: 16, fontFamily: "System", fontWeight: "700" },
  footerPercent: { color: "#E53935", fontWeight: "900" },
  footerSubtext: { fontSize: 12, textAlign: "center" },
});

export default OnboardingFlow;
