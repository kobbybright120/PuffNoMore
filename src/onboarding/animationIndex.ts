// Mapping of animation keys used in onboardingSpec.json to local Lottie JSON asset filenames.
// These are filenames only; the component will attempt to require them at runtime.
// Place matching JSON files under `assets/animations/` with these filenames to enable animations.
export const animations: Record<string, any> = {
  // use a real extracted animation for the welcome screen
  // fadeInLogo: require("../../assets/animations/extracted/animations/earkick-welcome.json"),
  // dark-mode variant (OnboardingLottie will pick this when theme is dark)
  // fadeInLogoDark: require("../../assets/animations/extracted/animations/earkick-welcome-dark.json"),
  dotSpinnerWithSummaryTips: require("../../assets/animations/dotSpinnerWithSummaryTips.json"),
  progressBarsWithMicroAnimations: require("../../assets/animations/progressBarsWithMicroAnimations.json"),
  growBars: require("../../assets/animations/growBars.json"),
  growBarsSequential: require("../../assets/animations/growBarsSequential.json"),
  // local animation used only on the quitting-target screen (user-provided)
  growingPlant: require("../../assets/animations/extracted/animations/growingPlant.json"),
  // animated plant loader (added for screen id 24)
  animatedPlantLoader: require("../../assets/animations/extracted/animations/Animated plant loader.json"),
  // hero animation added by user for screen id 25
  hero: require("../../assets/animations/extracted/animations/Hero.json"),
  // meditating brain animation for screen id 26
  meditatingBrain: require("../../assets/animations/extracted/animations/Meditating Brain.json"),
  // target hit animation for screen id 27
  targetHit: require("../../assets/animations/extracted/animations/Target Hit!.json"),
  // avoid setbacks animation for screen id 28
  avoidSetback: require("../../assets/animations/extracted/animations/avoid setback.json"),
  // Business Man Winner With Trophy animation for screen id 29
  businessManWinner: require("../../assets/animations/extracted/animations/Business Man Winner With Trophy.json"),
  // brain thinking animation used on the 'Smoking is a drug' scare screen
  brainThinking: require("../../assets/animations/extracted/animations/brain thinking.json"),
  // covid19 animation (user-downloaded COVID19.json) used on the 'Health impact' scare screen
  covid19: require("../../assets/animations/extracted/animations/COVID19.json"),
  // sad emotion animation used on the 'Feeling unhappy?' scare screen (id 21)
  sadEmotion: require("../../assets/animations/extracted/animations/sad emotion.json"),
  // fall animation used on the 'Smoking kills drive' scare screen (id 20)
  fall: require("../../assets/animations/extracted/animations/fall.json"),
  // Olympic games victory player animation for screen id 30
  olympicVictoryPlayer: require("../../assets/animations/extracted/animations/Olympic games 2021 Victory player.json"),
  tree: require("../../assets/animations/extracted/animations/tree.json"),
};

export default animations;
