import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validácia
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Chyba", "Vyplňte všetky polia");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Chyba", "Neplatný email");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Chyba", "Heslo musí mať aspoň 6 znakov");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Chyba", "Heslá sa nezhodujú");
      return;
    }

    setLoading(true);

    // Tu pridaj svoju logiku pre registráciu (API call, Firebase, atď.)
    try {
      // Simulácia API callu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Po úspešnej registrácii
      Alert.alert(
        "Úspech", 
        "Registrácia bola úspešná! Teraz sa môžete prihlásiť.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login")
          }
        ]
      );
    } catch (error) {
      Alert.alert("Chyba", "Registrácia zlyhala. Skúste znova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://cdn.pixabay.com/photo/2020/04/01/09/29/recycle-4999993_1280.jpg",
      }}
      style={styles.background}
      resizeMode="cover"
      blurRadius={3}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.overlay}>

            <Text style={styles.logo}>♻️</Text>
            <Text style={styles.title}>Registrácia</Text>
            <Text style={styles.subtitle}>Vytvorte si nový účet</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Celé meno</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Turbo Kokot"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>

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
                  placeholder="Minimálne 6 znakov"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Potvrďte heslo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Zopakujte heslo"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                activeOpacity={0.85}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Registruje sa..." : "Registrovať sa"}
                </Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Už máte účet? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.loginLink}>Prihlásiť sa</Text>
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
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logo: {
    fontSize: 52,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#dfe6e9",
    textAlign: "center",
    marginBottom: 40,
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#00c853",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#6c9a6f",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#dfe6e9",
    fontSize: 15,
  },
  loginLink: {
    color: "#00c853",
    fontSize: 15,
    fontWeight: "700",
  },
});