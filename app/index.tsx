import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/WelcomeScreen" />;
}

