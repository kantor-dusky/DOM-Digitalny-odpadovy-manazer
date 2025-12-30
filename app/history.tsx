import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";

interface HistoryItem {
  name: string;
  count: number;
  code: number;
}

interface ChartItem {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

const API_URL = "https://reiterativ-acicularly-arely.ngrok-free.dev";
const screenWidth = Dimensions.get("window").width;

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Funkcia na načítanie histórie (zoznam)
  const fetchHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) return;

      const response = await fetch(`${API_URL}/user-history/${userId}`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Chyba pri načítaní histórie:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Funkcia na načítanie dát pre graf
  const fetchChart = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) return;
      
      const resp = await fetch(`${API_URL}/user-chart/${userId}`);
      const data = await resp.json();
      setChartData(data);
    } catch (error) {
      console.error("Chyba grafu:", error);
    }
  };

  // 3. Spustenie pri načítaní stránky
  useEffect(() => {
    fetchHistory();
    fetchChart();
  }, []);

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={s.historyCard}>
      <View style={s.iconCircle}>
        <MaterialCommunityIcons name="recycle" size={24} color="#2e7d32" />
      </View>
      <View style={s.info}>
        <Text style={s.materialName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.materialCode}>Kód: {item.code}</Text>
      </View>
      <View style={s.countBadge}>
        <Text style={s.countText}>{item.count}x</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Tvoja história</Text>
        <Text style={s.subtitle}>Pozri sa, koľko si už zachránil prírody.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1b5e20" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.code.toString()}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          ListHeaderComponent={
            chartData.length > 0 ? (
              <View style={s.chartContainer}>
                <Text style={s.chartTitle}>Rozdelenie odpadu</Text>
                <PieChart
                  data={chartData}
                  width={screenWidth - 40}
                  height={200}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  absolute
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Text style={s.emptyText}>Zatiaľ si nič nerecykloval. Začni skenovať!</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f6" },
  header: { padding: 20, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "800", color: "#1b5e20" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  list: { padding: 16 },
  
  // TU CHÝBALI TIETO ŠTÝLY:
  chartContainer: {
    backgroundColor: "#fff",
    marginBottom: 20,
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: 10,
  },
  // -------------------------

  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, marginLeft: 15 },
  materialName: { fontSize: 16, fontWeight: "700", color: "#333" },
  materialCode: { fontSize: 12, color: "#888" },
  countBadge: {
    backgroundColor: "#1b5e20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: { color: "#fff", fontWeight: "800" },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
});