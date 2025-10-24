import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const brand = {
  primary: "#1b5e20",
  accent: "#2e7d32",
  card: "#fff",
  dim: "#6b6b6b",
};

// Bratislava (fallback)
const DEFAULT_REGION: Region = {
  latitude: 48.1486,
  longitude: 17.1077,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

// Demo body – môžeš neskôr ťahať zo servera
const RECYCLING_POINTS = [
  {
    id: "rp-1",
    title: "Kontajnery – papier, plast, sklo",
    desc: "Bežné triedenie",
    latitude: 48.1498,
    longitude: 17.1122,
  },
  {
    id: "rp-2",
    title: "Zberný dvor – elektroodpad",
    desc: "TV, batérie, žiarivky",
    latitude: 48.1459,
    longitude: 17.1002,
  },
  {
    id: "rp-3",
    title: "Kompost – bioodpad",
    desc: "Záhradný bioodpad",
    latitude: 48.1532,
    longitude: 17.1061,
  },
];

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [hasLocation, setHasLocation] = useState(false);

  // Načítanie polohy používateľa
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const next: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };
      setRegion(next);
      setHasLocation(true);
      mapRef.current?.animateToRegion(next, 600);
    })();
  }, []);

  const openDirections = (lat: number, lng: number) => {
    const google = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const apple = `http://maps.apple.com/?daddr=${lat},${lng}`;
    Linking.openURL(Platform.select({ ios: apple, android: google, default: google })!);
  };

  const recenterOnMe = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    const next: Region = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.035,
      longitudeDelta: 0.035,
    };
    setRegion(next);
    mapRef.current?.animateToRegion(next, 500);
  };

  return (
    <SafeAreaView style={s.container}>
      <MapView
        ref={mapRef}
        style={s.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={setRegion}
        customMapStyle={CUSTOM_MAP_STYLE}
      >
        {RECYCLING_POINTS.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.title}
            description={p.desc}
            pinColor={brand.accent}
          >
            <Callout onPress={() => openDirections(p.latitude, p.longitude)}>
              <View style={s.callout}>
                <Text style={s.calloutTitle}>{p.title}</Text>
                <Text style={s.calloutDesc}>{p.desc}</Text>
                <View style={s.dirBtn}>
                  <Icon name="navigation-variant" size={18} color="#fff" />
                  <Text style={s.dirBtnTxt}>Navigovať</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Plávajúce tlačidlá */}
      <View style={s.fabWrap}>
        <Pressable style={({ pressed }) => [s.fab, pressed && s.fabPressed]} onPress={recenterOnMe}>
          <Icon name="crosshairs-gps" size={22} color="#fff" />
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.fab, pressed && s.fabPressed]}
          onPress={() => openDirections(region.latitude, region.longitude)}
        >
          <Icon name="navigation-variant" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Info banner */}
      {!hasLocation && (
        <View style={s.banner}>
          <Icon name="map-marker-alert" size={18} color={brand.accent} />
          <Text style={s.bannerTxt}>
            Povoliť polohu pre presnejšie výsledky
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  map: { flex: 1 },
  callout: { minWidth: 220, maxWidth: 260, padding: 6 },
  calloutTitle: { fontWeight: "700", color: brand.accent, marginBottom: 2 },
  calloutDesc: { color: brand.dim, marginBottom: 8 },
  dirBtn: {
    flexDirection: "row",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: brand.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dirBtnTxt: { color: "#fff", fontWeight: "700" },

  fabWrap: {
    position: "absolute",
    right: 16,
    bottom: 24,
    gap: 12,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: brand.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  fabPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },

  banner: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24 + 48 + 12 + 6, // nad FAB
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  bannerTxt: { color: brand.dim, fontSize: 13, flexShrink: 1 },
});

// Jemné zafarbenie máp (voliteľné)
const CUSTOM_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#eef3ee" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4d4d4d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#ddeedc" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#d2e7ff" }],
  },
];
