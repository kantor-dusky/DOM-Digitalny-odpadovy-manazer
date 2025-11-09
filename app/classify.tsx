import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const colors = {
  bg: "#f6f7f6",
  card: "#ffffff",
  text: "#1b5e20",
  icon: "#2e7d32",
  shadow: "#000",
};

// TODO: nastav na svoju adresu (napr. z ngrok): https://abc123.ngrok.io/classify
const API_URL = "https://reiterativ-acicularly-arely.ngrok-free.dev/classify";

export default function Index() {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ code: number; result: string | null } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={[s.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <Text style={s.title}>Nie je povolený prístup ku kamere 📷</Text>
        <TouchableOpacity style={s.btn} onPress={requestPermission}>
          <Text style={s.btnText}>Povoliť kameru</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  async function takePhoto() {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
      }
    } catch (e) {
      console.warn("Chyba pri fotení:", e);
      Alert.alert("Chyba", "Nepodarilo sa odfotiť obrázok.");
    }
  }

  function flipCamera() {
    setFacing((f) => (f === "back" ? "front" : "back"));
  }

  async function uploadToBackend() {
    if (!photoUri) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      setResult(null);

      const form = new FormData();
      form.append("file", {
        uri: photoUri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      const resp = await fetch(API_URL, {
        method: "POST",
        body: form,
        // ZÁMERNE nenastavuj Content-Type, nech ho určí fetch (boundary)
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Server ${resp.status}: ${txt}`);
      }

      const data = await resp.json();
      setResult(data); // { code, result }
      // voliteľne: zavri modal po úspechu
      setCameraOpen(false);
      setPhotoUri(null);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Neznáma chyba pri odosielaní");
      Alert.alert("Chyba", errorMsg ?? "Nepodarilo sa odoslať obrázok.");
    } finally {
      setLoading(false);
    }
  }

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
        <Card
          icon="lightbulb-on-outline"
          label="Tipy na triedenie"
          onPress={() => alert("Čoskoro")}
        />
        <Card
          icon="calendar"
          label="Kalendár zvozu"
          onPress={() => alert("Čoskoro")}
        />
        <Card
          icon="trophy-variant"
          label="Odznaky a odmeny"
          onPress={() => alert("Čoskoro")}
        />
      </View>

      {/* Výsledok poslednej klasifikácie */}
      {result && (
        <View style={s.resultBox}>
          <Text style={s.resultTitle}>Výsledok klasifikácie</Text>
          <Text style={s.resultLine}>EÚ kód: <Text style={s.bold}>{result.code}</Text></Text>
          <Text style={s.resultLine}>DB: <Text style={s.bold}>{result.result ?? "– bez pravidla –"}</Text></Text>
        </View>
      )}
      {errorMsg && <Text style={{ color: "crimson", marginTop: 8 }}>{errorMsg}</Text>}

      {/* FAB – rýchla akcia „Rozpoznať odpad“ */}
      <TouchableOpacity style={s.fab} onPress={() => setCameraOpen(true)}>
        <MaterialCommunityIcons name="camera" size={24} color="#fff" />
        <Text style={s.fabText}>Rozpoznať</Text>
      </TouchableOpacity>

      <Text style={s.footer}>Verzia 1.0 • TUKE 2025</Text>

      {/* --- MODÁLNE OKNO KAMERY --- */}
      <Modal visible={cameraOpen} animationType="slide" onRequestClose={() => setCameraOpen(false)}>
        <View style={s.cameraWrap}>
          {photoUri ? (
            // Náhľad po odfotení
            <>
              <Image source={{ uri: photoUri }} style={{ flex: 1 }} resizeMode="cover" />
              <View style={s.previewBar}>
                <TouchableOpacity
                  style={[s.smallBtn, { backgroundColor: "#ffffff" }]}
                  onPress={() => setPhotoUri(null)}
                >
                  <Text style={{ color: "#1b5e20", fontWeight: "700" }}>Znova</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.smallBtn, { backgroundColor: "#1b5e20", minWidth: 120, alignItems: "center" }]}
                  onPress={uploadToBackend}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <ActivityIndicator color="#fff" />
                      <Text style={{ color: "#fff", fontWeight: "700" }}>Odosielam…</Text>
                    </View>
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Použiť</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <CameraView ref={cameraRef} style={s.camera} facing={facing} />

              {/* Zavrieť */}
              <TouchableOpacity style={s.closeBtn} onPress={() => setCameraOpen(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>

              {/* Prepnúť kameru */}
              <TouchableOpacity style={s.flipBtn} onPress={flipCamera}>
                <MaterialCommunityIcons name="camera-switch" size={26} color="#fff" />
              </TouchableOpacity>

              {/* Spúšť */}
              <TouchableOpacity style={s.shutter} onPress={takePhoto} />
            </>
          )}
        </View>
      </Modal>
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
  cardText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  resultBox: {
    marginTop: 16,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  resultTitle: { color: colors.text, fontWeight: "800", fontSize: 16, marginBottom: 4 },
  resultLine: { color: colors.text, fontSize: 14, marginTop: 2 },
  bold: { fontWeight: "800" },

  fab: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#1b5e20",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  footer: { textAlign: "center", color: "#7b8", marginTop: 18, fontSize: 12 },

  cameraWrap: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 30,
  },
  flipBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 30,
  },
  shutter: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.7)",
  },
  previewBar: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 16,
  },
  smallBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btn: {
    backgroundColor: "#1b5e20",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
