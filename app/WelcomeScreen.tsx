import { router } from "expo-router";
import React from "react";
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  return (
    <ImageBackground
      source={{
       uri: "https://cdn.pixabay.com/photo/2020/04/01/09/29/recycle-4999993_1280.jpg", // ✅ Public Domain / Pixabay
      }}
      style={styles.background}
      resizeMode="cover"
      blurRadius={3}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Polopriehľadný tmavý filter */}
      <View style={styles.overlay}>
        <Text style={styles.logo}>♻️</Text>
        <Text style={styles.title}>Digitálny odpadový manažér</Text>
        <Text style={styles.subtitle}>
          Triediť odpad je jednoduché – rob to múdro, rob to ekologicky 🌱
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.push("/home")}
        >
          <Text style={styles.buttonText}>Pokračovať</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>© TUKE 2025 • verzia 1.0</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  logo: {
    fontSize: 52,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#dfe6e9",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
    maxWidth: 320,
  },
  button: {
    backgroundColor: "#00c853",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 40,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    color: "#bdbdbd",
    fontSize: 13,
    textAlign: "center",
  },
});
