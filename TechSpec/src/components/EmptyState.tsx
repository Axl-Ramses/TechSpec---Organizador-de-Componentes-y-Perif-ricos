import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface Props {
  emoji?:    string;
  title:     string;
  subtitle?: string;
}

export default function EmptyState({ emoji = "📭", title, subtitle }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.textSub }]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emoji:    { fontSize: 48, marginBottom: 8 },
  title:    { fontSize: 16, fontWeight: "500", textAlign: "center" },
  subtitle: { fontSize: 13, textAlign: "center", maxWidth: 260, lineHeight: 20 },
});
