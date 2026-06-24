import React, { useState } from "react";
import {
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Alert, Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { RootStackParamList } from "../navigation/types";
import { useAuth }   from "../context/AuthContext";
import { useTheme }  from "../context/ThemeContext";
import CustomInput   from "../components/CustomInput";
import CustomButton  from "../components/CustomButton";

type Nav = NativeStackNavigationProp<RootStackParamList, "Register">;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v: string) => v === "" || /^[\d+\-\s()]{7,15}$/.test(v);

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register }  = useAuth();
  const { theme }  = useTheme();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())             e.name    = "El nombre es obligatorio";
    if (!form.email.trim())            e.email   = "El correo es obligatorio";
    else if (!isEmail(form.email))     e.email   = "Correo inválido";
    if (form.phone && !isPhone(form.phone)) e.phone = "Teléfono inválido (7-15 dígitos)";
    if (!form.password)                e.password = "La contraseña es obligatoria";
    else if (form.password.length < 8) e.password = "Mínimo 8 caracteres";
    if (form.confirm !== form.password) e.confirm = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

 const handleRegister = async () => {
  if (!validate()) return;
  setLoading(true);
  try {
    await register(form.name, form.email, form.phone, form.password);
    Alert.alert("¡Bienvenido!", `Cuenta creada para ${form.name}. Revisa tu correo si se pide confirmación.`);
  } catch (err: any) {
    Alert.alert("Error", err.message ?? "No se pudo crear la cuenta");
  } finally {
    setLoading(false);
  }
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
          <Text style={[styles.title,    { color: theme.text }]}>Crear cuenta</Text>
          <Text style={[styles.subtitle, { color: theme.textSub }]}>
            Registra tus datos para comenzar
          </Text>

          <CustomInput label="Nombre completo"      value={form.name}     onChangeText={set("name")}     placeholder="Ej. Axel Aguilar"    autoCapitalize="words"  error={errors.name}     required />
          <CustomInput label="Correo electrónico"   value={form.email}    onChangeText={set("email")}    placeholder="Axl@ejemplo.com"    keyboardType="email-address" autoCapitalize="none" error={errors.email}    required />
          <CustomInput label="Teléfono"             value={form.phone}    onChangeText={set("phone")}    placeholder="+504 9999-9999"         keyboardType="phone-pad"     error={errors.phone} />
          <CustomInput label="Contraseña"           value={form.password} onChangeText={set("password")} placeholder="Mínimo 8 caracteres"    secureTextEntry error={errors.password}  required />
          <CustomInput label="Confirmar contraseña" value={form.confirm}  onChangeText={set("confirm")}  placeholder="Repite tu contraseña"   secureTextEntry error={errors.confirm}   required />

          <CustomButton label={loading ? "Creando…" : "Registrarse"} onPress={handleRegister} loading={loading} />
          <CustomButton label="Ya tengo cuenta" onPress={() => navigation.goBack()} variant="secondary" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1 },
  flex:     { flex: 1 },
  scroll:   { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40, paddingTop: 32 },
  title:    { fontSize: 26, fontWeight: "600", marginBottom: 6 },
  subtitle: { fontSize: 13, lineHeight: 20, marginBottom: 24 },
});
