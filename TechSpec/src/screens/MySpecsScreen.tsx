import React, { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { HardwareComponent, CATEGORIES } from "../../assets/data";
import { MySpecsStackParamList } from "../navigation/types";
import { useTheme }      from "../context/ThemeContext";
import { useStructures } from "../context/StructuresContext";
import ComponentCard     from "../components/ComponentCard";
import EmptyState        from "../components/EmptyState";
import SectionTitle      from "../components/SectionTitle";
import { useAppSelector } from "../store/hooks";
import {
  mergeSort, quickSort, byText, dateToNumber,
  Comparator, SortMetrics,
} from "../structures";

type Nav = NativeStackNavigationProp<MySpecsStackParamList, "MySpecs">;

// ── Criterios de ordenamiento disponibles ────────────────────────────────────
type SortKey = "name" | "updated" | "category" | "specs";

interface SortOption {
  key:        SortKey;
  label:      string;
  algorithm:  "merge" | "quick";
  comparator: Comparator<HardwareComponent>;
}

const categoryName = (id: string) =>
  CATEGORIES.find(c => c.id === id)?.name ?? id;

const SORT_OPTIONS: SortOption[] = [
  {
    key: "name", label: "Nombre A-Z", algorithm: "merge",
    comparator: (a, b) => byText(a.name, b.name),
  },
  {
    key: "updated", label: "Más reciente", algorithm: "merge",
    // Orden descendente: la fecha mayor primero
    comparator: (a, b) => dateToNumber(b.updatedAt) - dateToNumber(a.updatedAt),
  },
  {
    key: "category", label: "Categoría", algorithm: "quick",
    comparator: (a, b) => {
      const byCat = byText(categoryName(a.categoryId), categoryName(b.categoryId));
      // Desempate alfabético dentro de la misma categoría
      return byCat !== 0 ? byCat : byText(a.name, b.name);
    },
  },
  {
    key: "specs", label: "Más specs", algorithm: "quick",
    comparator: (a, b) => (b.specs?.length ?? 0) - (a.specs?.length ?? 0),
  },
];

export default function MySpecsScreen() {
  const navigation     = useNavigation<Nav>();
  const { theme }      = useTheme();
  const  components    = useAppSelector((state) => state.components.items);
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  // ── Estructura de Datos: Cola (Queue - FIFO) ──
  const { comparisonQueueSize, comparisonQueueCapacity } = useStructures();

  /**
   * Filtrado lineal O(n) + ordenamiento con algoritmos implementados a mano
   * (Merge Sort / Quick Sort). Se registran las comparaciones realizadas para
   * mostrarlas en la interfaz.
   */
  const { visible, metrics } = useMemo<{ visible: HardwareComponent[]; metrics: SortMetrics }>(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? components.filter(c =>
          c.name.toLowerCase().includes(query) ||
          c.model.toLowerCase().includes(query)
        )
      : components;

    const option = SORT_OPTIONS.find(o => o.key === sortKey) ?? SORT_OPTIONS[0];
    const result = option.algorithm === "merge"
      ? mergeSort(filtered, option.comparator)
      : quickSort(filtered, option.comparator);

    return { visible: result.sorted, metrics: result.metrics };
  }, [components, search, sortKey]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.brandDark }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis specs</Text>
        <Text style={styles.headerSub}>{components.length} componentes</Text>
      </View>

      <View style={[styles.body, { backgroundColor: theme.background }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar componentes..."
            placeholderTextColor={theme.textMuted}
          />
          {search.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.textMuted}
              onPress={() => setSearch("")}
            />
          )}
        </View>

        {/* Banner de la Cola de Comparación (FIFO) */}
        {comparisonQueueSize > 0 && (
          <TouchableOpacity
            style={[styles.compareBanner, { backgroundColor: theme.card, borderColor: theme.brand }]}
            onPress={() => navigation.navigate("Compare")}
            activeOpacity={0.85}
          >
            <Ionicons name="git-compare-outline" size={20} color={theme.brand} />
            <View style={styles.compareTexts}>
              <Text style={[styles.compareTitle, { color: theme.text }]}>
                Comparar {comparisonQueueSize} {comparisonQueueSize === 1 ? "componente" : "componentes"}
              </Text>
              <Text style={[styles.compareSub, { color: theme.textMuted }]}>
                Cola FIFO {comparisonQueueSize}/{comparisonQueueCapacity} · Toque para ver la tabla
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}

        {/* Selector de ordenamiento */}
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map(option => {
            const selected = option.key === sortKey;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: selected ? theme.brandLight : theme.card,
                    borderColor:     selected ? theme.brand      : theme.border,
                    borderWidth:     selected ? 1.2 : 0.6,
                  },
                ]}
                onPress={() => setSortKey(option.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    {
                      color: selected ? theme.brand : theme.textSub,
                      fontWeight: selected ? "600" : "400",
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Métricas reales del algoritmo ejecutado */}
        <Text style={[styles.metricsText, { color: theme.textMuted }]}>
          {metrics.algorithm} · {metrics.comparisons} comparaciones
          {metrics.swaps > 0 ? ` · ${metrics.swaps} intercambios` : ""}
        </Text>

        <SectionTitle title={search ? `${visible.length} resultados` : "Todos"} />

        <FlatList<HardwareComponent>
          data={visible}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ComponentCard
              component={item}
              onPress={() => navigation.navigate("ComponentDetail", { component: item })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              emoji={search ? "🔍" : "📦"}
              title={search ? "Sin resultados" : "Sin componentes aún"}
              subtitle={search
                ? `No se encontró "${search}"`
                : "Agrega tu primera ficha desde la pestaña Agregar"}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "600", color: "#fff" },
  headerSub:   { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  body: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 11,
  },

  // Banner de la cola de comparación
  compareBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  compareTexts: { flex: 1 },
  compareTitle: { fontSize: 13, fontWeight: "600" },
  compareSub:   { fontSize: 11, marginTop: 1 },

  // Chips de ordenamiento
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sortChipText: { fontSize: 12 },

  metricsText: {
    fontSize: 10,
    marginTop: 8,
    fontWeight: "500",
  },
});
