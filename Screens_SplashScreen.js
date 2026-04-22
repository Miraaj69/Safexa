import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  Dimensions, StatusBar, Image,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

const AnimatedCircle  = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

// ─── Timing constants ──────────────────────────────────────────────────────────
const T = {
  glowIn:      400,   // background glow fades in
  logoIn:      600,   // logo scales + fades in
  logoDelay:   300,
  ringDelay:   700,   // ring starts drawing
  ringDur:     900,   // ring fill duration
  tagDelay:    1000,  // tagline slides up
  tagDur:      500,
  pillDelay:   1300,  // CHECK · TRACK · PROTECT
  pillDur:     400,
  barDelay:    1500,  // loading bar
  barDur:      800,
  exitDelay:   2600,  // total before onDone
  exitDur:     500,   // fade out
};

export default function SplashScreen({ onDone }) {
  // ── Animated values ────────────────────────────────────────────────────────
  const glowOpacity   = useRef(new Animated.Value(0)).current;
  const logoScale     = useRef(new Animated.Value(0.6)).current;
  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const logoTranslateY= useRef(new Animated.Value(20)).current;
  const ringProgress  = useRef(new Animated.Value(0)).current;
  const tagOpacity    = useRef(new Animated.Value(0)).current;
  const tagTranslateY = useRef(new Animated.Value(16)).current;
  const pillOpacity   = useRef(new Animated.Value(0)).current;
  const pillTranslateY= useRef(new Animated.Value(12)).current;
  const barWidth      = useRef(new Animated.Value(0)).current;
  const barOpacity    = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const shineX        = useRef(new Animated.Value(-W)).current;

  // SVG ring params
  const RING_SIZE   = 200;
  const RING_STROKE = 3;
  const RING_R      = (RING_SIZE - RING_STROKE) / 2;
  const RING_CIRC   = 2 * Math.PI * RING_R;

  const strokeDashoffset = ringProgress.interpolate({
    inputRange:  [0, 1],
    outputRange: [RING_CIRC, 0],
  });

  useEffect(() => {
    const spring = (val, toValue, delay = 0, tension = 80, friction = 10) =>
      Animated.delay(delay, Animated.spring(val, { toValue, tension, friction, useNativeDriver: true }));

    const timing = (val, toValue, duration, delay = 0, easing) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(val, { toValue, duration, useNativeDriver: true, ...(easing && { easing }) }),
      ]);

    Animated.sequence([
      // 1. Background glow fades in
      Animated.timing(glowOpacity, { toValue: 1, duration: T.glowIn, useNativeDriver: true }),

      // 2. Everything else in parallel
      Animated.parallel([

        // Logo: scale up + fade in + rise
        Animated.sequence([
          Animated.delay(T.logoDelay),
          Animated.parallel([
            Animated.spring(logoScale,     { toValue: 1,   tension: 60, friction: 8,  useNativeDriver: true }),
            Animated.timing(logoOpacity,   { toValue: 1,   duration: T.logoIn, useNativeDriver: true }),
            Animated.spring(logoTranslateY,{ toValue: 0,   tension: 60, friction: 8,  useNativeDriver: true }),
          ]),
        ]),

        // Ring draws around the logo
        Animated.sequence([
          Animated.delay(T.ringDelay),
          Animated.timing(ringProgress, { toValue: 1, duration: T.ringDur, useNativeDriver: false }),
        ]),

        // Shine sweep across logo
        Animated.sequence([
          Animated.delay(T.logoDelay + 200),
          Animated.timing(shineX, { toValue: W * 2, duration: 700, useNativeDriver: true }),
        ]),

        // Tagline slides up
        Animated.sequence([
          Animated.delay(T.tagDelay),
          Animated.parallel([
            Animated.timing(tagOpacity,    { toValue: 1, duration: T.tagDur, useNativeDriver: true }),
            Animated.spring(tagTranslateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
          ]),
        ]),

        // Pills fade in
        Animated.sequence([
          Animated.delay(T.pillDelay),
          Animated.parallel([
            Animated.timing(pillOpacity,    { toValue: 1, duration: T.pillDur, useNativeDriver: true }),
            Animated.spring(pillTranslateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
          ]),
        ]),

        // Loading bar
        Animated.sequence([
          Animated.delay(T.barDelay),
          Animated.timing(barOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(T.barDelay + 100),
          Animated.timing(barWidth, { toValue: 1, duration: T.barDur, useNativeDriver: true }),
        ]),

        // Screen fade out → call onDone
        Animated.sequence([
          Animated.delay(T.exitDelay),
          Animated.timing(screenOpacity, { toValue: 0, duration: T.exitDur, useNativeDriver: true }),
        ]),
      ]),
    ]).start(() => onDone?.());
  }, []);

  const barWidthInterp = barWidth.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#070A12" />

      {/* ── Deep background ─────────────────────────────────────── */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width={W} height={H}>
          <Defs>
            <RadialGradient id="bg" cx="50%" cy="40%" r="60%">
              <Stop offset="0%"   stopColor="#1a2a4a" stopOpacity="1" />
              <Stop offset="100%" stopColor="#070A12" stopOpacity="1" />
            </RadialGradient>
            <RadialGradient id="glow" cx="50%" cy="42%" r="35%">
              <Stop offset="0%"   stopColor="#4F7CFF" stopOpacity="0.18" />
              <Stop offset="100%" stopColor="#4F7CFF" stopOpacity="0"    />
            </RadialGradient>
          </Defs>
          <Ellipse cx={W/2} cy={H*0.42} rx={W} ry={H}   fill="url(#bg)"   />
          <Ellipse cx={W/2} cy={H*0.42} rx={W*0.9} ry={H*0.4} fill="url(#glow)" />
        </Svg>
      </View>

      {/* ── Animated glow pulse behind logo ─────────────────────── */}
      <Animated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />

      {/* ── Main content ────────────────────────────────────────── */}
      <View style={styles.centerContent}>

        {/* Ring + Logo stacked */}
        <View style={styles.logoWrap}>
          {/* SVG ring that draws itself */}
          <Svg
            width={RING_SIZE} height={RING_SIZE}
            style={StyleSheet.absoluteFill}
          >
            {/* Subtle background track */}
            <Circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
              stroke="rgba(79,124,255,0.12)"
              strokeWidth={RING_STROKE}
              fill="transparent"
            />
            {/* Animated foreground arc */}
            <AnimatedCircle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
              stroke="#4F7CFF"
              strokeWidth={RING_STROKE}
              fill="transparent"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>

          {/* Logo image */}
          <Animated.View style={[
            styles.logoImageWrap,
            {
              opacity:   logoOpacity,
              transform: [{ scale: logoScale }, { translateY: logoTranslateY }],
            },
          ]}>
            <Image
              source={require('./assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />

            {/* Shine sweep overlay */}
            <Animated.View style={[
              styles.shine,
              { transform: [{ translateX: shineX }, { rotate: '20deg' }] },
            ]} />
          </Animated.View>
        </View>

        {/* App name */}
        <Animated.View style={{ opacity: tagOpacity, transform: [{ translateY: tagTranslateY }] }}>
          <Text style={styles.appName}>
            <Text style={styles.appNameWhite}>Safety</Text>
            <Text style={styles.appNameBlue}>Check</Text>
          </Text>
        </Animated.View>

        {/* Tagline pills */}
        <Animated.View style={[
          styles.pillRow,
          { opacity: pillOpacity, transform: [{ translateY: pillTranslateY }] },
        ]}>
          {['CHECK', 'TRACK', 'PROTECT'].map((label, i) => (
            <React.Fragment key={label}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{label}</Text>
              </View>
              {i < 2 && <View style={styles.dot} />}
            </React.Fragment>
          ))}
        </Animated.View>
      </View>

      {/* ── Loading bar at bottom ────────────────────────────────── */}
      <Animated.View style={[styles.barWrap, { opacity: barOpacity }]}>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: barWidthInterp }]} />
        </View>
        <Text style={styles.barLabel}>Initializing safety systems...</Text>
      </Animated.View>

      {/* ── Bottom wordmark ──────────────────────────────────────── */}
      <Animated.View style={[styles.wordmark, { opacity: pillOpacity }]}>
        <Text style={styles.wordmarkText}>SAFEXA · v2.0</Text>
      </Animated.View>
    </Animated.View>
  );
}

const LOGO_CONTAINER = 200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Glow pulse behind logo
  glowCircle: {
    position: 'absolute',
    width:  320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'transparent',
    shadowColor: '#4F7CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 80,
    elevation: 0,
    top: H * 0.5 - 280,
  },

  centerContent: {
    alignItems: 'center',
    gap: 20,
  },

  // Ring + logo container
  logoWrap: {
    width:  LOGO_CONTAINER,
    height: LOGO_CONTAINER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoImageWrap: {
    width:  148,
    height: 148,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  logoImage: {
    width:  148,
    height: 148,
  },

  // Shine sweep
  shine: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 60,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // App name
  appName: {
    fontSize: 38,
    letterSpacing: -0.5,
    marginTop: 8,
  },
  appNameWhite: {
    color: '#F0F4FF',
    fontWeight: '700',
  },
  appNameBlue: {
    color: '#4F7CFF',
    fontWeight: '700',
  },

  // Tagline pills
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(79,124,255,0.35)',
    backgroundColor: 'rgba(79,124,255,0.08)',
  },
  pillText: {
    color: '#7ea6ff',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(79,124,255,0.4)',
  },

  // Loading bar
  barWrap: {
    position: 'absolute',
    bottom: H * 0.12,
    width: W * 0.55,
    alignItems: 'center',
    gap: 10,
  },
  barTrack: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  barFill: {
    height: 2,
    backgroundColor: '#4F7CFF',
    borderRadius: 1,
    shadowColor: '#4F7CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  barLabel: {
    color: 'rgba(240,244,255,0.28)',
    fontSize: 11,
    letterSpacing: 0.3,
  },

  // Bottom wordmark
  wordmark: {
    position: 'absolute',
    bottom: 36,
  },
  wordmarkText: {
    color: 'rgba(240,244,255,0.18)',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '500',
  },
});
