import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import animations from "../onboarding/animationIndex";
import { useTheme } from "../context/ThemeContext";
import { darkTheme } from "../theme/theme";

const OnboardingLottie: React.FC<{ animationKey?: string; style?: any }> = ({
  animationKey,
  style,
}) => {
  if (!animationKey) return null;
  const theme = useTheme();
  const isDarkTheme =
    (theme.colors.primaryBackground || "").toLowerCase() ===
    (darkTheme.colors.primaryBackground || "").toLowerCase();

  // Allow an alternate dark-mode animation mapping. Look for common suffixes
  // like `KeyDark`/`Key_dark`/`Key-dark` in the animations map and prefer
  // them when the app is in dark mode.
  let src = (animations as any)[animationKey];
  let selectedKey = animationKey;
  if (isDarkTheme) {
    const darkCandidates = [
      animationKey + "Dark",
      animationKey + "_dark",
      animationKey + "-dark",
    ];
    for (const k of darkCandidates) {
      if ((animations as any)[k]) {
        src = (animations as any)[k];
        selectedKey = k;
        break;
      }
    }
  }
  if (!src) return null;
  // If the selected source looks like a dotLottie manifest or doesn't contain
  // Lottie layers/assets, fall back to the light animation so something shows.
  const looksIncomplete =
    src &&
    typeof src === "object" &&
    !src.layers &&
    !src.assets &&
    src.animations;
  if (looksIncomplete) {
    const fallback = (animations as any)[animationKey];
    if (fallback && fallback !== src) {
      console.warn(
        "OnboardingLottie: selected dark asset looks incomplete — falling back to light animation",
        selectedKey
      );
      src = fallback;
      selectedKey = animationKey;
    }
  }

  // Debug: log which animation was chosen and theme state.
  try {
    console.log(
      `OnboardingLottie: animationKey=${animationKey} selectedKey=${selectedKey} isDark=${isDarkTheme} mappingExists=${!!(
        animations as any
      )[selectedKey]} srcType=${typeof src}`
    );
  } catch {}

  // Allow callers to pass desired lottie size via `lottieWidth` / `lottieHeight`.
  // Treat the remaining style props (margins, alignSelf, etc.) as container
  // extras so callers can position the animation without accidentally
  // overwriting the Lottie's size.
  const flattened = StyleSheet.flatten(style) || {};
  const lottieWidth =
    flattened.lottieWidth || flattened.width || styles.lottie.width;
  const lottieHeight =
    flattened.lottieHeight || flattened.height || styles.lottie.height;

  // Extract size-related props and keep other style props for the container.
  const {
    lottieWidth: _lw,
    lottieHeight: _lh,
    _expandLottieContainer,
    width: _w,
    height: _h,
    ...containerExtras
  } = flattened as any;

  const lottieStyle = StyleSheet.flatten([
    styles.lottie,
    { width: lottieWidth, height: lottieHeight },
  ]) as any;

  const containerSizeStyle: any = {};
  if (_expandLottieContainer) {
    if (_lw || _w) containerSizeStyle.width = lottieWidth;
    if (_lh || _h) containerSizeStyle.height = lottieHeight;
  }

  return (
    <View
      style={[styles.container, containerSizeStyle, containerExtras] as any}
    >
      <LottieView
        source={src}
        autoPlay
        loop
        style={lottieStyle}
        webStyle={lottieStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: 160,
  },
  lottie: { width: 220, height: 160 },
});

export default OnboardingLottie;
