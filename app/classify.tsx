import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const colors = {
  bg: "#f6f7f6",
  card: "#ffffff",
  text: "#1b5e20",
  icon: "#2e7d32",
  shadow: "#000",
};

export default function Index() {
  return (
    <SafeAreaView style={s.container}>
      {/* Hero */}
      <View style={s.hero}>
        <MaterialCommunityIcons name="recycle" size={44} color={colors.icon} />
        <Text style={s.title}>Digitálny odpadový manažér</Text>
        <Text style={s.subtitle}>Triediť správne. Jednoducho.</Text>
      </View>

      {/* Grid kariet */}
      <View style={s.grid}>
        <Card icon="lightbulb-on-outline" label="Tipy na triedenie" onPress={() => alert("Čoskoro")} />
        <Card icon="calendar" label="Kalendár zvozu" onPress={() => alert("Čoskoro")} />
        <Card icon="trophy-variant" label="Odznaky a odmeny" onPress={() => alert("Čoskoro")} />
        
      </View>

      {/* FAB – rýchla akcia „Rozpoznať odpad“ */}
      <TouchableOpacity style={s.fab} onPress={() => router.push("/classify")}>
        <MaterialCommunityIcons name="camera" size={24} color="#fff" />
        <Text style={s.fabText}>Rozpoznať</Text>
      </TouchableOpacity>

      <Text style={s.footer}>Verzia 1.0 • TUKE 2025</Text>
    </SafeAreaView>
  );
}

function Card({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={32} color={colors.icon} />
      <Text style={s.cardText}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  hero: { alignItems: "center", marginTop: 8, marginBottom: 12 },
  title: { marginTop: 6, fontSize: 22, fontWeight: "800", color: colors.text },
  subtitle: { marginTop: 4, fontSize: 13, color: "#567", opacity: 0.9 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 14,
  },
  card: {
    width: "48%",
    height: 118,
    backgroundColor: colors.card,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 7,
    elevation: 4,
  },
  cardText: { marginTop: 8, fontSize: 14, fontWeight: "600", color: colors.text, textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#1b5e20",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: { color: "#fff", fontWeight: "700" },
  footer: { textAlign: "center", color: "#7b8", marginTop: 18, fontSize: 12 },
});
