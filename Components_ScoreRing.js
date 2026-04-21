import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from './Constants_theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ScoreRing({ pct = 0, size = 80, strokeWidth = 8 }) {
  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animVal     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const strokeDashoffset = animVal.interpolate({
    inputRange:  [0, 100],
    outputRange: [circumference, 0],
  });

  const ringColor = pct >= 80 ? COLORS.green : pct >= 50 ? COLORS.amber : COLORS.red;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background ring */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={COLORS.bg3} strokeWidth={strokeWidth} fill="transparent"
          rotation="-90" origin={`${size / 2}, ${size / 2}`}
        />
        {/* Foreground ring */}
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={ringColor} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90" origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[styles.pctText, { color: ringColor }]}>{pct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pctText: { fontSize: 16, fontWeight: '700', letterSpacing: -0.5 },
});
