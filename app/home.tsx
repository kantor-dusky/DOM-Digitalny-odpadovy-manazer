import { MaterialCommunityIcons as Icon, MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SemiCircleProgress from "../components/SemiCircleProgress";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://reiterativ-acicularly-arely.ngrok-free.dev";

const brand = {
  primary: "#0f3a22",
  accent: "#2e7d32",
  cardBg: "#ffffff",
  textDim: "#6b6b6b",
  bg: "#f5f5f5",
  progress: "#00c853",
};

export default function Home() {
  const [points, setPoints] = useState(0);

  // Načítanie bodov pri štarte
useFocusEffect(
  useCallback(() => {
    const loadPoints = async () => {
      const storedPoints = await AsyncStorage.getItem("body");
      if (storedPoints) {
        setPoints(Number(storedPoints));
      }
    };
    loadPoints();
  }, [])
);
useEffect(() => {
  const i = setInterval(async () => {
    const p = await AsyncStorage.getItem("body");
    setPoints(Number(p));
  }, 1000); // Každé 2 sekundy skontroluje body
  return () => clearInterval(i);
}, []);

// 2. Výpočet levelu (to máš správne, nechaj to pod tým)
const step = 1000;
const level = Math.floor(points / step) + 1;
const nextLevelAt = level * step;
const progress = Math.min(1, (points % step) / step);

// 3. Uloženie levelu (toto tiež nechaj tak, ako si mal)
useEffect(() => {
  AsyncStorage.setItem("level", String(level));
}, [level]);

  // +100 bodov
  const   handleEarnPoints = async () => {
    const newPoints = 100;

    const prev = await AsyncStorage.getItem("body");
    const totalPoints = prev ? Number(prev) + newPoints : newPoints;

    await AsyncStorage.setItem("body", String(totalPoints));

    const userId = await AsyncStorage.getItem("user_id");
    const token = await AsyncStorage.getItem("token");

    if (!userId || !token) {
      Alert.alert("Chyba", "Nepodarilo sa načítať údaje používateľa.");
      return;
    }

    await fetch(`${API_BASE_URL}/update-points`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        body: totalPoints,
      }),
    });

    setPoints(totalPoints);
    Alert.alert("Úspech", `Získali ste ${newPoints} bodov!`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brand.bg }} edges={["bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          backgroundColor: brand.bg,
          paddingHorizontal: 16,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
      >
        {/* HERO */}
        <View style={s.hero}>
          <View style={s.heroTop}>
            <View style={s.levelBadge}>
              <MaterialIcons name="emoji-events" size={18} color={brand.progress} />
              <Text style={s.levelText}>Úroveň {level}</Text>
            </View>

            <Pressable onPress={() => router.push("/history")} style={s.historyBtn}>
              <MaterialIcons name="history" size={18} color="#d8f6e3" />
              <Text style={s.historyText}>História</Text>
            </Pressable>
          </View>

          {/* Polkruh */}
          <View style={s.gaugeWrap}>
            <SemiCircleProgress
              key={level}
              size={260}
              strokeWidth={18}
              progress={progress}
              labelTop="BODY"
              centerText={`Úroveň ${level}`}
              bottomText={`${points} / ${nextLevelAt}`}
              level={level} // 🔥 odosielame level sem
              colors={{
                track: "rgba(255,255,255,0.18)",
                fill: brand.progress,
                text: "#ecfff4",
              }}
            />
          </View>

          {/* Tlačidlá */}
          <View style={s.heroActions}>
            <Pressable
              style={({ pressed }) => [s.pill, pressed && s.pillPressed]}
              onPress={handleEarnPoints}
            >
              <MaterialIcons name="bolt" size={18} color="#013a20" />
              <Text style={s.pillText}>Získaj body</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.pillOutline, pressed && s.pillOutlinePressed]}
              onPress={() => router.push("/rewards")}
            >
              <MaterialIcons name="redeem" size={18} color="#b8f2cd" />
              <Text style={s.pillOutlineText}>Odmeny</Text>
            </Pressable>
          </View>
        </View>

        {/* HEADER */}
        <View style={s.header}>
          <Icon name="recycle" size={52} color={brand.accent} />
          <Text style={s.title}>Triediš? 👏</Text>
          <Text style={s.subtitle}>Vyber si, čo chceš dnes urobiť pre planétu 🌍</Text>
        </View>

        {/* GRID */}
        <View style={s.grid}>
          <Pressable style={({ pressed }) => [s.card, pressed && s.cardPressed]} onPress={() => router.push("/classify")}>
            <Icon name="camera" size={46} color={brand.accent} />
            <Text style={s.cardTitle}>Rozpoznaj odpad</Text>
            <Text style={s.cardText}>Naskenuj predmet a zisti, kam patrí</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [s.card, pressed && s.cardPressed]} onPress={() => router.push("/map")}>
            <Icon name="map-marker-radius" size={46} color={brand.accent} />
            <Text style={s.cardTitle}>Zberné miesta</Text>
            <Text style={s.cardText}>Najbližšie recyklačné body</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [s.card, pressed && s.cardPressed]} onPress={() => router.push("/education")}>
            <Icon name="lightbulb-on-outline" size={46} color={brand.accent} />
            <Text style={s.cardTitle}>Eko-inšpirácie</Text>
            <Text style={s.cardText}>Nauč sa triediť ešte lepšie 🌱</Text>
          </Pressable>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Verzia 1.0 • TUKE 2025</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hero: {
    backgroundColor: brand.primary,
    borderRadius: 24,
    padding: 18,
    marginTop: 10,
    marginBottom: 12,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between" },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: { color: "#a5f5c5", fontWeight: "800", marginLeft: 6 },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  historyText: { color: "#d8f6e3", fontWeight: "700" },
  gaugeWrap: { marginTop: 8, alignItems: "center" },
  heroActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  pill: {
    backgroundColor: "#00c853",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pillPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  pillText: { color: "#013a20", fontWeight: "900" },
  pillOutline: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#00c853",
    flexDirection: "row",
    gap: 8,
  },
  pillOutlinePressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  pillOutlineText: { color: "#c8ffd8", fontWeight: "800" },
  header: { alignItems: "center", paddingVertical: 18 },
  title: { fontSize: 26, fontWeight: "800", color: brand.accent },
  subtitle: { color: brand.textDim, marginTop: 6, textAlign: "center" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },
  card: {
    width: "47%",
    height: 164,
    backgroundColor: brand.cardBg,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  cardPressed: { transform: [{ scale: 0.98 }] },
  cardTitle: { marginTop: 10, fontSize: 16, fontWeight: "800", color: brand.accent },
  cardText: { marginTop: 6, fontSize: 12, color: brand.textDim, textAlign: "center" },
  footer: { alignItems: "center", paddingVertical: 20 },
  footerText: { color: "#777", fontSize: 12 },
});
