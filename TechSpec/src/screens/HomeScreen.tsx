import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeStackParamList } from "../navigation/types";
import { CATEGORIES } from "../../assets/data";
import { useAuth }       from "../context/AuthContext";
import { useTheme }      from "../context/ThemeContext";
import CategoryCard      from "../components/CategoryCard";
import ComponentCard     from "../components/ComponentCard";
import SectionTitle      from "../components/SectionTitle";
import {useAppSelector} from "../store/hooks";

type Nav = NativeStackNavigationProp<HomeStackParamList, "Home">;

export default function HomeScreen() {
  const navigation         = useNavigation<Nav>();
  const { user }           = useAuth();
  const { theme }          = useTheme();
  const components     = useAppSelector((state) => state.components.items);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.brandDark }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TechSpec</Text>
          <Text style={styles.headerSub}>Hola, {user?.name?.split(" ")[0]} 👋</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: theme.brand }]}>
          <Text style={styles.initials}>{user?.initials ?? "?"}</Text>
        </View>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner con imagen local */}
        <View style={styles.bannerWrap}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.bannerBg}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Tu setup documentado</Text>
            <Text style={styles.bannerSub}>
              {components.length} componentes registrados
            </Text>
          </View>
        </View>

        {/* Categorías — grid 2 columnas */}
        <SectionTitle title="Categorías" />
        <View style={styles.grid}>
          {CATEGORIES.map(cat => (
            <View key={cat.id} style={styles.gridCell}>
              <CategoryCard
                category={cat}
                onPress={() => navigation.navigate("CategoryList", { category: cat })}
              />
            </View>
          ))}
        </View>

        {/* Recientes */}
        <SectionTitle title="Recientes" />
        {components.slice(0, 3).map(comp => (
          <ComponentCard
            key={comp.id}
            component={comp}
            onPress={() => navigation.navigate("ComponentDetail", { component: comp })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "600", color: "#fff" },
  headerSub:   { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  initials: { fontSize: 14, fontWeight: "700", color: "#fff" },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  bannerWrap: {
    borderRadius: 14,
    overflow: "hidden",
    height: 110,
    marginBottom: 20,
    backgroundColor: "#085041",
  },
  bannerBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.15,
  },
  bannerOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-end",
  },
  bannerTitle: { fontSize: 17, fontWeight: "600", color: "#fff" },
  bannerSub:   { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
    marginBottom: 16,
  },
  gridCell: {
    width: "50%",
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
});