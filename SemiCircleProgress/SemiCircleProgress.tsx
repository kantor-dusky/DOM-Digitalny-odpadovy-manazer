// components/SemiCircleProgress.tsx
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;        // priemer boxu (šírka komponentu)
  strokeWidth?: number; // hrúbka oblúka
  progress: number;     // 0..1
  labelTop?: string;    // malý text nad rankom (napr. "BODY")
  centerText: string;   // hlavný text v strede (napr. "Úroveň 3")
  bottomText?: string;  // doplnok pod rankom (napr. "680 / 1000")
  colors?: {
    track?: string;     // podkladový oblúk
    fill?: string;      // progresový oblúk
    text?: string;      // farba textov
  };
};

export default function SemiCircleProgress({
  size = 240,
  strokeWidth = 18,
  progress,
  labelTop,
  centerText,
  bottomText,
  colors = {
    track: "rgba(255,255,255,0.18)",
    fill: "#00c853",
    text: "#ecfff4",
  },
}: Props) {
  const radius = size / 2 - strokeWidth / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const half = circumference / 2;

  // Dash trik: kruh + dasharray len na polovicu => polkruh
  // Offset posúva „koľko je vyplnené“
  const dashArray = `${half}, ${half}`;
  const dashOffset = half * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <View style={{ width: size, aspectRatio: 1 }}>
      <Svg width={size} height={size}>

        {/* Podkladový oblúk (polkruh) */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={colors.track}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={dashArray}
          strokeLinecap="round"
          transform={`rotate(240 ${cx} ${cy})`}
      />

        {/* Vyplnenie progresu */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={colors.fill}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(180 ${cx} ${cy})`}
        />
      </Svg>

      {/* Stredové texty */}
      <View style={styles.centerWrap}>
        <Image
          source={require("../assets/badges/level5.png")}
          style={{
          width: 140,
          height: 140,
          marginBottom: 0, // posunie ho hore nad text
      }}
      resizeMode="contain"
    />
        {labelTop ? <Text style={[styles.labelTop, { color: colors.text }]}>{labelTop}</Text> : null}
        <Text style={[styles.centerText, { color: colors.text }]}>{centerText}</Text>
        {bottomText ? (
          <Text style={[styles.bottomText, { color: colors.text }]}>{bottomText}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    // posunieme stred nižšie, aby sedel s polkruhom (cca 58–62 % výšky)
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 24,
  },
  labelTop: {
    fontSize: 12,
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  centerText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  bottomText: {
    fontSize: 12,
    opacity: 0.85,
    marginTop: 4,
  },
});
