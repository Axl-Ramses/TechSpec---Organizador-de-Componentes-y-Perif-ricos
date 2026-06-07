import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Category } from "../../assets/data";
import { useTheme } from "../context/ThemeContext";

interface Props {
  category: Category;
  onPress:  () => void;
}

export default function CategoryCard({ category, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Ícono con fondo de color condicional por categoría */}
      <View style={[styles.iconBox, { backgroundColor: category.bgColor }]}>
        <Text style={styles.emoji}>{category.emoji}</Text>
      </View>

      {/* Nombre y contador */}
      <Text style={[styles.name, { color: theme.text }]}>{category.name}</Text>
      <Text style={[styles.count, { color: theme.textMuted }]}>
        {category.count} {category.count === 1 ? "registro" : "registros"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    // Flexbox: columna, alineado a la izquierda
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 20 },
  name:  { fontSize: 13, fontWeight: "500" },
  count: { fontSize: 11 },
});
