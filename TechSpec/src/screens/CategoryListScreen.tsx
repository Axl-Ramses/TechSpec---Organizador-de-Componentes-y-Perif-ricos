import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeStackParamList } from "../navigation/types";
import { COMPONENTS, HardwareComponent } from "../../assets/data";
import { useTheme }       from "../context/ThemeContext";
import ComponentCard      from "../components/ComponentCard";
import EmptyState         from "../components/EmptyState";
import CustomButton       from "../components/CustomButton";

type Nav   = NativeStackNavigationProp<HomeStackParamList, "CategoryList">;
type Route = RouteProp<HomeStackParamList, "CategoryList">;

export default function CategoryListScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { theme }  = useTheme();
  const { category } = params;

  const filtered = COMPONENTS.filter(c => c.categoryId === category.id);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Sub-header coloreado */}
      <View style={[styles.subHeader, { backgroundColor: theme.brandDark }]}>
        <View style={[styles.catIcon, { backgroundColor: category.bgColor }]}>
          <Text style={styles.catEmoji}>{category.emoji}</Text>
        </View>
        <View>
          <Text style={styles.catName}>{category.name}</Text>
          <Text style={styles.catCount}>
            {filtered.length} {filtered.length === 1 ? "componente" : "componentes"}
          </Text>
        </View>
      </View>

      <FlatList<HardwareComponent>
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ComponentCard
            component={item}
            onPress={() => navigation.navigate("ComponentDetail", { component: item })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            emoji={category.emoji}
            title="Sin componentes aún"
            subtitle={`Agrega el primer componente en ${category.name}`}
          />
        }
        ListFooterComponent={
          <CustomButton
            label="+ Agregar componente"
            onPress={() => navigation.navigate("AddComponent", { categoryId: category.id })}
            variant="secondary"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  subHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    // Flexbox: fila con ícono + textos
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  catIcon: {
    width: 44, height: 44, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  catEmoji: { fontSize: 22 },
  catName:  { fontSize: 17, fontWeight: "600", color: "#fff" },
  catCount: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 1 },
  list:     { padding: 16, paddingBottom: 40 },
});
