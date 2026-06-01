import { View, Text, Switch, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function SettingsScreen() {
  const { isDark, colors, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons
        name={isDark ? "moon" : "sunny"}
        size={72}
        color={colors.accent}
        style={styles.icon}
      />

      <Text style={[styles.title, { color: colors.text }]}>
        Tema: {isDark ? "Oscuro" : "Claro"}
      </Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>
          {isDark ? "Desactivar modo oscuro" : "Activar modo oscuro"}
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          thumbColor={isDark ? colors.accent : "#f4f3f4"}
          trackColor={{ false: "#ccc", true: "#E94560" }}
        />
      </View>

      <View
        style={[
          styles.statsCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.statsTitle, { color: colors.text }]}>
          📊 Resumen
        </Text>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          Total de componentes registrados: 0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  icon: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  label: { fontSize: 16, marginRight: 16 },
  statsCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  statsTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  statsText: { fontSize: 15 },
});
