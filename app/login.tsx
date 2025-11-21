import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://reiterativ-acicularly-arely.ngrok-free.dev";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Chyba", "Vyplňte všetky polia");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Chyba", "Neplatný email");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Úspech", "Prihlásenie bolo úspešné!");
        
        await AsyncStorage.setItem("token", data.access_token);
        await AsyncStorage.setItem("user_id", String(data.user_id));
        await AsyncStorage.setItem("name", data.name);
        await AsyncStorage.setItem("body", String(data.body)); 

        console.log("Body:", data.body); 

        router.replace("/home");
      } else {
        Alert.alert("Chyba", data.detail || "Prihlásenie zlyhalo. Skúste znova.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Chyba", "Nepodarilo sa pripojiť k serveru. Skontrolujte pripojenie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://cdn.pixabay.com/photo/2020/04/01/09/29/recycle-4999993_1280.jpg" }}
      style={styles.background}
      resizeMode="cover"
      blurRadius={3}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.overlay}>
            <Text style={styles.logo}>♻️</Text>
            <Text style={styles.title}>Prihlásenie</Text>
            <Text style={styles.subtitle}>Vitajte späť!</Text>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="vas@email.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Heslo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity style={styles.forgotPassword} onPress={() => Alert.alert("Info", "Funkcia obnovy hesla")}>
                <Text style={styles.forgotPasswordText}>Zabudli ste heslo?</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? "Prihlasovanie..." : "Prihlásiť sa"}</Text>
              </TouchableOpacity>
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Nemáte účet? </Text>
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <Text style={styles.registerLink}>Zaregistrovať sa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", paddingHorizontal: 32, paddingVertical: 60 },
  logo: { fontSize: 52, marginBottom: 10 },
  title: { fontSize: 32, fontWeight: "800", textAlign: "center", color: "#fff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#dfe6e9", textAlign: "center", marginBottom: 40 },
  form: { width: "100%", maxWidth: 400 },
  inputContainer: { marginBottom: 20 },
  label: { color: "#fff", fontSize: 14, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "rgba(255,255,255,0.9)", paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, fontSize: 16, color: "#333" },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPasswordText: { color: "#00c853", fontSize: 14, fontWeight: "600" },
  button: { backgroundColor: "#00c853", paddingVertical: 16, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 6, marginBottom: 20 },
  buttonDisabled: { backgroundColor: "#6c9a6f" },
  buttonText: { fontSize: 18, fontWeight: "700", color: "#fff", textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 },
  registerContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  registerText: { color: "#dfe6e9", fontSize: 15 },
  registerLink: { color: "#00c853", fontSize: 15, fontWeight: "700" },
});
