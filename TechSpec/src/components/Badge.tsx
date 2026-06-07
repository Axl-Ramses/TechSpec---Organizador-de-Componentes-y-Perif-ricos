import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

type BadgeColor = "teal" | "blue" | "amber" | "red";

const COLORS: Record<BadgeColor, { bg: string; text: string }> = {
  teal:  { bg: "#E1F5EE", text: "#085041" },
  blue:  { bg: "#E6F1FB", text: "#185FA5" },
  amber: { bg: "#FAEEDA", text: "#633806" },
  red:   { bg: "#FCEBEB", text: "#791F1F" },
};

interface Props {
  label: string;
  color?: BadgeColor;
}

export default function Badge({ label, color = "teal" }: Props) {
  const scheme = COLORS[color];
  return (
    <View style={[styles.badge, { backgroundColor: scheme.bg }]}>
      <Text style={[styles.text, { color: scheme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  text:  { fontSize: 11, fontWeight: "500" },
});
