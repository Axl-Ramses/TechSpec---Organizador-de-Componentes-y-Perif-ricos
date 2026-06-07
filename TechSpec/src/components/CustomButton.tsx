
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

interface Props {
  label:    string;
  onPress:  () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
}

export default function CustomButton({
  label,
  onPress,
  variant  = "primary",
  loading  = false,
  disabled = false,
}: Props) {
  const { theme } = useTheme();

  const containerStyle: ViewStyle = {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    opacity: disabled ? 0.55 : 1,
    backgroundColor:
      variant === "primary" ? theme.brand : "transparent",
    borderWidth: variant !== "primary" ? 1 : 0,
    borderColor:
      variant === "secondary" ? theme.brand :
      variant === "danger"    ? theme.danger :
      "transparent",
  };

  const textColor =
    variant === "primary"   ? theme.white  :
    variant === "secondary" ? theme.brand  :
    theme.danger;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={theme.white} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 15, fontWeight: "500" },
});