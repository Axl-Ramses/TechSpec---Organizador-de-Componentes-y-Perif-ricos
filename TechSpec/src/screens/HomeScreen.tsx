import React, { useMemo } from "react";
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
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { addComponent } from "../store/componentsSlice";
import { useStructures } from "../context/StructuresContext";
import { TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Nav = NativeStackNavigationProp<HomeStackParamList, "Home">;

export default function HomeScreen() {
  const navigation         = useNavigation<Nav>();
  const dispatch           = useAppDispatch();
  const { user }           = useAuth();
  const { theme }          = useTheme();
  const components         = useAppSelector((state) => state.components.items);

  // Conteo real de componentes por categoría (O(n)), en vez del contador
  // estático de assets/data.ts que nunca refleja el inventario del usuario.
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const comp of components) {
      counts[comp.categoryId] = (counts[comp.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [components]);

  // ── Estructura de Datos: Pila (Stack - LIFO) ──
  const {
    recentlyViewed,
    popRecentlyViewed,
    clearRecentlyViewed,
    recentlyViewedStackSize,
    canUndo,
    popUndo,
    peekUndo,
    undoStackSize,
  } = useStructures();

  const handlePopRecent = () => {
    const popped = popRecentlyViewed();
    if (popped) {
      Alert.alert("Pila LIFO: Desapilar", `Se desapiló: ${popped.name}`);
    }
  };

  const handleUndoDelete = async () => {
    const lastDeleted = peekUndo();
    if (!lastDeleted) return;

    Alert.alert(
      "Restaurar componente",
      `¿Deseas restaurar "${lastDeleted.name}" desde la Pila de Deshacer?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: async () => {
            const popped = popUndo();
            if (popped) {
              await dispatch(addComponent({
                categoryId: popped.categoryId,
                name:       popped.name,
                model:      popped.model,
                notes:      popped.notes,
                tags:       popped.tags,
                specs:      popped.specs,
                hasImage:   popped.hasImage,
              }));
              Alert.alert("¡Restaurado!", `${popped.name} ha vuelto a tu inventario.`);
            }
          },
        },
      ]
    );
  };

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

        {/* Banner de Deshacer Eliminación (Pila Undo - LIFO) */}
        {canUndo && (
          <TouchableOpacity
            style={[styles.undoBanner, { backgroundColor: theme.card, borderColor: theme.brand }]}
            onPress={handleUndoDelete}
            activeOpacity={0.8}
          >
            <View style={styles.undoLeft}>
              <Ionicons name="arrow-undo-circle" size={24} color={theme.brand} />
              <View>
                <Text style={[styles.undoTitle, { color: theme.text }]}>
                  Deshacer eliminación (Pila LIFO)
                </Text>
                <Text style={[styles.undoSub, { color: theme.textMuted }]}>
                  {undoStackSize} {undoStackSize === 1 ? "elemento apilado" : "elementos apilados"} · Toque para restaurar
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}

        {/* Categorías — grid 2 columnas */}
        <SectionTitle title="Categorías" />
        <View style={styles.grid}>
          {CATEGORIES.map(cat => (
            <View key={cat.id} style={styles.gridCell}>
              <CategoryCard
                category={cat}
                count={countsByCategory[cat.id] ?? 0}
                onPress={() => navigation.navigate("CategoryList", { category: cat })}
              />
            </View>
          ))}
        </View>

        {/* Sección: Recientes gestionado con Pila (Stack - LIFO) */}
        <View style={styles.sectionHeaderRow}>
          <SectionTitle title="Vistos Recientemente (Pila LIFO)" />
          {recentlyViewedStackSize > 0 && (
            <View style={styles.stackActions}>
              <TouchableOpacity
                style={[styles.stackBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                onPress={handlePopRecent}
              >
                <Text style={[styles.stackBtnText, { color: theme.brand }]}>Desapilar (Pop)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stackBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                onPress={clearRecentlyViewed}
              >
                <Text style={[styles.stackBtnText, { color: theme.danger }]}>Vaciar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {recentlyViewed.length > 0 ? (
          recentlyViewed.slice(0, 5).map((comp, idx) => (
            <ComponentCard
              key={`${comp.id}-recent-${idx}`}
              component={comp}
              onPress={() => navigation.navigate("ComponentDetail", { component: comp })}
            />
          ))
        ) : (
          <View style={[styles.emptyRecentBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.emptyRecentText, { color: theme.textMuted }]}>
              📚 La pila de historial LIFO está vacía. Abre la ficha de cualquier componente para apilarlo aquí.
            </Text>
          </View>
        )}
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
  undoBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  undoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  undoTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  undoSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 4,
  },
  stackActions: {
    flexDirection: "row",
    gap: 6,
  },
  stackBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  stackBtnText: {
    fontSize: 11,
    fontWeight: "500",
  },
  emptyRecentBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    borderStyle: "dashed",
    marginBottom: 16,
    alignItems: "center",
  },
  emptyRecentText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});