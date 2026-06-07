import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HardwareComponent, CATEGORIES } from "../../assets/data";
import { useTheme } from "../context/ThemeContext";

interface Props {
  component: HardwareComponent;
  onPress:   () => void;
}

export default function ComponentCard({ component, onPress }: Props) {
  const { theme } = useTheme();
  const cat = CATEGORIES.find(c => c.id === component.categoryId);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Flexbox: fila con ícono → info → chevron */}
      <View style={[styles.iconBox, { backgroundColor: cat?.bgColor ?? theme.brandLight }]}>
        <Text style={styles.emoji}>{cat?.emoji ?? "📦"}</Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {component.name}
        </Text>
        <Text style={[styles.meta, { color: theme.textSub }]} numberOfLines={1}>
          {cat?.name} · {component.updatedAt}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 8,
    // Flexbox: fila horizontal centrada
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emoji: { fontSize: 22 },
  info: {
    flex: 1,
    flexDirection: "column",
    gap: 3,
  },
  name: { fontSize: 14, fontWeight: "500" },
  meta: { fontSize: 12 },
});
