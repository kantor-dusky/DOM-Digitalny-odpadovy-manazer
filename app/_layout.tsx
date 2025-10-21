import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

const brand = {
  primary: "#1b5e20",   // tmavšia zelená (header, akcent)
  accent:  "#2e7d32",   // zelená na ikonách
};

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: brand.primary },
        headerTintColor: "#fff",
        headerTitle: "Digitálny odpadový manažér",
        headerTitleStyle: { fontWeight: "700" },
        headerRight: () => (
          <Link href="/profile" asChild>
            <TouchableOpacity style={{ paddingHorizontal: 12 }}>
              <MaterialCommunityIcons name="account-circle" size={26} color="#fff" />
            </TouchableOpacity>
          </Link>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Domov" }} />
      <Stack.Screen name="classify" options={{ title: "Rozpoznať odpad" }} />
      <Stack.Screen name="map" options={{ title: "Zberné miesta" }} />
    </Stack>
  );
}
