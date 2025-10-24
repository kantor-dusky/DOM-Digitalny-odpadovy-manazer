import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const brand = {
  primary: "#1b5e20",
  accent: "#2e7d32",
  textDim: "#616161",
};

export default function Education() {
  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Icon name="lightbulb-on-outline" size={46} color={brand.accent} />
          <Text style={s.title}>Eko-inšpirácie</Text>
          <Text style={s.subtitle}>
            Malé zmeny robia veľký rozdiel 🌍
          </Text>
        </View>

        {/* Sekcia 1 */}
        <View style={s.card}>
          <View style={s.iconWrap}>
            <Icon name="recycle" size={30} color={brand.accent} />
          </View>
          <Text style={s.cardTitle}>Správne triedenie</Text>
          <Text style={s.cardText}>
            Papier, plasty, kovy, sklo a bioodpad majú každý svoj kontajner. 
            Ak si nie si istý, kam niečo patrí, aplikácia ti s tým pomôže – 
            odfoť, rozpoznaj a vytrieď ♻️
          </Text>
        </View>

        {/* Sekcia 2 */}
        <View style={s.card}>
          <View style={s.iconWrap}>
            <Icon name="leaf" size={30} color={brand.accent} />
          </View>
          <Text style={s.cardTitle}>Ži zero-waste</Text>
          <Text style={s.cardText}>
            Skús vymeniť plastové tašky za plátené, nos si vlastnú fľašu 
            a obmedz jednorazové obaly. Malé kroky = veľký dopad.
          </Text>
        </View>

        {/* Sekcia 3 */}
        <View style={s.card}>
          <View style={s.iconWrap}>
            <Icon name="earth" size={30} color={brand.accent} />
          </View>
          <Text style={s.cardTitle}>Mysli globálne, konaj lokálne</Text>
          <Text style={s.cardText}>
            Každý kúsok odpadu, ktorý správne vytriediš, pomáha tvojej komunite 
            aj planéte. Zapoj sa do lokálnych čistiacich akcií alebo recyklačných projektov.
          </Text>
        </View>

        {/* Sekcia 4 – citát */}
        <View style={s.cardQuote}>
            <Icon name="format-quote-open" size={36} color={brand.accent} />
                <Text style={s.quote}>
                „Naša planéta nepotrebuje niekoľko dokonalých ekologických hrdinov.
                Potrebuje milióny ľudí, ktorí robia malé kroky každý deň.“
                </Text>
            <Icon
            name="format-quote-close"
            size={30}
            color={brand.accent}
            style={{ alignSelf: "flex-end" }}
            />
        </View>


        <View style={s.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: brand.accent,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: brand.textDim,
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  iconWrap: {
    backgroundColor: "#e8f5e9",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: brand.accent,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: brand.textDim,
    lineHeight: 20,
  },
  cardQuote: {
    backgroundColor: "#e8f5e9",
    borderRadius: 18,
    padding: 22,
    marginTop: 24,
  },
  quote: {
    fontSize: 15,
    fontStyle: "italic",
    color: brand.textDim,
    marginVertical: 10,
    textAlign: "center",
    lineHeight: 22,
  },
  footerSpace: {
    height: 40,
  },
});
