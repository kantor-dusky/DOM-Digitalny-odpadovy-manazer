import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;          // priemer boxu
  strokeWidth?: number;   // hrúbka oblúka
  progress: number;       // 0..1
  labelTop?: string;      // text hore
  centerText: string;     // text v strede
  bottomText?: string;    // text dole
  level: number;          // LEVEL sem prichádza priamo z Home.tsx
  colors?: {
    track?: string;
    fill?: string;
    text?: string;
  };
};

// Funkcia na výber správneho badge podľa levelu
const getBadgeForLevel = (level: number) => {
  console.log("🟢 getBadgeForLevel, level =", level);

  switch (level) {
    case 1:
      return require("../assets/badges/level1.png");
    case 2:
      return require("../assets/badges/level2.png");
    case 3:
      return require("../assets/badges/level3.png");
    case 4:
      return require("../assets/badges/level4.png");
    case 5:
      return require("../assets/badges/level5.png");
    case 6:
      return require("../assets/badges/level6 - unusable.png");
    default:
      return require("../assets/badges/level1.png");
  }
};

export default function SemiCircleProgress({
  size = 240,
  strokeWidth = 18,
  progress,
  labelTop,
  centerText,
  bottomText,
  level,
  colors = {
    track: "rgba(255,255,255,0.18)",
    fill: "#00c853",
    text: "#ecfff4",
  },
}: Props) {

  console.log("🔵 SemiCircleProgress props level =", level, "progress =", progress);

  const imageSource = getBadgeForLevel(level);

  const radius = size / 2 - strokeWidth / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const half = circumference / 2;

  const dashArray = `${half}, ${half}`;
  const dashOffset = half * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <View style={{ width: size, aspectRatio: 1 }}>
      <Svg width={size} height={size}>

        {/* Pozadie polkruhu */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={colors.track}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={dashArray}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
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
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>

      {/* TEXT + BADGE */}
      <View style={styles.centerWrap}>
        <Image
          key={level}
          source={imageSource}
          style={{
            width: 140,
            height: 140,
            marginBottom: 0,
          }}
          resizeMode="contain"
        />

        {labelTop ? (
          <Text style={[styles.labelTop, { color: colors.text }]}>{labelTop}</Text>
        ) : null}

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
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 24,
  },
  labelTop: {
    fontSize: 12,
    letterSpacing: 1.5,
    opacity: 0.9,
    marginTop: 4,
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
