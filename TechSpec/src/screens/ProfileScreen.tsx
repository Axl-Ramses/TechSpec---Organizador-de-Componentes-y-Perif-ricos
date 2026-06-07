import React from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth }   from "../context/AuthContext";
import { useTheme }  from "../context/ThemeContext";
import CustomButton  from "../components/CustomButton";

export default function ProfileScreen() {
  const { user, logout }          = useAuth();
  const { theme, toggleTheme }    = useTheme();

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.brandDark }]}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: theme.brand }]}>
          <Text style={styles.initials}>{user?.initials ?? "?"}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <ScrollView
        style={[styles.body, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Datos */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textMuted }]}>CUENTA</Text>
          <Row label="📧 Correo"   value={user?.email   ?? ""} theme={theme} />
          <Row label="📱 Teléfono" value={user?.phone   ?? ""} theme={theme} last />
        </View>

        {/* Preferencias */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textMuted }]}>PREFERENCIAS</Text>

          {/* Toggle modo oscuro — estilo condicional según tema */}
          <View style={styles.prefRow}>
            <Text style={[styles.prefLabel, { color: theme.text }]}>🌙 Modo oscuro</Text>
            <Switch
              value={theme.isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.brand }}
              thumbColor={theme.white}
            />
          </View>
        </View>

        {/* Acciones */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textMuted }]}>ACCIONES</Text>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert("Exportar", "Exportando datos como JSON…")}
          >
            <Text style={[styles.actionText, { color: theme.text }]}>📥 Exportar mis datos</Text>
            <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionRow, styles.actionLast]}
            onPress={() => Alert.alert("TechSpec v1.0.0", "Desarrollado con React Native + Expo + TypeScript")}
          >
            <Text style={[styles.actionText, { color: theme.text }]}>❓ Acerca de la app</Text>
            <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

        <CustomButton label="Cerrar sesión" onPress={handleLogout} variant="danger" />

        <Text style={[styles.version, { color: theme.textMuted }]}>
          TechSpec v1.0.0 · React Native + Expo + TypeScript
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Fila de dato de perfil
function Row({ label, value, theme, last = false }: {
  label: string; value: string; theme: any; last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.border }]}>
      <Text style={[styles.infoLabel, { color: theme.textSub }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 24,
    gap: 4,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  initials: { fontSize: 28, fontWeight: "700", color: "#fff" },
  name:     { fontSize: 20, fontWeight: "600", color: "#fff" },
  email:    { fontSize: 13, color: "rgba(255,255,255,0.65)" },

  body:    { flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  content: { padding: 16, paddingBottom: 60, gap: 12 },

  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
  },
  cardTitle: { fontSize: 11, fontWeight: "600", letterSpacing: 0.7, marginBottom: 8 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "500" },

  prefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  prefLabel: { fontSize: 14 },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0DFD8",
  },
  actionLast:  { borderBottomWidth: 0 },
  actionText:  { fontSize: 14 },
  chevron:     { fontSize: 20 },

  version: { textAlign: "center", fontSize: 11, marginTop: 8 },
});
