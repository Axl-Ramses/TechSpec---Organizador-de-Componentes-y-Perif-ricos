import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface Props {
  label: string;
  value: string;
}

export default function SpecRow({ label, value }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <Text style={[styles.key, { color: theme.textSub }]}>{label}</Text>
      <Text style={[styles.val, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  key: { fontSize: 13, flex: 1 },
  val: { fontSize: 13, fontWeight: "500", textAlign: "right", flex: 1 },
});
