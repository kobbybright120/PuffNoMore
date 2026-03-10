import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import AppHeader from "../components/AppHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as SafeHaptics from "../utils/haptics";
const EDUCATION: {
  id: string;
  title: string;
  body: string;
  tips?: string[];
}[] = [
  {
    id: "edu-0",
    title: "What Smoking Is Really Doing to Your Body",
    body: `Smoking exposes your lungs and bloodstream to hundreds of harmful chemicals. In the lungs, tar and tiny particles damage the delicate air sacs (alveoli) that exchange oxygen and carbon dioxide. This reduces lung capacity and makes physical activity and everyday tasks more difficult.

Carbon monoxide from smoke binds to hemoglobin and lowers the amount of oxygen your blood can carry. That causes you to feel fatigued more quickly. Nicotine and other chemicals narrow blood vessels, raise heart rate and blood pressure, and increase clotting, which puts extra strain on the heart and speeds up artery damage over time.

Smoking weakens the immune system and slows healing. It causes chronic inflammation throughout the body and raises long-term risks for heart disease, stroke, peripheral vascular disease, chronic obstructive lung disease, and many cancers.

Good news: Many benefits begin quickly after reducing or quitting. Breathing becomes easier, circulation improves, taste and smell sharpen, and stamina increases. Practical steps to manage cravings include delaying for 10 minutes, distracting yourself (walk, drink water), and using a simple substitution such as gum or nicotine replacement. Small, planned steps add up and lead to real progress.
`,
    tips: [
      "Delay: if the urge comes, wait 10 minutes. It will often ease.",
      "Move: light activity (walk, climb stairs) can improve breathing and mood.",
      "Track wins: note easier breathing and small improvements each week.",
    ],
  },
  {
    id: "edu-1",
    title: "How Nicotine Affects Your Brain",
    body: `Nicotine reaches the brain within seconds and binds to specific receptors, triggering the release of dopamine and other neurotransmitters. That dopamine surge creates a feeling of reward, calm, or focus that the brain learns to expect.

Over time the brain adapts to regular nicotine exposure. Receptors change and tolerance develops, so the same nicotine dose produces a smaller effect. Those adaptations also make the brain more likely to respond automatically to cues like routines, places, or emotions.

When nicotine is reduced, withdrawal symptoms can appear: irritability, difficulty concentrating, restlessness, and sleep disruption. These symptoms reflect the brain rebalancing and usually peak within the first few days, then ease over weeks as the nervous system recovers.

Practical steps that help: delay for a few minutes when cravings strike, distract with a short activity, and consider nicotine replacement therapy when appropriate. Small, consistent changes allow the brain to recalibrate and reduce the power of cravings over time.
`,
    tips: [
      "Delay: allow the craving to peak and pass rather than reacting immediately.",
      "Consider NRT: nicotine replacement can reduce withdrawal while you quit.",
      "Change cues: avoid or modify situations where your brain expects nicotine.",
    ],
  },
  {
    id: "edu-2",
    title: "How Smoking Becomes a Habit",
    body: `Smoking often starts as a deliberate choice, but over time it becomes tied to specific places, feelings, and routines. For example, a cigarette after coffee, during a work break, or when feeling stressed becomes a learned response that can fire automatically.

The brain builds strong links between the action and the cues that surround it. When you encounter the same cue again, the urge can arise before you even realize it. This automatic pattern is what we call a habit: the brain prefers efficient, familiar behaviors and will repeat what has been reinforced.

Breaking the habit means disrupting those links. Change the cue, change the routine, or add a new response. Simple strategies include altering your environment (move away from usual smoking spots), substituting a different activity (walk, drink water, chew gum), and planning an if-then response (if I feel the urge after coffee, then I will do 2 minutes of deep breathing).

Be patient: habits form gradually and they also change gradually. Small, consistent adjustments weaken the automatic response and give you more control over choices in the situations that used to trigger smoking.
`,
    tips: [
      "Change the cue: move to a different location after routines that used to trigger smoking.",
      "Substitute: replace the routine with a short activity like stretching or drinking water.",
      "If-then plan: decide beforehand what you'll do instead of smoking.",
    ],
  },
  {
    id: "edu-3",
    title: "What a Craving Actually Means",
    body: `A craving is a strong desire to use nicotine that comes from both biology and learned patterns. Biologically, the body notices the absence of nicotine and sends signals (including tension or restlessness) while the brain remembers the rewarding effects nicotine provided. Behaviorally, certain places, times, emotions, or routines can act as cues that trigger the urge.

  Cravings tend to follow a predictable course: they build up, reach a peak, and then fade. This happens because the physical urge and conditioned response are both short-lived. Most cravings pass within a few minutes even if they feel overwhelming at first. Understanding this timing can help you tolerate urges without acting on them.

  Common causes include nicotine withdrawal, stress or negative emotions, seeing someone smoke, finishing a meal or drinking coffee, or routines linked to past smoking. The brain learns to expect nicotine in those situations, which makes the urge automatic unless you change the response.

  Practical ways to handle cravings:
  Delay for 5 to 10 minutes. The urge will often reduce on its own.
  Distract yourself with a physical or engaging activity (walk, climb stairs, wash your hands).
  Take slow, deep breaths for one to two minutes to calm your nervous system.
  Use a substitution such as gum or a drink, or consider nicotine replacement therapy when appropriate.
  Plan ahead: identify your triggers and choose a replacement action for each.

  If you slip, treat it as information rather than failure: what triggered it, and how can you adjust your plan? Over time the brain relearns new patterns and cravings become less frequent and easier to manage.
  `,
    tips: [
      "Delay for 5 to 10 minutes. Cravings often fade quickly.",
      "Use breathing or a brief walk to reduce stress and break the urge.",
      "Keep a simple substitute handy (gum, a bottle of water) when triggers arise.",
    ],
  },
  {
    id: "edu-4",
    title: "Why Cravings Come and Go",
    body: `Cravings vary because they come from several interacting sources: biology, environment, and emotion. Biologically, nicotine levels and withdrawal cycles influence how intense an urge feels. Environmentally, being in places or situations previously associated with smoking can trigger an automatic response. Emotionally, stress, boredom, or strong feelings make cravings more likely.

  Cravings often follow predictable patterns. They may be stronger at certain times of day, after specific activities, or during stressful moments. Most cravings are short-lived; they build, peak, and then subside within minutes, but repeated exposure to triggers can make them recur more often.

To reduce how often cravings occur, try changing the context: avoid known triggers when possible, alter routines, or add new actions after activities that used to signal smoking. To handle a craving when it appears, delay for a few minutes, use a distraction, practice deep breathing, or use a safe substitute. Tracking when cravings happen helps you spot patterns and plan replacements so urges lose their power over time.
`,
  },
  {
    id: "edu-5",
    title: "Withdrawal is Uncomfortable but Not Dangerous",
    body: `When you reduce or stop nicotine, your body and brain need time to adjust to lower levels of stimulation. Withdrawal can cause irritability, trouble sleeping, headaches, increased appetite, low mood, and strong cravings. These reactions are uncomfortable but expected and they show the nervous system is rebalancing.

Symptoms often follow a common pattern. Many people notice the strongest effects in the first 48 to 72 hours after reducing or stopping. After that, symptoms usually begin to ease and continue to improve over the next two to six weeks as receptors and reward pathways adapt.

Practical steps that help right away: prioritize sleep and hydration, move gently during the day (short walks or light stretching), and replace habitual hand-to-mouth actions with an alternative like gum or a bottle of water. When a craving hits, delay for 5 to 15 minutes and try a short distraction (walk, call a friend, do a simple task) while using slow, deep breathing to calm your nervous system.

Consider nicotine replacement therapy or other medical supports if withdrawal is severe or makes quitting difficult. These options reduce physical discomfort so you can focus on changing routines and responses. Counseling, quitlines, or peer support also improve success and provide practical coping strategies.

Good news: withdrawal symptoms are temporary and manageable. With simple self-care, a plan for common triggers, and the right supports, most people see large improvements in weeks, and steady progress becomes easier to maintain.
`,
    tips: [
      "Prepare: know common withdrawal symptoms and when they peak.",
      "Hydrate and rest: simple self-care eases physical discomfort.",
      "Ask for support: counseling or a quitline can help through tough days.",
    ],
  },
  {
    id: "edu-6",
    title: "Why Reducing Gradually Works",
    body: `Reducing nicotine in small, planned steps eases the pressure on the brain and body. Sudden removal can produce intense withdrawal that undermines attempts to quit, while gradual reductions allow receptors and reward pathways to adapt more gently.

  By lowering exposure step by step you reduce craving intensity and build confidence. Each success reinforces new habits and shows the brain that reward can be obtained without every prior dose of nicotine. Combining gradual reduction with practical supports such as nicotine replacement, behavioral changes, or coaching increases the chance of sustained progress.`,
    tips: [
      "Plan gradual steps: set small, achievable reduction goals.",
      "Track progress: record days and reductions to stay motivated.",
      "Use supports: NRT or coaching can smooth the transition.",
    ],
  },
  {
    id: "edu-7",
    title: "How Cutting Down Helps Your Brain Reset",
    body: `Cutting down reduces the frequency of nicotine signals and gives the brain space to reorganize how it responds to reward. When nicotine exposure becomes less frequent, the brain slowly reduces its reliance on those signals. Over time conditioned links between cues such as places, routines and emotions and the act of smoking grow weaker, so urges become less automatic.

  What to expect: in the first days you may still notice frequent urges as the nervous system adjusts. Over weeks those urges typically become less intense and less tied to specific cues. With continued reductions the brain's reward circuits recalibrate, making it easier to pause and choose a different response when a cue appears.

  Real world steps that help the reset: set short, realistic goals for reduction and track them. Change routines that previously signaled smoking by inserting a new, brief activity such as a short walk or stretching. Use nicotine replacement when needed to reduce withdrawal and focus on behavior change. Practice noticing urges without acting on them for a few minutes to weaken the automatic response.

  Be patient and consistent. The brain rewires slowly but consistently, and small, repeated smoke free choices add up to lasting change.`,
    tips: [
      "Short goals: reduce cigarettes per day in small steps you can keep.",
      "Change routines: replace a smoked cigarette with a 5-minute walk.",
      "Celebrate small wins: reward each week of reduced use to reinforce progress.",
    ],
  },
  {
    id: "edu-8",
    title: "The Myth of Quitting All at Once",
    body: `This app focuses on gradual reduction because many people find steady, planned steps easier to maintain than an all-or-nothing quit. Reducing slowly gives you practice managing triggers, lowers withdrawal intensity, and builds confidence with measurable progress.

  Why gradual reduction works: small decreases in use give the brain time to adapt. Each deliberate reduction weakens the automatic link between cues and nicotine, while successes reinforce new routines. Over weeks, small wins add up and make larger changes possible.

  How to build a gradual plan:
  1) Set clear, simple goals. Start with a realistic first step (for example, reduce daily use by one cigarette or delay the first cigarette of the day by 30 minutes).
  2) Track progress. Note each success and any triggers you encounter so you can adjust the plan.
  3) Swap routines. Replace automatic moments (after coffee, on breaks) with short alternative actions: a 3 to 5 minute walk, a glass of water, or chewing gum.
  4) Use supports. Nicotine replacement therapy or medication can lessen physical cravings so you can focus on behavior change. Counseling, quitlines, or peer groups provide practical tips and accountability.

  Managing setbacks: if a plan stalls or you have a slip, treat it as information. Identify the trigger, tweak the next step, and continue. Slow progress is still progress.

  Practical example: choose a two-week cycle. Reduce one small habit each cycle (remove a cigarette after a specific cue, delay a usual cigarette by increasing time between uses, or cut daily count by one). Repeat cycles until you reach your target.

  This app helps by letting you enter how many cigarettes you smoke each day and then generating a tailored reduction plan. Based on your daily count the app estimates how many two-week cycles you will need if you follow the suggested reductions (for example, cutting one cigarette per cycle). Use the app's tracker to update your daily number and follow the schedule it suggests; the plan adjusts as you log progress so the schedule stays realistic and personalized.`,
    tips: [
      "Choose your path: quitting gradually or abruptly both work for different people.",
      "Make a support plan: tell friends or join a group for accountability.",
      "Adjust as needed: if one approach stalls, try a different strategy.",
    ],
  },
  {
    id: "edu-9",
    title: "The Myth That One Smoke Is Harmless",
    body: `Even a single smoke can reactivate longstanding patterns. The brain links taste, place, and routine to the reward of nicotine, and that brief restart can make automatic smoking actions feel relevant again.

  That does not mean a slip ends progress. A lapse gives useful information about a trigger or a gap in the plan. Right after a slip, use a short recovery routine: take slow calming breaths, drink water, and do a brief grounding activity. Then reflect briefly on what happened and pick one small change to try next time.

  Practical steps to recover and reduce the chance of another lapse:
  • Reframe the event. One slip is data, not a verdict. Recommit and set a small next goal.
  • Replace the trigger. If the slip followed coffee, try a 3 to 5 minute walk or a different ritual such as stretching or chewing gum.
  • Use supports. A nicotine replacement dose or a short distraction can reduce the urge after a slip.
  • Track and learn. Note when slips occur and the surrounding context so you can spot patterns and make one focused change.

  Over time, most people recover from slips and maintain progress. Learn one small lesson from each lapse, apply one practical change, and keep building consistent smoke free choices.`,
    tips: [
      "Reflect: note what led to the slip and what you can change next time.",
      "Restart: a single slip doesn't erase progress. Get back to your plan.",
      "Plan alternatives: have quick coping actions for high-risk moments.",
    ],
  },
  {
    id: "edu-10",
    title: "Why Slips Don’t Mean You Failed",
    body: `Slips are a normal part of changing a long standing habit. They often reveal a specific trigger, mood, or situation that needs a different strategy rather than showing you have failed.

What to do right away: pause without harsh judgment, practice a short recovery routine such as slow deep breaths, drink water, and do a brief physical movement to reset. This helps reduce stress and gives you a clear head to reflect.

How to learn from a slip: ask focused questions. What was the trigger? Where were you and who were you with? What felt different from times when you resisted? Choose one small, specific change to try next time rather than overhauling everything.

Concrete steps that help:
• Make one targeted change. If the slip followed coffee, swap that cigarette with a 3 to 5 minute walk or chewing gum.
• Set a small immediate goal. For example, aim for one smoke free day or delay the next cigarette by 30 minutes.
• Use supports. Nicotine replacement, counseling, quitlines, or a support buddy reduce pressure and increase success.
• Track patterns. Log slips and the context so you can spot recurring triggers and remove or adjust them.

Example: if social drinking was the trigger, try limiting exposure, arrange a non smoking friend to be with you, or plan a fixed substitution during the event. Then evaluate and adjust the plan after the next exposure.

Reassurance: most people recover from slips and regain momentum. Treat each lapse as information, make one small change, and keep building consistent smoke free choices.`,
    tips: [
      "Learn: identify triggers and adjust your defenses for next time.",
      "Be kind to yourself: self-criticism increases chances of relapse.",
      "Reach out: contact a support buddy or professional when you slip.",
    ],
  },
  {
    id: "edu-11",
    title: "What Real Progress Looks Like",
    body: `Real progress is measured by repeated smoke free choices and growing control over cravings and triggers. Early wins include a smoke free morning, resisting an urge after a meal, or delaying the first cigarette of the day. Over time those moments lengthen and become the new normal as habits shift.

Progress appears in many ways. Physical signs include easier breathing, clearer taste and smell, improved sleep, and more daytime energy. Mental and emotional signs matter too: fewer intense cravings, more confidence in stressful moments, and a stronger sense of control.

How to track progress:
• Log small wins and slips so you can see patterns and improvements.
• Measure simple markers such as cigarettes per day, time until the first cigarette, and consecutive smoke free days.
• Celebrate milestones: one smoke free day, one smoke free week, and each successful reduction cycle.

Tips to keep momentum:
• Build tiny replacement routines for moments that used to trigger smoking, for example a short walk or a glass of water.
• Use the app tracker to monitor daily numbers and adjust goals when needed so the plan stays realistic.
• Lean on supports like counseling, quitlines, or a support buddy for hard moments.
• Reflect weekly on what worked and what to tweak so your plan improves over time.

Good news: steady, small changes compound. Consistency beats perfection. Focus on daily choices, celebrate progress, and the long term change will follow.`,
    tips: [
      "Track small wins: log smoke-free days and moments of self-control.",
      "Measure change: notice improvements in breathing, taste, and energy.",
      "Keep routines: replace old smoking rituals with new, healthier ones.",
    ],
  },
];

type Props = {
  onOpen?: (title: string, body: string, tips?: string[]) => void;
  onClose?: () => void;
  showCloseX?: boolean;
};

const TipsAndGuidesScreen: React.FC<Props> = ({
  onOpen,
  onClose,
  showCloseX,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const shouldShowBack = !!(showCloseX || route?.params?.showCloseX);

  const open = (id: string) => {
    const item = EDUCATION.find((x) => x.id === id);
    try {
      SafeHaptics.selectionAsync();
    } catch {}
    if (!item) return;

    // If a parent provided an `onOpen` handler (for example SupportScreen when
    // rendering this inside a modal), call it so the parent can close the modal
    // and perform navigation. This prevents navigation happening under the
    // modal overlay.
    if (onOpen) {
      onOpen(item.title, item.body, item.tips);
      return;
    }

    // Prefer navigating on the parent stack (AppNavigator). If not available, fall back.
    const parentNav = (navigation as any).getParent?.() || null;
    if (parentNav && parentNav.navigate) {
      parentNav.navigate("EducationDetail", {
        id: item.id,
        title: item.title,
        body: item.body,
        tips: item.tips,
      });
      return;
    }

    if ((navigation as any).navigate) {
      navigation.navigate("EducationDetail", {
        id: item.id,
        title: item.title,
        body: item.body,
        tips: item.tips,
      });
    }
  };
  const close = () => {
    setVisible(false);
    setActiveId(null);
  };

  const isLight = theme.colors.primaryBackground === "#ffffff";
  const cardBackground = isLight ? "#ffffff" : "#0b1519";
  const cardBorderColor = isLight
    ? theme.colors.primaryGreen + "10"
    : "rgba(255,255,255,0.08)";
  const cardShadow = isLight
    ? theme.shadows.medium
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 12,
        elevation: 8,
      };

  const iconBgColor = isLight
    ? theme.colors.primaryGreen
    : theme.colors.secondaryGreen + "14";
  const iconBorderColor = isLight
    ? "transparent"
    : theme.colors.secondaryGreen + "22";
  const previewColor = isLight
    ? theme.colors.textSecondary
    : "rgba(255,255,255,0.82)";
  const chevronColor = isLight ? theme.colors.textSecondary : theme.colors.text;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.primaryBackground },
    content: { paddingVertical: theme.spacing.md, paddingHorizontal: 12 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      marginHorizontal: 4,
      borderRadius: theme.borderRadius.large,
      backgroundColor: cardBackground,
      borderWidth: isLight ? 0 : 1,
      borderColor: cardBorderColor,
      ...cardShadow,
    },
    iconBox: {
      width: 64,
      height: 64,
      borderRadius: theme.borderRadius.xlarge,
      backgroundColor: iconBgColor,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.md,
      borderWidth: isLight ? 0 : 1,
      borderColor: iconBorderColor,
    },
    title: {
      color: theme.colors.text,
      fontFamily: theme.fonts.family.bold,
      fontSize: theme.fonts.size.large,
      marginBottom: 6,
    },
    preview: {
      color: theme.colors.textSecondary,
      fontSize: theme.fonts.size.small,
      lineHeight: 18,
    },
  });

  const active = EDUCATION.find((x) => x.id === activeId) || null;

  return (
    <View style={styles.container}>
      {/* showClose can come from props (when rendered in modal) or route params when navigated */}
      <AppHeader
        title="Tips & Guides"
        onBack={
          shouldShowBack
            ? () => {
                if (onClose) return onClose();
                try {
                  if (
                    (navigation as any).canGoBack &&
                    (navigation as any).canGoBack()
                  ) {
                    navigation.goBack();
                    return;
                  }
                } catch {}
                try {
                  navigation.navigate("RootTabs");
                } catch {}
              }
            : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ paddingHorizontal: 0 }}>
          {EDUCATION.map((e) => (
            <TouchableOpacity
              key={e.id}
              onPress={() => open(e.id)}
              activeOpacity={0.9}
              style={styles.row}
            >
              <View style={styles.iconBox}>
                <Ionicons
                  name="book"
                  size={28}
                  color={isLight ? "#ffffff" : theme.colors.secondaryGreen}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{e.title}</Text>
                <Text
                  style={[styles.preview, { color: previewColor }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {e.body}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={chevronColor} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={visible}
        animationType="slide"
        transparent={Platform.OS === "ios"}
        onRequestClose={close}
      >
        <View
          style={{ flex: 1, backgroundColor: theme.colors.primaryBackground }}
        >
          <View
            style={{
              padding: theme.spacing.md,
              borderBottomWidth: 2,
              borderColor: theme.colors.secondaryGreen + "44",
            }}
          >
            <Text
              style={{
                fontFamily: theme.fonts.family.bold,
                fontSize: theme.fonts.size.large,
                color: theme.colors.text,
              }}
            >
              {active ? active.title : ""}
            </Text>
            <TouchableOpacity
              onPress={close}
              style={{
                position: "absolute",
                right: theme.spacing.md,
                top: theme.spacing.md,
              }}
            >
              <Text style={{ color: theme.colors.primaryGreen }}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
            <Text style={{ color: theme.colors.text }}>
              {active ? active.body : ""}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default TipsAndGuidesScreen;
