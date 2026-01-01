import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

const API_BASE_URL = "https://reiterativ-acicularly-arely.ngrok-free.dev";

export default function Profile() {
  const [name, setName] = useState("Načítavam...");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedName = await AsyncStorage.getItem("name");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
    } catch (e) {
      console.error("Chyba pri načítaní dát:", e);
    }
  };

  const sendUpdateToBackend = async (newName: string) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      
      if (!userId) {
        Alert.alert("Chyba", "Nepodarilo sa nájsť ID používateľa.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: parseInt(userId),
          new_name: newName.trim()
        }),
      });

      if (response.ok) {
        await AsyncStorage.setItem("name", newName);
        setName(newName);
        Alert.alert("Úspech", "Vaše meno bolo zmenené.");
      } else {
        const data = await response.json();
        Alert.alert("Chyba", data.detail || "Nepodarilo sa aktualizovať meno.");
      }
    } catch (error) {
      Alert.alert("Chyba", "Server nie je dostupný.");
    }
  };

  const handleUpdateName = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "Upraviť meno",
        "Zadajte vaše nové meno:",
        [
          { text: "Zrušiť", style: "cancel" },
          { 
            text: "Uložiť", 
            onPress: (newName?: string) => {
              if (newName && newName.trim().length > 0) {
                sendUpdateToBackend(newName);
              }
            }
          }
        ],
        "plain-text",
        name
      );
    } else {
      Alert.alert("Info", "Zmena mena cez prompt nie je na Androide podporovaná. Pripravujeme Modal.");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Odhlásenie", "Naozaj sa chcete odhlásiť?", [
      { text: "Zrušiť", style: "cancel" },
      { 
        text: "Odhlásiť sa", 
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear(); 
          router.replace("/login"); 
        } 
      },
    ]);
  };

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <View style={s.avatar}>
          <MaterialCommunityIcons name="account" size={60} color="#fff" />
        </View>
        <Text style={s.userName}>{name}</Text>
        <Text style={s.userEmail}>{email}</Text>
      </View>

      <View style={s.menuContainer}>
        {/* 1. ZMENIŤ MENO */}
        <TouchableOpacity style={s.bigMenuItem} onPress={handleUpdateName}>
          <View style={s.row}>
            <View style={[s.iconBg, { backgroundColor: "#e8f5e9" }]}>
              <MaterialCommunityIcons name="pencil" size={26} color="#2e7d32" />
            </View>
            <Text style={s.menuText}>Zmeniť meno</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* 2. O APLIKÁCII - VRÁTENÉ SPÄŤ */}
        <TouchableOpacity 
          style={s.bigMenuItem} 
          onPress={() => Alert.alert("O aplikácii", "Odpadový Manažér v1.0\nPomáhame vám správne triediť odpad.")}
        >
          <View style={s.row}>
            <View style={[s.iconBg, { backgroundColor: "#e3f2fd" }]}>
              <MaterialCommunityIcons name="information" size={26} color="#1976d2" />
            </View>
            <Text style={s.menuText}>O aplikácii</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* 3. ODHLÁSIŤ SE */}
        <TouchableOpacity style={s.bigMenuItem} onPress={handleLogout}>
          <View style={s.row}>
            <View style={[s.iconBg, { backgroundColor: "#ffebee" }]}>
              <MaterialCommunityIcons name="logout" size={26} color="#d32f2f" />
            </View>
            <Text style={[s.menuText, { color: "#d32f2f" }]}>Odhlásiť sa</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f0" },
  header: { 
    backgroundColor: "#fff", 
    alignItems: "center", 
    paddingVertical: 50, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30, 
    elevation: 5, 
    marginBottom: 30 
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: "#2e7d32", 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 15 
  },
  userName: { fontSize: 24, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 16, color: "#777", marginTop: 5 },
  menuContainer: { paddingHorizontal: 16 },
  bigMenuItem: { 
    backgroundColor: "#fff", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingVertical: 20, 
    paddingHorizontal: 20, 
    borderRadius: 15, 
    marginBottom: 12, 
    elevation: 2 
  },
  row: { flexDirection: "row", alignItems: "center", gap: 15 },
  iconBg: { width: 45, height: 45, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  menuText: { fontSize: 18, fontWeight: "600", color: "#333" },
});
