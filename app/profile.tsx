import React, { useEffect, useState } from "react";
import { 
  StyleSheet, Text, TouchableOpacity, View, ScrollView, 
  Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Image 
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Nastavenie kalendára do slovenčiny
LocaleConfig.locales['sk'] = {
  monthNames: ['Január','Február','Marec','Apríl','Máj','Jún','Júl','August','September','Október','November','December'],
  monthNamesShort: ['Jan','Feb','Mar','Apr','Máj','Jún','Júl','Aug','Sep','Okt','Nov','Dec'],
  dayNames: ['Nedeľa','Pondelok','Utorok','Streda','Štvrtok','Piatok','Sobota'],
  dayNamesShort: ['Ned','Pon','Ut','Str','Štv','Pia','Sob'],
  today: "Dnes"
};
LocaleConfig.defaultLocale = 'sk';

const API_BASE_URL = "https://reiterativ-acicularly-arely.ngrok-free.dev";

const BADGES_DATA = [
  { id: 1, n: "Zelenáč", i: "sprout", g: 1, type: 'total', desc: "Tvoj prvý krok k záchrane planéty! Zrecykluj aspoň 1 kus." },
  { id: 2, n: "Eko Bojovník", i: "shield-check", g: 25, type: 'total', desc: "Už si zrecykloval slušnú kopu odpadu. Skvelá práca!" },
  { id: 3, n: "Guru", i: "auto-fix", g: 100, type: 'total', desc: "Tvoja domácnosť je takmer bezodpadová! Dosiahol si 100 kusov." },
  { id: 4, n: "Legenda", i: "trophy", g: 500, type: 'total', desc: "Si inšpiráciou pre okolie. 500 kusov je neuveriteľný výkon." },
  { id: 5, n: "Plast-Kat", i: "bottle-wine", g: 20, type: 'plastic', desc: "20 plastových fliaš zachránených pred skládkou." },
  { id: 6, n: "Pán Papiera", i: "file-document", g: 15, type: 'paper', desc: "Zachránil si ekvivalent jedného malého stromu." },
  { id: 7, n: "Sklár", i: "glass-wine", g: 10, type: 'glass', desc: "Recykluješ sklo ako profesionál. Dosiahol si 10 kusov." },
  { id: 8, n: "Vzduch", i: "weather-windy", g: 5, type: 'co2', desc: "Ušetril si prvých 5kg emisií CO2. Príroda ti ďakuje!" },
];

export default function Profile() {
  const [name, setName] = useState("Načítavam...");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [stats, setStats] = useState({ 
    total_recycled: 0, 
    co2_saved: 0,
    most_common: "Žiadny",
    plastic_count: 0,
    paper_count: 0,
    glass_count: 0
  });
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [isBadgeModalVisible, setBadgeModalVisible] = useState(false);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [newNameInput, setNewNameInput] = useState("");
  const [updating, setUpdating] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => { 
    loadUserData();
    loadReminders();
  }, []);

  const loadUserData = async () => {
    try {
      const storedName = await AsyncStorage.getItem("name");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      const userId = await AsyncStorage.getItem("userId");
      const storedImage = await AsyncStorage.getItem("profileImage");
      
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedImage) setProfileImage(storedImage);
      
      if (userId) {
        const res = await fetch(`${API_BASE_URL}/user-stats/${userId}`);
        if (res.ok) setStats(await res.json());
      }
    } catch (e) { console.error(e); }
  };

  const loadReminders = async () => {
    try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
        const res = await fetch(`${API_BASE_URL}/get-reminders/${userId}`);
        if (res.ok) {
            const data = await res.json();
            setMarkedDates(data);
        }
    } catch (e) { console.log("Chyba načítania kalendára", e); }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await AsyncStorage.setItem("profileImage", uri);
    }
  };

  const handleLogout = async () => {
    try {
        // Mažeme len prístupové údaje, fotka v AsyncStorage ostáva
        await AsyncStorage.removeItem("userId");
        await AsyncStorage.removeItem("userEmail");
        router.replace("/login");
    } catch (e) {
        console.error("Chyba pri odhlásení", e);
    }
  };

  const handleResetStats = () => {
  Alert.alert(
    "Resetovať štatistiky?",
    "Tento krok vymaže tvoju históriu recyklácie a body. Naozaj chceš pokračovať?",
    [
      { text: "Zrušiť", style: "cancel" },
      { 
        text: "Áno, resetovať", 
        style: "destructive", 
        onPress: async () => {
          try {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) return;

            // Voláme DELETE metódu a ID dávame priamo do URL podľa tvojho API
            const res = await fetch(`${API_BASE_URL}/reset-stats/${userId}`, {
              method: 'DELETE',
              headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
              }
            });

            if (res.ok) {
              // Ak server odpovedal úspešne, vynulujeme to aj v aplikácii (v stave)
              setStats({ 
                total_recycled: 0, 
                co2_saved: 0, 
                most_common: "Žiadny",
                plastic_count: 0, 
                paper_count: 0, 
                glass_count: 0 
              });
              Alert.alert("Hotovo", "Tvoje štatistiky boli úspešne vynulované.");
            } else {
              const errorData = await res.json();
              Alert.alert("Chyba", errorData.detail || "Nepodarilo sa resetovať dáta.");
            }
          } catch (e) {
            console.error(e);
            Alert.alert("Chyba", "Nepodarilo sa spojiť so serverom.");
          }
        } 
      }
    ]
  );
};

  const handleDayPress = async (day: any) => {
    const userId = await AsyncStorage.getItem("userId");
    Alert.alert(
        "Nový odvoz",
        `Chceš pridať pripomienku odvozu na ${day.dateString}?`,
        [
            { text: "Zrušiť", style: "cancel" },
            { text: "Pridať", onPress: async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/add-reminder`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: parseInt(userId || "0"),
                            date: day.dateString,
                            waste_type: "Všeobecný"
                        })
                    });
                    if (res.ok) {
                        loadReminders();
                        Alert.alert("Uložené", "Termín odvozu bol pridaný.");
                    }
                } catch (e) { console.error(e); }
            }}
        ]
    );
  };

  const handleUpdateName = async () => {
    if (!newNameInput.trim()) return;
    setUpdating(true);
    try {
        const userId = await AsyncStorage.getItem("userId");
        const res = await fetch(`${API_BASE_URL}/update-profile`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                user_id: parseInt(userId || "0"), 
                new_name: newNameInput.trim() 
            })
        });
        
        if (res.ok) {
            setName(newNameInput.trim());
            await AsyncStorage.setItem("name", newNameInput.trim());
            setModalVisible(false);
            Alert.alert("Úspech", "Meno bolo zmenené.");
        } else {
            Alert.alert("Chyba", "Server neprijal zmenu mena.");
        }
    } catch (e) { Alert.alert("Chyba", "Nepodarilo sa spojiť so serverom."); }
    setUpdating(false);
  };

  const getProgress = (badge: any) => {
    switch(badge.type) {
      case 'plastic': return stats.plastic_count || 0;
      case 'paper': return stats.paper_count || 0;
      case 'glass': return stats.glass_count || 0;
      case 'co2': return stats.co2_saved || 0;
      default: return stats.total_recycled || 0;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f2f0" }}>
      <ScrollView>
        <View style={s.header}>
          <TouchableOpacity style={s.avatar} onPress={pickImage}>
            {profileImage ? (
                <Image source={{ uri: profileImage }} style={s.avatarImg} />
            ) : (
                <MaterialCommunityIcons name="camera-plus" size={40} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={s.userName}>{name}</Text>
          <Text style={s.userEmail}>{email}</Text>
        </View>

        <View style={s.statsContainer}>
          <View style={s.statCard}>
            <MaterialCommunityIcons name="recycle" size={24} color="#2e7d32" />
            <Text style={s.statValue}>{stats.total_recycled}</Text>
            <Text style={s.statLabel}>Kusov</Text>
          </View>
          <View style={s.statCard}>
            <MaterialCommunityIcons name="leaf" size={24} color="#2e7d32" />
            <Text style={s.statValue}>{stats.co2_saved}kg</Text>
            <Text style={s.statLabel}>Ušetrené CO2</Text>
          </View>
        </View>

        <View style={s.badgeContainer}>
          <Text style={s.sectionTitle}>Moje Odznaky</Text>
          <View style={s.badgeGrid}>
            {BADGES_DATA.map((b) => {
              const currentVal = getProgress(b);
              const isUnlocked = currentVal >= b.g;
              return (
                <TouchableOpacity key={b.id} style={s.badgeItem} onPress={() => { setSelectedBadge({...b, currentVal}); setBadgeModalVisible(true); }}>
                  <View style={[s.badgeIconCircle, { 
                    borderColor: isUnlocked ? '#2e7d32' : '#ccc',
                    backgroundColor: isUnlocked ? '#e8f5e9' : '#f5f5f5'
                  }]}>
                    <MaterialCommunityIcons name={b.i as any} size={28} color={isUnlocked ? "#2e7d32" : "#999"} />
                  </View>
                  <Text style={[s.badgeText, { color: isUnlocked ? "#333" : "#999" }]} numberOfLines={1}>{b.n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.menuContainer}>
          <TouchableOpacity style={s.bigMenuItem} onPress={() => setCalendarVisible(true)}>
             <View style={s.row}><View style={[s.iconBg, {backgroundColor:'#e3f2fd'}]}><MaterialCommunityIcons name="calendar-clock" size={24} color="#1976d2" /></View><Text style={s.menuText}>Pripomienky odvozu</Text></View>
          </TouchableOpacity>

          <TouchableOpacity style={s.bigMenuItem} onPress={() => {setNewNameInput(name); setModalVisible(true);}}>
             <View style={s.row}><View style={[s.iconBg, {backgroundColor:'#e8f5e9'}]}><MaterialCommunityIcons name="pencil" size={24} color="#2e7d32" /></View><Text style={s.menuText}>Zmeniť meno</Text></View>
          </TouchableOpacity>

          <TouchableOpacity style={s.bigMenuItem} onPress={handleResetStats}>
             <View style={s.row}><View style={[s.iconBg, {backgroundColor:'#fff0f0'}]}><MaterialCommunityIcons name="refresh" size={24} color="#d32f2f" /></View><Text style={[s.menuText, {color: "#d32f2f"}]}>Resetovať štatistiky</Text></View>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.bigMenuItem} onPress={handleLogout}>
             <View style={s.row}><View style={[s.iconBg, {backgroundColor:'#ffebee'}]}><MaterialCommunityIcons name="logout" size={24} color="#d32f2f" /></View><Text style={[s.menuText, {color: "#d32f2f"}]}>Odhlásiť sa</Text></View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL PRE KALENDÁR */}
      <Modal visible={isCalendarVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.calendarModalContent}>
            <Text style={s.modalTitle}>Harmonogram odvozu</Text>
            <Calendar
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={{
                todayTextColor: '#2e7d32',
                selectedDayBackgroundColor: '#2e7d32',
                arrowColor: '#2e7d32',
              }}
            />
            <TouchableOpacity style={[s.closeBtn, {marginTop: 20}]} onPress={() => setCalendarVisible(false)}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>ZAVRIEŤ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL PRE DETAIL ODZNAKU */}
      <Modal visible={isBadgeModalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.badgeModalContent}>
            {selectedBadge && (
              <>
                <MaterialCommunityIcons name={selectedBadge.i} size={80} color={selectedBadge.currentVal >= selectedBadge.g ? "#2e7d32" : "#ccc"} />
                <Text style={s.modalTitle}>{selectedBadge.n}</Text>
                <Text style={s.badgeDesc}>{selectedBadge.desc}</Text>
                <View style={s.progressContainer}>
                    <Text style={s.progressText}>Progres: {selectedBadge.currentVal} / {selectedBadge.g}</Text>
                    <View style={s.progressBarBg}>
                        <View style={[s.progressBarFill, { width: `${Math.min((selectedBadge.currentVal / selectedBadge.g) * 100, 100)}%` }]} />
                    </View>
                </View>
                <TouchableOpacity style={s.closeBtn} onPress={() => setBadgeModalVisible(false)}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>ZAVRIEŤ</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL PRE ZMENU MENA */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <KeyboardAvoidingView behavior="padding" style={s.modalContent}>
            <Text style={s.modalTitle}>Upraviť meno</Text>
            <TextInput style={s.input} value={newNameInput} onChangeText={setNewNameInput} autoFocus />
            <View style={s.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={s.cancelText}>ZRUŠIŤ</Text></TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleUpdateName} disabled={updating}>
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
  header: { backgroundColor: "#fff", alignItems: "center", paddingVertical: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4, marginBottom: 15 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#2e7d32", justifyContent: "center", alignItems: "center", marginBottom: 10, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  userName: { fontSize: 22, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 14, color: "#777" },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -35, paddingHorizontal: 20 },
  statCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, alignItems: 'center', width: '44%', elevation: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32', marginTop: 5 },
  statLabel: { fontSize: 12, color: '#999' },
  badgeContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeItem: { width: '23%', alignItems: 'center', marginBottom: 15 },
  badgeIconCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  badgeText: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  menuContainer: { padding: 20 },
  bigMenuItem: { backgroundColor: "#fff", flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 15 },
  iconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuText: { fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  calendarModalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 25, padding: 20, alignItems: 'center' },
  badgeModalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 30, padding: 30, alignItems: 'center' },
  badgeDesc: { textAlign: 'center', color: '#666', marginBottom: 20, fontSize: 16 },
  progressContainer: { width: '100%', marginBottom: 25 },
  progressText: { fontSize: 14, color: '#333', marginBottom: 5, fontWeight: 'bold' },
  progressBarBg: { width: '100%', height: 10, backgroundColor: '#eee', borderRadius: 5 },
  progressBarFill: { height: '100%', backgroundColor: '#2e7d32', borderRadius: 5 },
  closeBtn: { backgroundColor: '#2e7d32', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  input: { borderBottomWidth: 2, borderBottomColor: '#2e7d32', fontSize: 18, marginBottom: 20, color: '#333' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20 },
  saveBtn: { backgroundColor: '#e8f5e9', padding: 10, borderRadius: 8 },
  saveText: { color: '#2e7d32', fontWeight: 'bold' },
  cancelText: { color: '#777', padding: 10 }
});
