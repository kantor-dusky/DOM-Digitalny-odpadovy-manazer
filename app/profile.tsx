import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_BASE_URL = "https://reiterativ-acicularly-arely.ngrok-free.dev";

export default function Profile() {
  const [user, setUser] = useState<{ name: string; email: string; body: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Načítanie používateľa z DB podľa user_id
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        if (!userId) {
          setLoading(false);
          return;
        }

        const resp = await fetch(`${API_BASE_URL}/users`);
        if (!resp.ok) throw new Error("Nepodarilo sa načítať údaje.");
        const data = await resp.json();

        const found = data.users.find((u: any) => String(u.id) === String(userId));
        if (found) setUser(found);
        else Alert.alert("Upozornenie", "Používateľ sa nenašiel.");
      } catch (e: any) {
        console.error(e);
        Alert.alert("Chyba", e.message || "Nepodarilo sa načítať profil.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["token", "user_id", "body", "name"]);
    setUser(null);
    // preskoč späť na prvú obrazovku (WelcomeScreen)
    router.replace("/WelcomeScreen"); // alternatívne: router.replace("/")
  };

  if (loading) {
    return (
      <View style={s.wrap}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={s.wrap}>
        <MaterialCommunityIcons name="account-circle" size={80} color="#2e7d32" />
        <Text style={s.name}>Neprihlásený používateľ</Text>
        <Text style={s.note}>Prihlásením sa ti zobrazia tvoje údaje a body.</Text>
        <TouchableOpacity style={s.btn} onPress={() => router.push("/login")}>
          <MaterialCommunityIcons name="login" size={18} color="#fff" />
          <Text style={s.btnText}>Prihlásiť sa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <MaterialCommunityIcons name="account-circle" size={100} color="#2e7d32" />
      <Text style={s.name}>{user.name}</Text>
      <Text style={s.email}>{user.email}</Text>
      <Text style={s.points}>Body: {user.body}</Text>

      <TouchableOpacity style={s.btn} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={18} color="#fff" />
        <Text style={s.btnText}>Odhlásiť sa</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 16 },
  name: { fontWeight: "700", fontSize: 22, color: "#1b5e20" },
  email: { color: "#666", fontSize: 14 },
  points: { color: "#1b5e20", fontSize: 16, fontWeight: "600", marginTop: 4 },
  note: { color: "#6b7", textAlign: "center" },
  btn: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#1b5e20",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
