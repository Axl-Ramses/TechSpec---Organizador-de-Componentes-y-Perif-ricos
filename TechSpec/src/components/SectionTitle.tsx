import React from "react";
import { Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function SectionTitle({ title }: { title: string }) {
  const { theme } = useTheme();
  return (
    <Text style={[styles.title, { color: theme.textSub }]}>
      {title.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.7,
    marginBottom: 10,
    marginTop: 4,
  },
});
