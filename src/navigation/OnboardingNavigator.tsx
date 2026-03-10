import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Use the manual onboarding folder created at repository root to avoid the JSON-driven flow
import ManualOnboardingFlow from "../../onboarding_manual/ManualOnboardingFlow";
// new screen
import QuitSureWelcomeScreen from "../../onboarding_manual/screens/QuitSureWelcomeScreen";

const Stack = createNativeStackNavigator();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingFlow" component={ManualOnboardingFlow} />
      <Stack.Screen name="QuitSureWelcome" component={QuitSureWelcomeScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
