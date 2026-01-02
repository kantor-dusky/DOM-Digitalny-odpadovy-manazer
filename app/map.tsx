import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import MapView, { Callout, Marker, Region } from "react-native-maps";

const brand = {
  primary: "#1b5e20",
  accent: "#2e7d32",
  card: "#fff",
  dim: "#6b6b6b",
};

const DEFAULT_REGION: Region = {
  latitude: 48.7164,
  longitude: 21.2611,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

type PickupDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

type RecyclingPoint = {
  id: string;
  title: string;
  desc: string;
  latitude: number;
  longitude: number;
  schedule?: {
    plastic?: PickupDay[];
    paper?: PickupDay[];
    bio?: PickupDay[];
    electro?: PickupDay[];
    glass?: PickupDay[];
  };
};

const COLORS: Record<string, string> = {
  plastic: "green",
  paper: "blue",
  bio: "orange",
  electro: "purple",
  glass: "red",
};

const RECYCLING_POINTS: RecyclingPoint[] = [
  { id: "ke-sm-1", title: "Sklo – Staré Mesto", desc: "Sklenený odpad", latitude: 48.7208, longitude: 21.2574, schedule: { glass: ["mon","thu"] } },
  { id: "ke-sm-2", title: "Kontajnery – Hlavná ulica", desc: "Papier, plast", latitude: 48.7215, longitude: 21.2589, schedule: { plastic: ["mon","wed","fri"], paper: ["tue","thu"] } },
  { id: "ke-te-1", title: "Kontajnery – Terasa", desc: "Papier, plast, sklo", latitude: 48.7119, longitude: 21.2286, schedule: { plastic: ["mon","wed","fri"], paper: ["tue","thu"], glass: ["wed"] } },
  { id: "ke-te-2", title: "Elektroodpad – Terasa", desc: "Elektrospotrebiče, batérie", latitude: 48.7134, longitude: 21.2231, schedule: { electro: ["sat"] } },
  { id: "ke-kvp-1", title: "Zberný dvor – Trieda KVP", desc: "Plast, papier, sklo, elektro", latitude: 48.7086, longitude: 21.2384, schedule: { plastic: ["mon","wed","fri"], paper: ["tue","thu"], bio: ["wed"], electro: ["sat"] } },
  { id: "ke-kvp-2", title: "Bioodpad – KVP", desc: "Záhradný a kuchynský bioodpad", latitude: 48.7051, longitude: 21.2349, schedule: { bio: ["mon","thu"] } },
  { id: "ke-nj-1", title: "Elektroodpad – Nad jazerom", desc: "Batérie, malé elektro", latitude: 48.6869, longitude: 21.2731, schedule: { electro: ["sat"] } },
  { id: "ke-nj-2", title: "Kontajnery – Nad jazerom", desc: "Plast, papier, sklo", latitude: 48.6842, longitude: 21.2765, schedule: { plastic: ["mon","wed"], paper: ["tue","thu"], glass: ["wed"] } },
  { id: "ke-fu-1", title: "Kontajnery – Furča", desc: "Papier, plast", latitude: 48.7362, longitude: 21.2904, schedule: { plastic: ["mon","fri"], paper: ["tue","thu"] } },
  { id: "ke-fu-2", title: "Sklo – Furča", desc: "Sklenený odpad", latitude: 48.7381, longitude: 21.2862, schedule: { glass: ["wed"] } },
  { id: "ke-kr-1", title: "Zberný dvor – Krásna", desc: "Objemný a bioodpad", latitude: 48.6702, longitude: 21.3003, schedule: { bio: ["mon","thu"], plastic: ["wed"] } },
  { id: "ke-sa-1", title: "Kontajnery – Šaca", desc: "Papier, plast, sklo", latitude: 48.6285, longitude: 21.1796, schedule: { plastic: ["mon","fri"], paper: ["tue","thu"], glass: ["wed"] } },
  { id: "ok-1", title: "Zberný dvor – Valaliky", desc: "Komunálny a triedený odpad", latitude: 48.6319, longitude: 21.2957, schedule: { plastic: ["mon","wed"], paper: ["tue"], bio: ["thu"] } },
  { id: "ok-2", title: "Zberný dvor – Moldava nad Bodvou", desc: "Elektro, objemný odpad", latitude: 48.6146, longitude: 20.9968, schedule: { electro: ["sat"], bio: ["fri"] } },
  {
    id: "ba-central-yard",
    title: "Zberný dvor – Bratislava (hlavný)",
    desc: "Zberný dvor pre obyvateľov Bratislavy",
    latitude: 48.1698,
    longitude: 17.1114,
    schedule: { plastic: ["mon","tue","wed","thu","fri","sat"], paper: ["mon","tue","wed","thu","fri","sat"], glass: ["mon","tue","wed","thu","fri","sat"] },
  },
  {
    id: "tn-trencin-yard",
    title: "Zberný dvor – Trenčín",
    desc: "Zberný dvor mesta Trenčín, Po–So",
    latitude: 48.8945,
    longitude: 18.0448,
    schedule: { plastic: ["mon","tue","wed","thu","fri","sat"], paper: ["mon","tue","wed","thu","fri","sat"], glass: ["mon","tue","wed","thu","fri","sat"] },
  },
  {
    id: "pv-prešov-yard",
    title: "Zberný dvor – Prešov",
    desc: "Zberný dvor mesta Prešov, Po–So",
    latitude: 48.9990,
    longitude: 21.2390,
    schedule: { plastic: ["mon","tue","wed","thu","fri","sat"], paper: ["mon","tue","wed","thu","fri","sat"], glass: ["mon","tue","wed","thu","fri","sat"] },
  },
  {
    id: "nt-nitra-yard",
    title: "Zberný dvor – Nitra (NKS)",
    desc: "NKS zberný dvor, Po–So (skrátený Ne zatvorené)",
    latitude: 48.3099,
    longitude: 18.0843,
    schedule: { plastic: ["mon","tue","wed","thu","fri","sat"], paper: ["mon","tue","wed","thu","fri","sat"], glass: ["mon","tue","wed","thu","fri","sat"] },
  },
  {
    id: "tt-trnava-yard",
    title: "Zberný dvor – Trnava",
    desc: "Zberné miesta v Trnave, Po–So",
    latitude: 48.3770,
    longitude: 17.5878,
    schedule: { plastic: ["mon","tue","wed","thu","fri","sat"], paper: ["mon","tue","wed","thu","fri","sat"], glass: ["mon","tue","wed","thu","fri","sat"] },
  },
  {
    id: "za-zilina-yard",
    title: "Zberný dvor – Žilina",
    desc: "Zberný dvor Žilina (Otvorené Po–So)",
    latitude: 49.2235,
    longitude: 18.7390,
    schedule: { plastic: ["mon","tue","wed","thu","fri","sat"], paper: ["mon","tue","wed","thu","fri","sat"], glass: ["mon","tue","wed","thu","fri","sat"] },
  },
  {
    id: "bb-banskabystrica-yard",
    title: "Zberný dvor – Banská Bystrica",
    desc: "Zberný dvor (sklad recyklácie a odvoz)",
    latitude: 48.7378,
    longitude: 19.1536,
    schedule: { plastic: ["mon","tue","wed","thu","fri","sat"], paper: ["mon","tue","wed","thu","fri","sat"], glass: ["mon","tue","wed","thu","fri","sat"] },
  },
  {
    id: "lm-liptovmikulas-yard",
    title: "Zberné miesto – Liptovský Mikuláš",
    desc: "Miesto na odovzdanie odpadu (plast, papier, sklo)",
    latitude: 49.0831,
    longitude: 19.6156,
    schedule: { plastic: ["mon","tue","wed","thu","fri","sat"], paper: ["mon","tue","wed","thu","fri","sat"], glass: ["mon","tue","wed","thu","fri","sat"] },
  },
  {
    id: "to-tornaľa-yard",
    title: "Zberné suroviny – Tornaľa",
    desc: "Zberné miesto surovín (plast, papier, sklo)",
    latitude: 48.1523,
    longitude: 20.0608,
    schedule: { plastic: ["mon","tue","wed","thu","fri"], paper: ["mon","tue","wed","thu","fri"], glass: ["mon","tue","wed","thu","fri"] },
  },
  {
    id: "kk-kosice-yard",
    title: "Zberný dvor – Košice (Sever)",
    desc: "Zberný dvor – plast, papier, sklo, elektro",
    latitude: 48.7512,
    longitude: 21.2412,
    schedule: { plastic: ["mon","tue","wed","thu","fri","sat"], paper: ["mon","tue","wed","thu","fri","sat"], glass: ["mon","tue","wed","thu","fri","sat"], electro: ["sat"] },
  },
  {
    id: "pb-považska-bystrica-yard",
    title: "Zberný dvor – Považská Bystrica",
    desc: "Odpad – plast, papier, sklo",
    latitude: 49.1205,
    longitude: 18.4312,
    schedule: { plastic: ["mon","wed","fri"], paper: ["tue","thu"], glass: ["wed"] },
  },
  {
    id: "sk-skala-yard",
    title: "Zberný dvor – Skalica",
    desc: "Zberný dvor mesta Skalica",
    latitude: 48.8583,
    longitude: 17.2267,
    schedule: { plastic: ["mon","thu"], paper: ["tue","fri"], glass: ["wed"] },
  },
  {
    id: "rn-rimavska-sobota-yard",
    title: "Zberný dvor – Rimavská Sobota",
    desc: "Miesto pre plast, papier, sklo",
    latitude: 48.3841,
    longitude: 20.0245,
    schedule: { plastic: ["mon","wed"], paper: ["tue","thu"], glass: ["fri"] },
  },
  {
    id: "lv-lucenec-yard",
    title: "Zberný dvor – Lučenec",
    desc: "Zberný dvor pre mesto Lučenec",
    latitude: 48.3324,
    longitude: 19.8075,
    schedule: { plastic: ["mon","wed"], paper: ["tue","thu"], glass: ["fri"] },
  },
  {
    id: "md-martin-yard",
    title: "Zberný dvor – Martin",
    desc: "Zberný dvor – plast, papier, sklo",
    latitude: 49.0655,
    longitude: 18.9185,
    schedule: { plastic: ["mon","wed","fri"], paper: ["tue","thu"], glass: ["wed"] },
  },
  {
    id: "pb-piestany-yard",
    title: "Zberný dvor – Piešťany",
    desc: "Zberný dvor mesta Piešťany",
    latitude: 48.5948,
    longitude: 17.8285,
    schedule: { plastic: ["mon","wed"], paper: ["tue","thu"], glass: ["fri"] },
  },
  {
    id: "sk-svidnik-yard",
    title: "Zberný dvor – Svidník",
    desc: "Odpad – plast, papier, sklo",
    latitude: 49.3045,
    longitude: 21.5683,
    schedule: { plastic: ["mon","wed"], paper: ["tue","thu"], glass: ["fri"] },
  },
  {
    id: "tv-tvrdošín-yard",
    title: "Zberný dvor – Tvrdošín",
    desc: "Zberný dvor mesta – plast, papier, sklo",
    latitude: 49.1237,
    longitude: 19.4402,
    schedule: { plastic: ["mon","wed"], paper: ["tue","thu"], glass: ["fri"] },
  },
  {
    id: "sn-senec-yard",
    title: "Zberný dvor – Senec",
    desc: "Zberný dvor – plast, papier, sklo",
    latitude: 48.1849,
    longitude: 17.3441,
    schedule: { plastic: ["mon","wed"], paper: ["tue","thu"], glass: ["fri"] },
  },
];

const WASTE_LABELS: Record<keyof NonNullable<RecyclingPoint["schedule"]>, string> = {
  plastic: "Plast",
  paper: "Papier",
  glass: "Sklo",
  bio: "Bioodpad",
  electro: "Elektroodpad",
};

// 1️⃣ Zoznam sviatkov (príklad)
const HOLIDAYS: string[] = [
  "2026-01-01", // Nový rok
  "2026-01-06", // Traja králi
  "2026-04-10", // Veľký piatok
  "2026-04-13", // Veľkonočný pondelok
  "2026-05-01", // Sviatok práce
  "2026-05-08", // Deň víťazstva
  "2026-07-05", // Sviatok sv. Cyrila a Metoda
  "2026-07-06", // Deň upálenia M. Hurbana
  "2026-08-29", // Výročie SNP
  "2026-09-01", // Deň Ústavy SR
  "2026-09-15", // Sedembolestná Panna Mária
  "2026-11-01", // Všetkých svätých
  "2026-11-17", // Deň boja za slobodu a demokraciu
  "2026-12-24", // Štedrý deň
  "2026-12-25", // Prvý sviatok vianočný
  "2026-12-26", // Druhý sviatok vianočný
];

// Funkcia zisťujúca, či je otvorené daný deň
const isOpenOnDay = (schedule?: RecyclingPoint['schedule'], date?: string) => {
  if (!schedule || !date) return false;

  // ak je sviatok → zatvorené
  if (HOLIDAYS.includes(date)) return false;

  const d = new Date(date);
  const day = ["sun","mon","tue","wed","thu","fri","sat"][d.getDay()] as PickupDay;

  for (const type in schedule) {
    const days = schedule[type as keyof RecyclingPoint['schedule']] as PickupDay[] | undefined;
    if (days?.includes(day)) return true;
  }
  return false;
};

// 3️⃣ Funkcia vracajúca hodiny alebo text pre sviatok
const getOpeningHours = (schedule?: RecyclingPoint['schedule'], date?: string) => {
  if (!schedule || !date) return "Zatvorené";

  if (HOLIDAYS.includes(date)) return "Zatvorené (sviatok)";

  // tu môžeš nastaviť konkrétne hodiny podľa typu odpadu, alebo univerzálne
  return "08:00 – 16:00";
};

const formatOpenDays = (days?: PickupDay[]) => {
  if (!days || days.length === 0) return "Neotvorené";

  const dayLabels: Record<PickupDay, string> = {
    mon: "Po",
    tue: "Ut",
    wed: "St",
    thu: "Št",
    fri: "Pia",
    sat: "So",
    sun: "Ne",
  };

  return days.map(d => dayLabels[d]).join(", ");
};


export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [hasLocation, setHasLocation] = useState(false);
  const [nearestPoint, setNearestPoint] = useState<RecyclingPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<RecyclingPoint | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [legendVisible, setLegendVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      const userLat = loc.coords.latitude;
      const userLng = loc.coords.longitude;

      setRegion({
        latitude: userLat,
        longitude: userLng,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
      setHasLocation(true);
      mapRef.current?.animateToRegion({
        latitude: userLat,
        longitude: userLng,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }, 600);

      // Najbližšie miesto
      let closest: RecyclingPoint | null = null;
      let minDist = Infinity;
      for (const p of RECYCLING_POINTS) {
        const d = getDistanceKm(userLat, userLng, p.latitude, p.longitude);
        if(d < minDist){ minDist = d; closest = p; }
      }
      setNearestPoint(closest);
    })();
  }, []);

  const getDistanceKm = (lat1:number, lon1:number, lat2:number, lon2:number)=>{
    const R=6371;
    const dLat=((lat2-lat1)*Math.PI)/180;
    const dLon=((lon2-lon1)*Math.PI)/180;
    const a=Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  };

  const openDirections = async (lat: number, lng: number) => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${lat},${lng}`,
      android: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else alert("Nepodarilo sa otvoriť mapy na tomto zariadení.");
    } catch (error) {
      console.log("Chyba pri otváraní mapy:", error);
      alert("Nepodarilo sa otvoriť mapy.");
    }
  };

  const recenterOnMe = async ()=>{
    const loc=await Location.getCurrentPositionAsync({});
    const next:Region={
      latitude:loc.coords.latitude,
      longitude:loc.coords.longitude,
      latitudeDelta:0.035,
      longitudeDelta:0.035,
    };
    setRegion(next);
    mapRef.current?.animateToRegion(next,500);
  };

  // Multi-dot generovanie podľa schedule
  const generateMarkedDates = (schedule?: RecyclingPoint['schedule']) => {
  if (!schedule) return {};
  const marked: Record<string, { marked: boolean }> = {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const day = ["sun","mon","tue","wed","thu","fri","sat"][date.getDay()] as PickupDay;

    // skontroluj všetky typy odpadu a ak sú otvorené, pridaj deň
    for (const type in schedule) {
      const key = type as keyof RecyclingPoint['schedule'];
      const days = schedule[key] as PickupDay[] | undefined;
      if (days?.includes(day)) {
        const keyDate = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        marked[keyDate] = { marked: true };
        break; // stačí, že je otvorený aspoň jeden typ odpadu
      }
    }
  }
  return marked;
};

const getMarkerColor = (p: RecyclingPoint) => {
  if (!p.schedule) return brand.accent;
  // PRIORITA – špecializované odpady
  if (p.schedule.electro) return "#9b59b6"; // elektro
  if (p.schedule.bio) return "#e67e22";     // bio
  // Bežné triedenie
  if (p.schedule.glass) return "#1abc9c";   // sklo
  if (p.schedule.paper) return "#3498db";   // papier
  if (p.schedule.plastic) return "#2ecc71"; // plast

  return brand.accent;
};

const getWasteTypes = (schedule?: RecyclingPoint["schedule"]) => {
  if (!schedule) return [];
  return Object.keys(schedule) as (keyof RecyclingPoint["schedule"])[];
};


  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={s.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={setRegion}
        customMapStyle={CUSTOM_MAP_STYLE}
      >
        {RECYCLING_POINTS.map((p)=>(
          <Marker
            key={p.id}
            coordinate={{latitude:p.latitude,longitude:p.longitude}}
            title={p.title}
            description={p.desc}
            pinColor={getMarkerColor(p)}
          >
            <Callout onPress={()=>{ setSelectedPoint(p); setDetailVisible(true); }}>
              <View style={s.callout}>
                <Text style={s.calloutTitle}>{p.title}</Text>
                <Text style={s.calloutDesc}>{p.desc}</Text>
                <View style={s.dirBtn}>
                  <Icon name="navigation-variant" size={18} color="#fff"/>
                  <Text style={s.dirBtnTxt}>Navigovať</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* FAB */}
      <View style={s.fabWrap}>
        <Pressable
            style={({ pressed }) => [s.fab, pressed && s.fabPressed]}
            onPress={() => setLegendVisible(true)}>
            <Icon name="information-outline" size={22} color="#fff" />
          </Pressable>
        <Pressable style={({pressed})=>[s.fab,pressed&&s.fabPressed]} onPress={recenterOnMe}>
          <Icon name="crosshairs-gps" size={22} color="#fff"/>
        </Pressable>
        {nearestPoint && (
          <Pressable style={({pressed})=>[s.fab,pressed&&s.fabPressed]} onPress={()=>openDirections(nearestPoint.latitude,nearestPoint.longitude)}>
            <Icon name="map-marker-radius" size={22} color="#fff"/>
          </Pressable>
        )}
        <Pressable style={({pressed})=>[s.fab,pressed&&s.fabPressed]} onPress={()=>openDirections(region.latitude,region.longitude)}>
          <Icon name="navigation-variant" size={22} color="#fff"/>
        </Pressable>
      </View>

      {!hasLocation && (
        <View style={s.banner}>
          <Icon name="map-marker-alert" size={18} color={brand.accent}/>
          <Text style={s.bannerTxt}>Povoliť polohu pre presnejšie výsledky</Text>
        </View>
      )}

      {/* Modal kalendár */}
    <Modal visible={calendarVisible} transparent animationType="slide">
      <View style={s.modalOverlay}>
        <View style={s.modalContent}>
          <Text style={s.modalTitle}>{selectedPoint?.title}</Text>

      {/* Kalendár */}
      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        // zvýrazníme len vybraný deň
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: brand.primary },
        }}
        theme={{
          selectedDayBackgroundColor: brand.primary,
          todayTextColor: brand.accent,
        }}
      />

      {/* Otvorené / Zatvorené */}
      {selectedPoint && (
        <View style={{ marginTop: 12 }}>
          {HOLIDAYS.includes(selectedDate) ? (
            <Text style={{ fontSize: 16, fontWeight: "600", color: brand.dim }}>
              Zatvorené (sviatok)
            </Text>
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#2e7d32" }}>
              Otvorené 08:00 – 16:00
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={s.modalNavBtn}
        onPress={() => {
          if (selectedPoint)
            openDirections(selectedPoint.latitude, selectedPoint.longitude);
          setCalendarVisible(false);
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Navigovať na miesto</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.modalCloseBtn}
        onPress={() => setCalendarVisible(false)}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Zavrieť</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
          <Modal visible={legendVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.legendBox}>
            <Text style={s.modalTitle}>Legenda zberných miest</Text>

            <View style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: "#3498db" }]} />
              <Text>Papier</Text>
            </View>

            <View style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: "#2ecc71" }]} />
              <Text>Plast / plechovky</Text>
            </View>

            <View style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: "#1abc9c" }]} />
              <Text>Sklo</Text>
            </View>

            <View style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: "#e67e22" }]} />
              <Text>Bioodpad</Text>
            </View>

            <View style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: "#9b59b6" }]} />
              <Text>Elektroodpad</Text>
            </View>

            <TouchableOpacity
              style={s.modalCloseBtn}
              onPress={() => setLegendVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Zavrieť</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
            <Modal visible={detailVisible} transparent animationType="slide">
  <View style={s.modalOverlay}>
    <View style={s.detailBox}>
      <Text style={s.modalTitle}>{selectedPoint?.title}</Text>
      <Text style={{ color: brand.dim, marginBottom: 12 }}>
        {selectedPoint?.desc}
      </Text>

      {/* Typy odpadu */}
      <View style={s.wasteRow}>
        {getWasteTypes(selectedPoint?.schedule).map((type) => (
          <View key={type} style={s.wasteItem}>
            <View
              style={[
                s.legendDot,
                { backgroundColor: COLORS[type] },
              ]}
            />
            <Text>{WASTE_LABELS[type]}</Text>
          </View>
        ))}
      </View>

      {/* Tlačidlá */}
      <TouchableOpacity
        style={s.modalNavBtn}
        onPress={() => {
          setDetailVisible(false);
          setCalendarVisible(true);
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Zobraziť kalendár
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.modalNavBtn}
        onPress={() => {
          if (selectedPoint)
            openDirections(
              selectedPoint.latitude,
              selectedPoint.longitude
            );
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Navigovať
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.modalCloseBtn}
        onPress={() => setDetailVisible(false)}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Zavrieť
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    
    </View>
    
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:"#f5f5f5"},
  map:{flex:1},
  callout:{minWidth:220,maxWidth:260,padding:6},
  calloutTitle:{fontWeight:"700",color:brand.accent,marginBottom:2},
  calloutDesc:{color:brand.dim,marginBottom:8},
  dirBtn:{flexDirection:"row",gap:6,alignSelf:"flex-start",backgroundColor:brand.primary,paddingHorizontal:10,paddingVertical:6,borderRadius:10},
  dirBtnTxt:{color:"#fff",fontWeight:"700"},
  fabWrap:{position:"absolute",right:16,bottom:100,gap:12},
  fab:{width:48,height:48,borderRadius:24,backgroundColor:brand.primary,alignItems:"center",justifyContent:"center",shadowColor:"#000",shadowOpacity:0.2,shadowOffset:{width:0,height:2},shadowRadius:4,elevation:4},
  fabPressed:{opacity:0.9,transform:[{scale:0.98}]},
  banner:{position:"absolute",left:16,right:16,bottom:24+48+12+6,backgroundColor:"#fff",borderRadius:12,paddingHorizontal:12,paddingVertical:10,flexDirection:"row",alignItems:"center",gap:8,shadowColor:"#000",shadowOpacity:0.1,shadowOffset:{width:0,height:2},shadowRadius:6,elevation:3},
  bannerTxt:{color:brand.dim,fontSize:13,flexShrink:1},
  modalOverlay:{flex:1,backgroundColor:"rgba(0,0,0,0.4)",justifyContent:"center",alignItems:"center"},
  modalContent:{width:"90%",backgroundColor:"#fff",borderRadius:12,padding:16},
  modalTitle:{fontSize:18,fontWeight:"700",marginBottom:12,color:brand.accent},
  modalCloseBtn:{marginTop:12,backgroundColor: brand.primary,paddingVertical:10,borderRadius:8,alignItems:"center"},
  modalNavBtn:{marginTop:8,backgroundColor:brand.primary,paddingVertical:10,borderRadius:8,alignItems:"center"},
  legendBox: {
  width: "85%",
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 16,
},

legendRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
  gap: 10,
},

legendDot: {
  width: 16,
  height: 16,
  borderRadius: 8,
},

detailBox: {
  width: "90%",
  backgroundColor: "#fff",
  borderRadius: 14,
  padding: 16,
},

wasteRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
  marginBottom: 16,
},

wasteItem: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},
});

const CUSTOM_MAP_STYLE=[
  {elementType:"geometry",stylers:[{color:"#eef3ee"}]},
  {elementType:"labels.icon",stylers:[{visibility:"off"}]},
  {elementType:"labels.text.fill",stylers:[{color:"#4d4d4d"}]},
  {elementType:"labels.text.stroke",stylers:[{color:"#ffffff"}]},
  {featureType:"poi.park",elementType:"geometry",stylers:[{color:"#ddeedc"}]},
  {featureType:"water",elementType:"geometry",stylers:[{color:"#d2e7ff"}]},
];
