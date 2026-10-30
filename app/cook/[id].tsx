import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Celebration, ConfettiBurst, XpPop } from '../../components/cook/paper/Celebration';
import { GAME_BONUS_XP, InteractiveScene } from '../../components/cook/paper/InteractiveScene';
import { IngredientArt } from '../../components/paper/IngredientArt';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { BackIcon, ClockIcon } from '../../components/paper/UiIcons';
import { getRecipe } from '../../lib/db';
import { awardXp, getProfile, XP_PER_STEP, XP_RECIPE_BONUS } from '../../lib/profile';
import { listStepIngredients } from '../../lib/stepIngredients';
import { getPaperSceneKind, stepTimerMinutes } from '../../lib/stepSceneLayout';
import { cutCorners, fonts, paper } from '../../lib/theme';
import type { Recipe } from '../../types/recipe';

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Countdown for steps that mention a time. Tap to start / pause. */
function StepTimer({ minutes }: { minutes: number }) {
  const total = Math.round(minutes * 60);
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setLeft(total);
    setRunning(false);
  }, [total]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left === 0) setRunning(false);
  }, [left]);

  const done = left === 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={done ? 'Timer finished, tap to reset' : running ? 'Pause timer' : 'Start timer'}
      onPress={() => {
        if (done) setLeft(total);
        else setRunning((r) => !r);
      }}
    >
      <PaperCard
        shape="c"
        tilt={-2}
        lift={3}
        color={done ? paper.green : running ? paper.yellow : paper.card}
        contentStyle={styles.timer}
      >
        <ClockIcon size={18} color={done ? paper.card : paper.ink} />
        <Text style={[styles.timerText, done && { color: paper.card }]}>{done ? 'Done!' : formatClock(left)}</Text>
        {!running && !done ? <Text style={styles.timerHint}>tap</Text> : null}
      </PaperCard>
    </Pressable>
  );
}

export default function CookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [pop, setPop] = useState(0);
  const [busy, setBusy] = useState(false);
  const [gameDone, setGameDone] = useState(false);
  const [finale, setFinale] = useState<{ before: number; after: number; streak: number; earned: number } | null>(null);
  const earnedRef = useRef(0);
  const lastXp = useRef(XP_PER_STEP);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!id) {
          setLoading(false);
          return;
        }
        setLoading(true);
        const result = await getRecipe(id);
        if (active) {
          setRecipe(result);
          setStepIndex(0);
          setFinale(null);
          earnedRef.current = 0;
          setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [id]),
  );

  if (loading) {
    return (
      <PaperBackground style={styles.centered}>
        <ActivityIndicator size="large" color={paper.red} />
      </PaperBackground>
    );
  }

  if (!recipe || recipe.steps.length === 0) {
    return (
      <PaperBackground style={styles.centered}>
        <Text style={styles.missing}>Recipe not found.</Text>
        <PaperButton label="Go back" onPress={() => router.back()} />
      </PaperBackground>
    );
  }

  const steps = recipe.steps;
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const ingredients = listStepIngredients(step, recipe.ingredients);
  const sceneKind = getPaperSceneKind(step);
  const timer = stepTimerMinutes(step.text);
  const stepXp = XP_PER_STEP + (isLast ? XP_RECIPE_BONUS : 0) + (gameDone ? GAME_BONUS_XP : 0);
  const sceneSize = Math.min(width - 24, height * 0.38, 400);

  async function handleDone() {
    if (busy) return;
    setBusy(true);
    try {
      if (isLast) {
        const before = (await getProfile()).xp;
        const profile = await awardXp(stepXp, true);
        earnedRef.current += stepXp;
        setFinale({ before: before - (earnedRef.current - stepXp), after: profile.xp, streak: profile.streak, earned: earnedRef.current });
      } else {
        await awardXp(stepXp);
        earnedRef.current += stepXp;
        lastXp.current = stepXp;
        setPop((n) => n + 1);
        setTimeout(() => {
          setGameDone(false);
          setStepIndex((i) => Math.min(steps.length - 1, i + 1));
        }, 420);
      }
    } finally {
      setTimeout(() => setBusy(false), 450);
    }
  }

  return (
    <PaperBackground>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Leave cooking" onPress={() => router.back()}>
          <PaperCard shape="b" lift={3} contentStyle={styles.iconBtn}>
            <BackIcon />
          </PaperCard>
        </Pressable>
        <View style={styles.topRight}>
          {timer ? <StepTimer key={`${stepIndex}-${timer}`} minutes={timer} /> : null}
          <PaperCard color={paper.green} shape="c" tilt={2} lift={3} contentStyle={styles.xpChip}>
            <Text style={styles.xpChipText}>+{stepXp} XP</Text>
          </PaperCard>
        </View>
      </View>

      {ingredients.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ingRow} style={styles.ingScroll}>
          {ingredients.slice(0, 5).map((name, i) => (
            <Animated.View key={`${stepIndex}-${name}`} entering={ZoomIn.delay(i * 70).springify().damping(12)}>
              <PaperCard shape={i % 2 ? 'b' : 'c'} tilt={i % 2 ? 2 : -2} lift={2} contentStyle={styles.ingChip}>
                <IngredientArt name={name} size={28} shadow={false} />
                <Text style={styles.ingText}>{name}</Text>
              </PaperCard>
            </Animated.View>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.sceneArea}>
        <Animated.View key={`scene-${stepIndex}`} entering={FadeIn.duration(350)}>
          <InteractiveScene kind={sceneKind} ingredients={ingredients} size={sceneSize} onComplete={() => setGameDone(true)} />
        </Animated.View>
        {pop > 0 ? <XpPop key={`pop-${pop}`} amount={lastXp.current} /> : null}
        {pop > 0 ? <ConfettiBurst key={`burst-${pop}`} count={14} /> : null}
      </View>

      <View style={[styles.cardWrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <PaperCard shape="d" lift={6} contentStyle={styles.card}>
          <View style={styles.progress}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.seg,
                  i % 2 ? cutCorners.b : cutCorners.c,
                  { backgroundColor: i < stepIndex ? paper.green : i === stepIndex ? paper.yellow : paper.kraft },
                ]}
              />
            ))}
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            {recipe.title} · Step {stepIndex + 1} of {steps.length}
          </Text>
          <Animated.Text key={`text-${stepIndex}`} entering={FadeInRight.springify().damping(16)} style={styles.stepText}>
            {step.text}
          </Animated.Text>
          <View style={styles.nav}>
            <PaperButton
              accessibilityLabel="Previous step"
              icon={<BackIcon />}
              color={paper.kraft}
              textColor={paper.ink}
              disabled={stepIndex === 0 || busy}
              onPress={() => {
                setGameDone(false);
                setStepIndex((i) => Math.max(0, i - 1));
              }}
            />
            <PaperButton
              label={isLast ? 'Finish dish!' : 'Done!'}
              size="lg"
              color={isLast ? paper.green : paper.red}
              disabled={busy}
              onPress={handleDone}
              style={styles.flex}
            />
          </View>
        </PaperCard>
      </View>

      {finale ? (
        <Celebration
          title={recipe.title}
          earned={finale.earned}
          xpBefore={finale.before}
          xpAfter={finale.after}
          streak={finale.streak}
          onDone={() => router.back()}
          onAgain={() => {
            setFinale(null);
            earnedRef.current = 0;
            setGameDone(false);
            setStepIndex(0);
          }}
        />
      ) : null}
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingBottom: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  cardWrap: {
    paddingHorizontal: 12,
  },
  centered: {
    alignItems: 'center',
    gap: 14,
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  iconBtn: {
    alignItems: 'center',
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  ingChip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 4,
  },
  ingRow: {
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  ingScroll: {
    flexGrow: 0,
  },
  ingText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    textTransform: 'capitalize',
  },
  meta: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  missing: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 22,
  },
  nav: {
    flexDirection: 'row',
    gap: 12,
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  sceneArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  seg: {
    flex: 1,
    height: 9,
  },
  stepText: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 31,
    marginBottom: 14,
    marginTop: 4,
  },
  timer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  timerHint: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  timerText: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 18,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  xpChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  xpChipText: {
    color: paper.card,
    fontFamily: fonts.display,
    fontSize: 16,
  },
});
