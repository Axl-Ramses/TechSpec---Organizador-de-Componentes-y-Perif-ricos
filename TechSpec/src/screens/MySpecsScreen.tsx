import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { HardwareComponent } from "../../assets/data";
import { useTheme }      from "../context/ThemeContext";
import ComponentCard     from "../components/ComponentCard";
import EmptyState        from "../components/EmptyState";
import SectionTitle      from "../components/SectionTitle";
import { useAppSelector } from "../store/hooks";

export default function MySpecsScreen() {
  const { theme }      = useTheme();
  const  components  = useAppSelector((state) => state.components.items);
  const [search, setSearch] = useState("");

  const filtered = components.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.model.toLowerCase().includes(search.toLowerCase())
  );

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

        <SectionTitle title={search ? `${filtered.length} resultados` : "Todos"} />

        <FlatList<HardwareComponent>
          data={filtered}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ComponentCard
              component={item}
              onPress={() => Alert.alert(item.name, item.notes || "Sin notas.")}
            />
          )}
          ListEmptyComponent={
            <EmptyState emoji="🔍" title="Sin resultados" subtitle={`No se encontró "${search}"`} />
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
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 11,
  },
});