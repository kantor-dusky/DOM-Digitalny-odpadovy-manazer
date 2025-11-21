// app/Home.tsx
import { MaterialCommunityIcons as Icon, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SemiCircleProgress from "../components/SemiCircleProgress";

const brand = {
  primary: "#0f3a22",
  accent: "#2e7d32",
  cardBg: "#ffffff",
  textDim: "#6b6b6b",
  bg: "#f5f5f5",
  progress: "#00c853",
};

export default function Home() {
  const points = 680;
  const step = 1000;
  const level = Math.floor(points / step) + 1;
  const nextLevelAt = level * step;
  const progress = Math.min(1, (points % step) / step);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: brand.bg }}
      edges={["bottom"]}>
      
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
        {/* === HERO s polkruhom === */}
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

          <View style={s.gaugeWrap}>
            <SemiCircleProgress
              size={260}
              strokeWidth={18}
              progress={progress}
              labelTop="BODY"
              centerText={`Úroveň ${level}`}
              bottomText={`${points} / ${nextLevelAt}`}
              colors={{
                track: "rgba(255,255,255,0.18)",
                fill: brand.progress,
                text: "#ecfff4",
              }}
            />
          </View>

          <View style={s.heroActions}>
            <Pressable
              style={({ pressed }) => [s.pill, pressed && s.pillPressed]}
              onPress={() => router.push("/missions")}
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

        {/* --- HLAVNÝ HEADER (ikonka + nadpis) --- */}
        <View style={s.header}>
          <Icon name="recycle" size={52} color={brand.accent} />
          <Text style={s.title}>Triediš? 👏</Text>
          <Text style={s.subtitle}>
            Vyber si, čo chceš dnes urobiť pre čistejšiu planétu 🌍
          </Text>
        </View>

        {/* --- GRID tlačidiel --- */}
        <View style={s.grid}>
          <Pressable
            style={({ pressed }) => [s.card, pressed && s.cardPressed]}
            onPress={() => router.push("/classify")}
          >
            <Icon name="camera" size={46} color={brand.accent} />
            <Text style={s.cardTitle}>Rozpoznaj odpad</Text>
            <Text style={s.cardText}>Naskenuj predmet a zisti, kam patrí</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.card, pressed && s.cardPressed]}
            onPress={() => router.push("/map")}
          >
            <Icon name="map-marker-radius" size={46} color={brand.accent} />
            <Text style={s.cardTitle}>Zberné miesta</Text>
            <Text style={s.cardText}>
              Nájdite najbližšie kontajnery alebo recyklačné body
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.card, pressed && s.cardPressed]}
            onPress={() => router.push("/education")}
          >
            <Icon name="lightbulb-on-outline" size={46} color={brand.accent} />
            <Text style={s.cardTitle}>Eko-inšpirácie</Text>
            <Text style={s.cardText}>
              Nauč sa triediť efektívnejšie a získaj motiváciu 🌱
            </Text>
          </Pressable>
        </View>

        {/* --- FOOTER --- */}
        <View style={s.footer}>
          <Text style={s.footerText}>Verzia 1.0 • TUKE 2025</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.bg,
  },

  /* ===== HERO ===== */
  hero: {
    backgroundColor: brand.primary,
    borderRadius: 24,
    padding: 18,
    marginTop: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  levelText: {
    color: "#a5f5c5",
    fontWeight: "800",
    marginLeft: 6,
    fontSize: 13,
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  historyText: {
    color: "#d8f6e3",
    fontWeight: "700",
    fontSize: 12,
  },

  gaugeWrap: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  heroActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  pill: {
    backgroundColor: "#00c853",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  pillPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  pillText: {
    color: "#013a20",
    fontWeight: "900",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  pillOutline: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#00c853",
    backgroundColor: "transparent",
  },
  pillOutlinePressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  pillOutlineText: {
    color: "#c8ffd8",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.4,
  },

  /* --- HLAVNÝ HEADER --- */
  header: {
    alignItems: "center",
    paddingVertical: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: brand.accent,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: brand.textDim,
    marginTop: 6,
    textAlign: "center",
    maxWidth: 320,
  },

  /* --- GRID --- */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
    columnGap: 16,
    marginTop: 6,
  },
  card: {
    width: "47%",
    height: 164,
    backgroundColor: brand.cardBg,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    paddingHorizontal: 10,
    textAlign: "center",
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },
  cardTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "800",
    color: brand.accent,
    textAlign: "center",
  },
  cardText: {
    marginTop: 6,
    fontSize: 12,
    color: brand.textDim,
    textAlign: "center",
  },

  /* --- FOOTER --- */
  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingVertical: 20,
  },
  footerText: { color: "#777", fontSize: 12 },
});
