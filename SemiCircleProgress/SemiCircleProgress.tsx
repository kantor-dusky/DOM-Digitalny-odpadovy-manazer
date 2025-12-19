import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  labelTop?: string;
  centerText: string;
  bottomText?: string;
  level: number;
  colors?: {
    track?: string;
    fill?: string;
    text?: string;
  };
};

const getBadgeForLevel = (level: number) => {
  switch (level) {
    case 1: return require("../assets/badges/level1.png");
    case 2: return require("../assets/badges/level2.png");
    case 3: return require("../assets/badges/level3.png");
    case 4: return require("../assets/badges/level4.png");
    case 5: return require("../assets/badges/level5.png");
    case 6: return require("../assets/badges/level6 - unusable.png");
    default: return require("../assets/badges/level1.png");
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
  const imageSource = getBadgeForLevel(level);

  // --- MATEMATIKA PRE FIXNÝ 3/4 KRUH ---
  const radius = size / 2 - strokeWidth / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  // 3/4 kruhu je 75% obvodu
  const arcLength = circumference * 0.75; 
  
  // dashArray musí definovať: [viditeľná časť, medzera]
  // Pre pozadie (track) je to fixné
  const trackDashArray = `${arcLength} ${circumference}`;
  
  // Pre progres (fill) používame rovnaký dashArray, 
  // ale offsetom budeme "vysúvať" farbu von z viditeľnej časti
  const fillDashOffset = arcLength * (1 - Math.max(0, Math.min(1, progress)));

  // Rotácia 135 stupňov otočí kruh tak, aby otvor bol presne dole
  const rotation = 135;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* FIXNÉ POZADIE (Koľajnica) - toto sa nikdy nehýbe */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={colors.track}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={trackDashArray}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />

        {/* PROGRES - začína na rovnakom mieste ako track, ale skracuje sa offsetom */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={colors.fill}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={trackDashArray}
          strokeDashoffset={fillDashOffset}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
      </Svg>

      {/* CENTRÁLNY OBSAH */}
      <View style={styles.centerWrap}>
        <Image
          key={level}
          source={imageSource}
          style={styles.badgeImage}
          resizeMode="contain"
        />
        {labelTop && <Text style={[styles.labelTop, { color: colors.text }]}>{labelTop}</Text>}
        <Text style={[styles.centerText, { color: colors.text }]}>{centerText}</Text>
        {bottomText && <Text style={[styles.bottomText, { color: colors.text }]}>{bottomText}</Text>}
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
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10, // Mierne nadvihnutie textu kvôli spodnému otvoru
  },
  badgeImage: {
    width: 130,
    height: 130,
    marginBottom: 0,
  },
  labelTop: {
    fontSize: 12,
    letterSpacing: 1.2,
    opacity: 0.8,
  },
  centerText: {
    fontSize: 24,
    fontWeight: "900",
  },
  bottomText: {
    fontSize: 13,
    opacity: 0.7,
  },
});
