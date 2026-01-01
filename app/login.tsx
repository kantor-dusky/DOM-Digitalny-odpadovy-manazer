import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView, 
  Alert, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

const API_BASE_URL = "https://reiterativ-acicularly-arely.ngrok-free.dev";

export default function Profile() {
  const [name, setName] = useState("Načítavam...");
  const [email, setEmail] = useState("");
  
  // Stavy pre Modal (okno na zmenu mena)
  const [isModalVisible, setModalVisible] = useState(false);
  const [newNameInput, setNewNameInput] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Čítame kľúče, ktoré ukladá tvoj upravený Login
      const storedName = await AsyncStorage.getItem("name");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
    } catch (e) {
      console.error("Chyba pri načítaní dát:", e);
    }
  };

  const sendUpdateToBackend = async () => {
    if (!newNameInput.trim()) {
      Alert.alert("Chyba", "Meno nemôže byť prázdne.");
      return;
    }

    setUpdating(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      
      const response = await fetch(`${API_BASE_URL}/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: parseInt(userId || "0"),
          new_name: newNameInput.trim()
        }),
      });

      if (response.ok) {
        await AsyncStorage.setItem("name", newNameInput.trim());
        setName(newNameInput.trim());
        setModalVisible(false);
        Alert.alert("Úspech", "Vaše meno bolo zmenené.");
      } else {
        Alert.alert("Chyba", "Nepodarilo sa aktualizovať meno na serveri.");
      }
    } catch (error) {
      Alert.alert("Chyba", "Server nie je dostupný.");
    } finally {
      setUpdating(false);
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
    <View style={{ flex: 1 }}>
      <ScrollView style={s.container}>
        {/* PROFILOVÁ KARTA */}
        <View style={s.header}>
          <View style={s.avatar}>
            <MaterialCommunityIcons name="account" size={60} color="#fff" />
          </View>
          <Text style={s.userName}>{name}</Text>
          <Text style={s.userEmail}>{email}</Text>
        </View>

        <View style={s.menuContainer}>
          {/* TLAČIDLO ZMENIŤ MENO */}
          <TouchableOpacity 
            style={s.bigMenuItem} 
            onPress={() => {
              setNewNameInput(name);
              setModalVisible(true);
            }}
          >
            <View style={s.row}>
              <View style={[s.iconBg, { backgroundColor: "#e8f5e9" }]}>
                <MaterialCommunityIcons name="pencil" size={26} color="#2e7d32" />
              </View>
              <Text style={s.menuText}>Zmeniť meno</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          {/* O APLIKÁCII */}
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

          {/* ODHLÁSIŤ SA */}
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

      {/* MODAL PRE ZMENU MENA (FUNGUJE NA ANDROIDE AJ IOS) */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={s.modalContent}
          >
            <Text style={s.modalTitle}>Upraviť meno</Text>
            <TextInput
              style={s.input}
              value={newNameInput}
              onChangeText={setNewNameInput}
              placeholder="Zadajte nové meno"
              autoFocus={true}
            />
            <View style={s.modalButtons}>
              <TouchableOpacity 
                style={s.modalBtn} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={s.cancelText}>ZRUŠIŤ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.modalBtn, s.saveBtn]} 
                onPress={sendUpdateToBackend}
                disabled={updating}
              >
                <Text style={s.saveText}>{updating ? "..." : "ULOŽIŤ"}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
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
    width: 100, height: 100, borderRadius: 50, 
    backgroundColor: "#2e7d32", justifyContent: "center", 
    alignItems: "center", marginBottom: 15 
  },
  userName: { fontSize: 24, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 16, color: "#777", marginTop: 5 },
  menuContainer: { paddingHorizontal: 16 },
  bigMenuItem: { 
    backgroundColor: "#fff", flexDirection: "row", 
    alignItems: "center", justifyContent: "space-between", 
    paddingVertical: 20, paddingHorizontal: 20, 
    borderRadius: 15, marginBottom: 12, elevation: 2 
  },
  row: { flexDirection: "row", alignItems: "center", gap: 15 },
  iconBg: { width: 45, height: 45, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  menuText: { fontSize: 18, fontWeight: "600", color: "#333" },

  // ŠTÝLY PRE MODAL (OKNO)
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '85%', 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 25, 
    elevation: 10 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: { 
    borderBottomWidth: 2, 
    borderBottomColor: '#2e7d32', 
    fontSize: 18, 
    paddingVertical: 8, 
    marginBottom: 25, 
    color: '#333' 
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalBtn: { paddingHorizontal: 15, paddingVertical: 10, marginLeft: 10 },
  saveBtn: { backgroundColor: '#e8f5e9', borderRadius: 8 },
  cancelText: { color: '#777', fontWeight: 'bold' },
  saveText: { color: '#2e7d32', fontWeight: 'bold' }
});
