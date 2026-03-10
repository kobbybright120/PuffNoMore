import React, { useState, useRef, useEffect } from "react";
import { View, Animated, Dimensions, StyleSheet, Easing } from "react-native";
import WelcomeScreen from "./screens/WelcomeScreen";
import QuitSureWelcomeScreen from "./screens/QuitSureWelcomeScreen";
import { useNavigation, useRoute } from "@react-navigation/native";
import QuestionScreen1 from "./screens/QuestionScreen1";
import QuestionScreen2 from "./screens/QuestionScreen2";
import QuestionScreen3 from "./screens/QuestionScreen3";
import QuestionScreen4 from "./screens/QuestionScreen4";
import EducativeScreen1 from "./screens/EducativeScreen1";
import QuestionScreen5 from "./screens/QuestionScreen5";
import QuestionScreen6 from "./screens/QuestionScreen6";
import RewiringChartScreen from "./screens/RewiringChartScreen";
import QuestionScreen7 from "./screens/QuestionScreen7";
import QuestionScreen8 from "./screens/QuestionScreen8";
import QuestionScreen9 from "./screens/QuestionScreen9";
import QuestionScreen10 from "./screens/QuestionScreen10";
import AnalyzerScreen from "./screens/AnalyzerScreen";
import AnalysisResultScreen from "./screens/AnalysisResultScreen";
import CompleteScreen from "./screens/CompleteScreen";
import SymptomsScreen from "./screens/SymptomsScreen";
import ScareScreen1 from "./screens/ScareScreen1";
import ScareScreen2 from "./screens/ScareScreen2";
import ScareScreen3 from "./screens/ScareScreen3";
import ScareScreen4 from "./screens/ScareScreen4";
import ValueScreen1 from "./screens/ValueScreen1";
import ValueScreen2 from "./screens/ValueScreen2";
import ValueScreen3 from "./screens/ValueScreen3";
import ValueScreen4 from "./screens/ValueScreen4";
import ValueScreen5 from "./screens/ValueScreen5";
import ValueScreen6 from "./screens/ValueScreen6";
import ValueScreen7 from "./screens/ValueScreen7";
import RewiringBenefitsScreen from "./screens/RewiringBenefitsScreen";
import GoalsScreen from "./screens/GoalsScreen";
import RatingScreen from "./screens/RatingScreen";
import CommitmentScreen201 from "./screens/CommitmentScreen201";
import PreferredSupportScreen from "./screens/PreferredSupportScreen";
import QuitTargetDateScreen from "./screens/QuitTargetDateScreen";

const ManualOnboardingFlow: React.FC = () => {
  // initialize step from navigation params so we don't briefly render step 0
  const route: any = useRoute();
  const initialStart = (() => {
    try {
      const start = route?.params?.startStep;
      return typeof start === "number" && start >= 0 ? start : 0;
    } catch {
      return 0;
    }
  })();
  const [step, setStep] = useState(initialStart);
  const [answers, setAnswers] = useState<
    Record<number, number | string | string[]>
  >({});
  const { width } = Dimensions.get("window");
  const navigation: any = useNavigation();

  const navigateToIndex = (targetIndex: number) => {
    try {
      // If the jump is more than one screen, first move to the previous
      // screen so the pager can animate a single-step slide into the target.
      if (Math.abs(targetIndex - step) > 1) {
        const preIndex = targetIndex > step ? targetIndex - 1 : targetIndex + 1;
        setStep(preIndex);
        // small delay to allow render, then animate to target
        setTimeout(() => setStep(targetIndex), 40);
      } else {
        setStep(targetIndex);
      }
    } catch (e) {
      setStep(targetIndex);
    }
  };

  const screens = [
    <WelcomeScreen
      key="w"
      onNext={() => navigation.navigate("QuitSureWelcome")}
    />,
    <QuestionScreen1
      key="q1"
      question="Question 1"
      subtitle={"What's your name?"}
      current={1}
      total={10}
      selected={answers[1] as string | number | undefined}
      onSelect={(v: number | string) => setAnswers((s) => ({ ...s, 1: v }))}
      onNext={() => setStep(2)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,
    <QuestionScreen2
      key="q2"
      question="Question 2"
      subtitle={"What's your name?"}
      current={2}
      total={10}
      selected={answers[2] as string | number | undefined}
      onSelect={(v: number | string) => setAnswers((s) => ({ ...s, 2: v }))}
      onNext={() => setStep(3)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,
    <QuestionScreen3
      key="q3"
      question="Question 3"
      subtitle={"What is your age?"}
      current={3}
      total={10}
      selected={answers[3] as string | number | undefined}
      onSelect={(v: number | string) => setAnswers((s) => ({ ...s, 3: v }))}
      onNext={() => setStep(4)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,
    <QuestionScreen4
      key="q4"
      question="Question 4"
      subtitle={"In what forms have you consumed nicotine?"}
      current={4}
      total={10}
      selected={answers[4] as string | number | undefined}
      onSelect={(v: number | string) => setAnswers((s) => ({ ...s, 4: v }))}
      onNext={() => setStep(5)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,
    <EducativeScreen1
      key="educative1"
      current={5}
      total={10}
      onNext={() => setStep(6)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,
    <QuestionScreen5
      key="q5"
      question="Question 5"
      subtitle={"What's your next step in your journey with smoking?"}
      current={5}
      total={10}
      selected={answers[5] as string | number | undefined}
      onSelect={(v: number | string) => setAnswers((s) => ({ ...s, 5: v }))}
      onNext={() => setStep(7)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,
    <QuestionScreen6
      key="q6"
      question={"Question 6"}
      subtitle={"Have you made previous attempts to quit smoking?"}
      current={6}
      total={10}
      selected={answers[6] as string | number | undefined}
      onSelect={(v: number | string) => setAnswers((s) => ({ ...s, 6: v }))}
      onNext={() => {
        const target = screens.findIndex(
          (el: any) => el && el.key === "rewireChart",
        );
        if (target >= 0) navigateToIndex(target);
        else setStep((s) => s + 1);
      }}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,

    <RewiringChartScreen
      key="rewireChart"
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onContinue={() => setStep((s) => s + 1)}
    />,
    <QuestionScreen7
      key="q7"
      question="Question 7"
      subtitle={"Do you have support at home to quit?"}
      current={7}
      total={10}
      selected={answers[7] as string | number | undefined}
      onSelect={(v: number | string) => setAnswers((s) => ({ ...s, 7: v }))}
      onNext={() => setStep(8)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,
    <QuestionScreen8
      key="q8"
      question="Question 8"
      subtitle={"Have you tried quitting before?"}
      current={8}
      total={10}
      selected={answers[8] as string | number | undefined}
      onSelect={(v: number | string) => setAnswers((s) => ({ ...s, 8: v }))}
      onNext={() => setStep(9)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,
    <QuestionScreen9
      key="q9"
      question="Question 9"
      subtitle={"What time of day do you crave most?"}
      current={9}
      total={10}
      selected={answers[9] as string | number | undefined}
      onSelect={(v: number | string) => setAnswers((s) => ({ ...s, 9: v }))}
      onNext={() => setStep(10)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,
    <QuestionScreen10
      key="q10"
      question="Question 10"
      subtitle={"Which coping tools interest you most?"}
      current={10}
      total={10}
      selected={answers[10] as string | number | undefined}
      onSelect={(v: number | string) => setAnswers((s) => ({ ...s, 10: v }))}
      onNext={() => setStep(11)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,
    <AnalyzerScreen key="an" onComplete={() => setStep((s) => s + 1)} />,
    <AnalysisResultScreen
      key="ar"
      subtitle={"When would you like to set your quit date?"}
      // demo values so bars are visible; replace with real calculations later
      addictionScore={52}
      readinessScore={13}
      onNext={() => setStep((s) => s + 1)}
    />,
    <SymptomsScreen
      key="sym"
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() => setStep((s) => s + 1)}
    />,
    <ScareScreen1
      key="lt"
      scareIndex={1}
      onNext={() => setStep((s) => s + 1)}
    />,
    <ScareScreen2
      key="lt2"
      scareIndex={2}
      onNext={() => setStep((s) => s + 1)}
    />,
    <ScareScreen3
      key="lt3"
      scareIndex={3}
      onNext={() => setStep((s) => s + 1)}
    />,
    <ScareScreen4
      key="lt4"
      scareIndex={4}
      onNext={() => setStep((s) => s + 1)}
    />,
    <ValueScreen1 key="vs1" onNext={() => setStep((s) => s + 1)} />,
    <ValueScreen2 key="vs2" onNext={() => setStep((s) => s + 1)} />,
    <ValueScreen3 key="vs3" onNext={() => setStep((s) => s + 1)} />,
    <ValueScreen4 key="vs4" onNext={() => setStep((s) => s + 1)} />,
    <ValueScreen5 key="vs5" onNext={() => setStep((s) => s + 1)} />,
    <ValueScreen6 key="vs6" onNext={() => setStep((s) => s + 1)} />,
    <ValueScreen7 key="vs7" onNext={() => setStep((s) => s + 1)} />,
    <RewiringBenefitsScreen
      key="rewire"
      onNext={() => setStep((s) => s + 1)}
    />,
    <GoalsScreen
      key="goals"
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={(selected: string[]) => {
        try {
          setAnswers((s) => ({ ...s, 32: selected }));
        } catch {
          // ignore
        }
        setStep((s) => s + 1);
      }}
    />,
    <RatingScreen
      key="rating"
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() => setStep((s) => s + 1)}
    />,
    <CommitmentScreen201
      key="commitment201"
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={(strokes: any) => {
        try {
          setAnswers((s) => ({
            ...s,
            201: strokes ? JSON.stringify(strokes) : "",
          }));
        } catch {}
        setStep((s) => s + 1);
      }}
    />,
    <PreferredSupportScreen
      key="preferredSupport"
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={(selected: string) => {
        try {
          setAnswers((s) => ({ ...s, 203: selected || "" }));
        } catch {}
        setStep((s) => s + 1);
      }}
    />,
    <QuitTargetDateScreen
      key="quitTargetDate"
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() => setStep((s) => s + 1)}
      onboardingResponses={answers}
    />,
    <CompleteScreen key="c" />,
    <EducativeScreen1
      key="educative"
      onNext={() => setStep((s) => s + 1)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
    />,
  ];

  // start the animated translateX at the initial step so the pager doesn't
  // animate from 0 -> start on mount (which caused a visible flash of welcome)
  const translateX = useRef(new Animated.Value(-initialStart * width)).current;
  const prevStepRef = useRef(initialStart);

  useEffect(() => {
    const toValue = -step * width;
    const prevStep = prevStepRef.current;
    const stepDelta = Math.abs(step - prevStep);

    // If jumping more than one screen, don't animate across many empty pages —
    // set the translateX value immediately to avoid a brief white flash.
    if (stepDelta > 1) {
      translateX.setValue(toValue);
    } else {
      Animated.timing(translateX, {
        toValue,
        duration: 360,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }

    prevStepRef.current = step;
  }, [step, width, translateX]);

  // If navigation params change while mounted, respond to them.
  useEffect(() => {
    try {
      const start = route?.params?.startStep;
      if (typeof start === "number" && start >= 0 && start !== step) {
        setStep(start);
      }
    } catch (e) {
      // ignore
    }
  }, [route?.params?.startStep]);

  return (
    <View style={styles.outer}>
      <Animated.View
        style={[
          styles.row,
          { width: width * screens.length },
          { transform: [{ translateX }] },
        ]}
      >
        {screens.map((screen, i) => (
          <View key={i} style={{ width }}>
            {Math.abs(i - step) <= 1 ? screen : null}
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export default ManualOnboardingFlow;

const styles = StyleSheet.create({
  outer: { flex: 1, overflow: "hidden", backgroundColor: "#08121a" },
  row: { flexDirection: "row", flex: 1 },
});
