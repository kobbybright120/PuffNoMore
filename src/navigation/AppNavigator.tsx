import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigator from "./BottomTabNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import SplashScreen from "../screens/SplashScreen";
import EducationDetailScreen from "../screens/EducationDetailScreen";
import TipsAndGuidesScreen from "../screens/TipsAndGuidesScreen";
import DelayCravingScreen from "../screens/DelayCravingScreen";
import BreathingScreen from "../screens/BreathingScreen";
import CravingCrusherScreen from "../screens/CravingCrusherScreen";

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="RootTabs" component={BottomTabNavigator} />
      <Stack.Screen name="CravingCrusher" component={CravingCrusherScreen} />
      <Stack.Screen name="TipsAndGuides" component={TipsAndGuidesScreen} />
      <Stack.Screen name="DelayCraving" component={DelayCravingScreen} />
      <Stack.Screen name="Breathing" component={BreathingScreen} />
      <Stack.Screen name="EducationDetail" component={EducationDetailScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
