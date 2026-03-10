# Onboarding Manual - Important Notes

## ⚠️ DEPRECATED FILES - DO NOT USE

The following files are **DEPRECATED** and cause crashes:

- `src/onboarding/onboardingSpec.json` - **NOT IN USE**
- `src/onboarding/ManualOnboardingFlow.tsx` - **NOT IN USE**

These files should be ignored and are no longer part of the active onboarding flow.

## ✅ ACTIVE IMPLEMENTATION

The current onboarding implementation uses files in the `onboarding_manual` folder:

- `ManualOnboardingFlow.tsx` - Main flow coordinator that manages screen navigation and state
- `screens/` - Contains all screen components (under active development)
- `components/GradientBackground.tsx` - Dynamic background color support

## 📝 Recent Fixes

1. **Background Color Bug** - Fixed GradientBackground to accept `bgColor` prop for dynamic backgrounds
2. **Pagination Dots Issue** - Fixed ScareScreen pagination to show 4 dots instead of 5
3. **Duplicate Screen Rendering** - Removed OnboardingScreen from ManualOnboardingFlow to prevent duplicate scary screens

## 🔧 Important Notes for Future Development

- Always reference files in `onboarding_manual/` folder, NOT `src/onboarding/`
- The scary screens carousel is handled separately (ScareScreen1-4), not internally within a component
- When making changes to onboarding flow, update `ManualOnboardingFlow.tsx` screens array
