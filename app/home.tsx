import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const brand = {
  primary: "#1b5e20",
  accent: "#2e7d32",
  cardBg: "#ffffff",
  textDim: "#6b6b6b",
  bg: "#f5f5f5",
};

export default function Home() {
  return (
    <SafeAreaView style={s.container}>
      {/* --- HEADER --- */}
      <View style={s.header}>
        <Icon name="recycle" size={52} color={brand.accent} />
        <Text style={s.title}>Triediš? 👏</Text>
        <Text style={s.subtitle}>
          Vyber si, čo chceš dnes urobiť pre čistejšiu planétu 🌍
        </Text>
      </View>

      {/* --- GRID tlačidiel --- */}
      <View style={s.grid}>
        {/* Rozpoznanie odpadu */}
        <Pressable
          style={({ pressed }) => [s.card, pressed && s.cardPressed]}
          onPress={() => router.push("/classify")}
        >
          <Icon name="camera" size={46} color={brand.accent} />
          <Text style={s.cardTitle}>Rozpoznaj odpad</Text>
          <Text style={s.cardText}>Naskenuj predmet a zisti, kam patrí</Text>
        </Pressable>

        {/* Zberné miesta */}
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

        {/* Eko-inšpirácie */}
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.bg,
    paddingHorizontal: 18,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
    columnGap: 16,
    marginTop: 20,
  },
  card: {
    width: "45%",
    height: 160,
    backgroundColor: brand.cardBg,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center", // ← ikonka + texty presne do stredu
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    paddingHorizontal: 10,
    textAlign: "center",
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: brand.accent,
    textAlign: "center",
  },
  cardText: {
    marginTop: 6,
    fontSize: 12,
    color: brand.textDim,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingVertical: 20,
  },
  footerText: {
    color: "#777",
    fontSize: 12,
  },
});
