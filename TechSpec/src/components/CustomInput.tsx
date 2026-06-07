import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface Props {
  label:           string;
  value:           string;
  onChangeText:    (text: string) => void;
  placeholder?:    string;
  keyboardType?:   KeyboardTypeOptions;
  secureTextEntry?: boolean;
  error?:          string;
  required?:       boolean;
  multiline?:      boolean;
  numberOfLines?:  number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType    = "default",
  secureTextEntry = false,
  error,
  required        = false,
  multiline       = false,
  numberOfLines   = 1,
  autoCapitalize  = "sentences",
}: Props) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      {/* Etiqueta */}
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.textSub }]}>{label}</Text>
        {required && <Text style={[styles.required, { color: theme.danger }]}> *</Text>}
      </View>

      {/* Campo */}
      <View
        style={[
          styles.inputBox,
          {
            borderColor:     error ? theme.danger : theme.border,
            borderWidth:     error ? 1.2 : 0.75,
            backgroundColor: theme.card,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: theme.text },
            multiline && styles.multiline,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !visible}
          autoCapitalize={secureTextEntry ? "none" : autoCapitalize}
          autoCorrect={false}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          textAlignVertical={multiline ? "top" : "center"}
        />

        {/* Toggle visibilidad contraseña */}
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setVisible(v => !v)} style={styles.eye}>
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Mensaje de error */}
      {!!error && (
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:   { marginBottom: 14 },
  labelRow:  { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  label:     { fontSize: 12, fontWeight: "500" },
  required:  { fontSize: 12, fontWeight: "700" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 11,
  },
  multiline: { height: 88, paddingTop: 10 },
  eye:       { paddingLeft: 8, paddingVertical: 6 },
  errorText: { marginTop: 4, fontSize: 11 },
});
