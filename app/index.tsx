import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="recycle" size={42} color="#2e7d32" />
        <Text style={styles.title}>Digitálny odpadový manažér</Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => router.push("/classify")}>
          <Icon name="camera" size={38} color="#2e7d32" />
          <Text style={styles.cardText}>Rozpoznať odpad</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.card} onPress={() => alert("Funkcia čoskoro dostupná!")}>
          <Icon name="lightbulb-on-outline" size={38} color="#2e7d32" />
          <Text style={styles.cardText}>Tipy na triedenie</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert("Prihlásenie zatiaľ neaktívne")}>
          <Icon name="account" size={38} color="#2e7d32" />
          <Text style={styles.cardText}>Môj profil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Verzia 1.0 • TUKE 2025</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2e7d32",
    marginTop: 8,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginTop: 20,
  },
  card: {
    backgroundColor: "white",
    width: "42%",
    height: 130,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#2e7d32",
  },
  footer: {
    alignItems: "center",
    marginTop: 30,
  },
  footerText: {
    color: "#777",
    fontSize: 13,
  },
});
