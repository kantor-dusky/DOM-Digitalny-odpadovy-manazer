import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  return (
    <View style={s.wrap}>
      <MaterialCommunityIcons name="account-circle" size={80} color="#2e7d32" />
      <Text style={s.name}>Neprihlásený používateľ</Text>
      <Text style={s.note}>Prihlásením si uložíš štatistiky a odmeny.</Text>
      <TouchableOpacity style={s.btn} onPress={() => alert("Google login – neskôr")}>
        <MaterialCommunityIcons name="google" size={18} color="#fff" />
        <Text style={s.btnText}>Pokračovať s Google</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 16 },
  name: { fontWeight: "700", fontSize: 16, color: "#1b5e20" },
  note: { color: "#6b7", textAlign: "center" },
  btn: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#1b5e20",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
