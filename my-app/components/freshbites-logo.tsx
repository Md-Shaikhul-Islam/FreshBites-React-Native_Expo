import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

interface FreshBitesLogoProps {
  size?: number;
}

export function FreshBitesLogo({ size = 120 }: FreshBitesLogoProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10b981" stopOpacity="1" />
            <Stop offset="100%" stopColor="#059669" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="appleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
            <Stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="forkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={isDark ? "#94a3b8" : "#64748b"} stopOpacity="1" />
            <Stop offset="100%" stopColor={isDark ? "#64748b" : "#475569"} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background Circle */}
        <Circle
          cx="100"
          cy="100"
          r="95"
          fill={isDark ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.05)"}
        />

        {/* Apple/Food Item */}
        <G transform="translate(90, 75)">
          {/* Apple body */}
          <Path
            d="M 0 -15 Q -25 -15 -30 10 Q -30 35 -10 45 Q 0 50 10 45 Q 30 35 30 10 Q 25 -15 0 -15 Z"
            fill="url(#appleGradient)"
          />
          
          {/* Apple highlight */}
          <Path
            d="M -10 -5 Q -15 0 -15 10 Q -15 20 -10 25 Q -5 20 -5 10 Q -5 0 -10 -5 Z"
            fill="rgba(255, 255, 255, 0.3)"
          />

          {/* Stem */}
          <Path
            d="M 0 -15 Q 2 -20 3 -25 Q 4 -30 5 -32"
            stroke="#8b5cf6"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Leaf */}
          <Path
            d="M 5 -32 Q 15 -35 20 -30 Q 25 -25 20 -20 Q 15 -25 5 -25 Z"
            fill="url(#leafGradient)"
          />
        </G>

        {/* Fork */}
        <G transform="translate(55, 100) rotate(-30)">
          <Path
            d="M 0 0 L 0 50 Q 0 55 5 55 Q 10 55 10 50 L 10 0"
            fill="url(#forkGradient)"
          />
          <Path
            d="M 2 0 L 2 -15 M 8 0 L 8 -15"
            stroke="url(#forkGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Circle cx="5" cy="-18" r="3" fill="url(#forkGradient)" />
        </G>

        {/* Spoon */}
        <G transform="translate(145, 100) rotate(30)">
          <Path
            d="M 5 -15 Q 0 -20 0 -25 Q 0 -30 5 -30 Q 10 -30 10 -25 Q 10 -20 5 -15 Z"
            fill="url(#forkGradient)"
          />
          <Path
            d="M 5 -15 L 5 50 Q 5 55 5 55"
            stroke="url(#forkGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </G>

        {/* Sparkle effects */}
        <G opacity="0.6">
          <Path
            d="M 165 50 L 168 55 L 165 60 L 162 55 Z"
            fill={isDark ? "#fbbf24" : "#f59e0b"}
          />
          <Path
            d="M 35 60 L 37 63 L 35 66 L 33 63 Z"
            fill={isDark ? "#fbbf24" : "#f59e0b"}
          />
          <Path
            d="M 100 25 L 103 29 L 100 33 L 97 29 Z"
            fill={isDark ? "#fbbf24" : "#f59e0b"}
          />
        </G>

        {/* Outer circle border */}
        <Circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke={isDark ? "rgba(34, 197, 94, 0.3)" : "rgba(34, 197, 94, 0.2)"}
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
