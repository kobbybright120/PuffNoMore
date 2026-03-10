import React, { useState } from "react";
import { View } from "react-native";
import WelcomeScreen from "./screens/WelcomeScreen";
import QuestionScreen from "./screens/QuestionScreen";
import CompleteScreen from "./screens/CompleteScreen";

const ManualOnboardingFlow: React.FC = () => {
  const [step, setStep] = useState(0);
  const screens = [
    <WelcomeScreen key="w" onNext={() => setStep(1)} />,
    <QuestionScreen
      key="q"
      question="Do you want to set a quit date?"
      onNext={() => setStep(2)}
    />,
    <CompleteScreen key="c" />,
  ];
  return <View style={{ flex: 1 }}>{screens[step] || screens[0]}</View>;
};

export default ManualOnboardingFlow;
