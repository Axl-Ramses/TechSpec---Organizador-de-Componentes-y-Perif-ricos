import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import CustomInput from "../components/CustomInput";

type Nav = NativeStackNavigationProp<RootStackParamList, "Login">;

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login }  = useAuth();
  const { theme }  = useTheme();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});
  const [loading,  setLoading]  = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim())               e.email    = "El correo es obligatorio";
    else if (!isValidEmail(email))   e.email    = "Ingresa un correo válido";
    if (!password)                   e.password = "La contraseña es obligatoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email === "demo@techspec.app" && password === "demo1234") {
        login(email, "Carlos Mendoza");
      } else {
        Alert.alert("Error", "Usa demo@techspec.app / demo1234");
      }
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + imagen local */}
          <View style={styles.logoSection}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logoImg}
            />
            <Text style={[styles.appName, { color: theme.text }]}>TechSpec</Text>
            <Text style={[styles.tagline, { color: theme.textSub }]}>
              Tu gestor de hardware personal
            </Text>
          </View>

          {/* Formulario */}
          <CustomInput
            label="Correo electrónico"
            value={email}
            onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: undefined })); }}
            placeholder="usuario@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            required
          />
          <CustomInput
            label="Contraseña"
            value={password}
            onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: undefined })); }}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
            required
          />

          <CustomButton label={loading ? "Iniciando…" : "Iniciar sesión"} onPress={handleLogin} loading={loading} />

          <View style={[styles.divider, { borderBottomColor: theme.border }]} />

          <CustomButton label="Crear cuenta nueva" onPress={() => navigation.navigate("Register")} variant="secondary" />

          <Text style={[styles.hint, { color: theme.textMuted, backgroundColor: theme.brandLight }]}>
            Demo: demo@techspec.app / demo1234
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  flex:   { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 },
  logoSection: {
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: 32,
    gap: 8,
  },
  logoImg: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: 4,
  },
  appName: { fontSize: 26, fontWeight: "600" },
  tagline: { fontSize: 13 },
  divider: { borderBottomWidth: 0.5, marginVertical: 16 },
  hint: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
  },
});
