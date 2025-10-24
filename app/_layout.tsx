import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: "#1b5e20" },
          headerTintColor: "#fff",
          headerTitle: "Odpadový manažér",
          headerTitleStyle: { fontWeight: "700" },
          headerRight: () =>
          
              <Link href="/profile" asChild>
                <TouchableOpacity style={{ paddingHorizontal: 12 }}>
                  <MaterialCommunityIcons
                    name="account-circle"
                    size={26}
                    color="#fff"
                  />
                </TouchableOpacity>
              </Link>
            ,
        })}
      >
        <Stack.Screen name="WelcomeScreen" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ title: "Domov" }} />
        <Stack.Screen name="profile" options={{ title: "Môj profil" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
