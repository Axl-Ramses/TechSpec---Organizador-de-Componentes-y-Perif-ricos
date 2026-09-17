import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { HomeStackParamList } from "../navigation/types";
import { HardwareComponent } from "../../assets/data";
import { useTheme }       from "../context/ThemeContext";
import ComponentCard      from "../components/ComponentCard";
import EmptyState         from "../components/EmptyState";
import CustomButton       from "../components/CustomButton";
import { useAppSelector } from "../store/hooks";
import { LinkedList }     from "../structures/LinkedList";

type Nav   = NativeStackNavigationProp<HomeStackParamList, "CategoryList">;
type Route = RouteProp<HomeStackParamList, "CategoryList">;

export default function CategoryListScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { theme }  = useTheme();
  const { category } = params;

  const [search, setSearch] = useState("");

  // Obtenemos los componentes globales del estado de Redux
  const allComponents = useAppSelector((state) => state.components.items);

  // ── Estructura de Datos: Lista Enlazada Simple (LinkedList<HardwareComponent>) ──
  // Construcción de la lista enlazada con los componentes de la categoría
  const categoryLinkedList = useMemo(() => {
    const list = new LinkedList<HardwareComponent>();
    const matching = allComponents.filter(c => c.categoryId === category.id);
    for (const comp of matching) {
      list.insert(comp); // Inserción O(1) con tail en la lista enlazada
    }
    return list;
  }, [allComponents, category.id]);

  // Búsqueda y filtrado utilizando los métodos propios de la Lista Enlazada
  const displayedComponents = useMemo(() => {
    if (!search.trim()) {
      return categoryLinkedList.toArray(); // Recorrido O(n) de la lista enlazada
    }
    const query = search.toLowerCase();
    return categoryLinkedList.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.model.toLowerCase().includes(query)
    );
  }, [categoryLinkedList, search]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Sub-header coloreado */}
      <View style={[styles.subHeader, { backgroundColor: theme.brandDark }]}>
        <View style={[styles.catIcon, { backgroundColor: category.bgColor }]}>
          <Text style={styles.catEmoji}>{category.emoji}</Text>
        </View>
        <View style={styles.headerTexts}>
          <Text style={styles.catName}>{category.name}</Text>
          <Text style={styles.catCount}>
            {categoryLinkedList.size()} {categoryLinkedList.size() === 1 ? "componente" : "componentes"}
          </Text>
          <View style={styles.structureBadgeWrap}>
            <Text style={styles.structureBadgeText}>
              🔗 Lista Enlazada: {categoryLinkedList.size()} nodos
            </Text>
          </View>
        </View>
      </View>

      {/* Buscador dentro de la lista enlazada */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={16} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder={`Buscar en ${category.name}...`}
            placeholderTextColor={theme.textMuted}
          />
          {search.length > 0 && (
            <Ionicons
              name="close-circle"
              size={16}
              color={theme.textMuted}
              onPress={() => setSearch("")}
            />
          )}
        </View>
      </View>

      <FlatList<HardwareComponent>
        data={displayedComponents}
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
            title={search ? "Sin coincidencias" : "Sin componentes aún"}
            subtitle={search ? `No se encontró "${search}" en esta categoría` : `Agrega el primer componente en ${category.name}`}
          />
        }
        ListFooterComponent={
          <View style={styles.footerWrap}>
            <CustomButton
              label="+ Agregar componente"
              onPress={() => navigation.navigate("AddComponent", { categoryId: category.id })}
              variant="secondary"
            />
          </View>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  catIcon: {
    width: 44, height: 44, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  catEmoji: { fontSize: 22 },
  headerTexts: { flex: 1 },
  catName:  { fontSize: 17, fontWeight: "600", color: "#fff" },
  catCount: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 1 },
  structureBadgeWrap: {
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  structureBadgeText: {
    color: "#E1F5EE",
    fontSize: 10,
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 8,
  },
  list: { padding: 16, paddingBottom: 40 },
  footerWrap: {
    marginTop: 8,
  },
});

