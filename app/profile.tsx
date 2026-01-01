import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// 1. DÔLEŽITÉ: Musíš mať tento import pre prácu s pamäťou
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

export default function Profile() {
  const [name, setName] = useState("Načítavam...");
  const [email, setEmail] = useState("");

  // Načítanie dát pri otvorení obrazovky
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
    } catch (e) {
      console.error("Chyba pri načítaní dát:", e);
    }
  };

  // 2. OPRAVENÁ FUNKCIA ODHLÁSENIA
  const handleLogout = async () => {
    Alert.alert(
      "Odhlásenie",
      "Naozaj sa chcete odhlásiť?",
      [
        { text: "Zrušiť", style: "cancel" },
        { 
          text: "Odhlásiť sa", 
          style: "destructive",
          onPress: async () => {
            try {
              // Vymaže všetky uložené údaje (meno, email, token)
              await AsyncStorage.clear(); 
              // Vráti používateľa na prihlasovaciu obrazovku
              router.replace("/login"); 
            } catch (e) {
              Alert.alert("Chyba", "Nepodarilo sa odhlásiť.");
            }
          } 
        },
      ]
    );
  };

  return (
    <ScrollView style={s.container}>
      {/* VRCHNÁ ČASŤ - PROFILOVÁ KARTA */}
      <View style={s.header}>
        <View style={s.avatar}>
          <MaterialCommunityIcons name="account" size={60} color="#fff" />
        </View>
        <Text style={s.userName}>{name}</Text>
        <Text style={s.userEmail}>{email}</Text>
      </View>

      <View style={s.menuContainer}>
        {/* 1. UPRAVIŤ PROFIL */}
        <TouchableOpacity 
          style={s.bigMenuItem} 
          onPress={() => Alert.alert("Funkcia", "Táto funkcia bude dostupná čoskoro.")}
        >
          <View style={s.row}>
            <View style={[s.iconBg, { backgroundColor: "#e8f5e9" }]}>
              <MaterialCommunityIcons name="pencil" size={26} color="#2e7d32" />
            </View>
            <Text style={s.menuText}>Upraviť profil</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* 2. O APLIKÁCII */}
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
        <TouchableOpacity 
          style={[s.bigMenuItem, { borderBottomWidth: 0 }]} 
          onPress={handleLogout}
        >
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
  container: { 
    flex: 1, 
    backgroundColor: "#f0f2f0" 
  },
  header: { 
    backgroundColor: "#fff", 
    alignItems: "center", 
    paddingVertical: 50, 
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
  userName: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#333" 
  },
  userEmail: { 
    fontSize: 16, 
    color: "#777", 
    marginTop: 5 
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  bigMenuItem: { 
    backgroundColor: "#fff",
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingVertical: 20, 
    paddingHorizontal: 20, 
    borderRadius: 15,
    marginBottom: 12, 
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  row: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 15 
  },
  iconBg: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  menuText: { 
    fontSize: 18, 
    fontWeight: "600",
    color: "#333" 
  },
});
