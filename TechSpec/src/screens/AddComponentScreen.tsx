import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity, Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeStackParamList } from "../navigation/types";
import { CATEGORIES } from "../../assets/data";
import { useTheme }   from "../context/ThemeContext";
import CustomInput    from "../components/CustomInput";
import CustomButton   from "../components/CustomButton";
import { useAppDispatch } from "../store/hooks";
import { addComponent } from "../store/componentsSlice";
type Route = RouteProp<HomeStackParamList, "AddComponent">;

export default function AddComponentScreen() {
  const navigation = useNavigation();
  const route      = useRoute<Route>();
  const { theme }  = useTheme();

  const [form, setForm] = useState({
    categoryId: route.params?.categoryId ?? "",
    name:  "",
    model: "",
    notes: "",
    tags:  "",
  });
  const [errors, setErrors] = useState<{ categoryId?: string; name?: string }>({});

  const set = (field: keyof typeof form) => (value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.categoryId) e.categoryId = "Selecciona una categoría";
    if (!form.name.trim()) e.name       = "El nombre es obligatorio";
    setErrors(e);
    return Object.keys(e).length === 0;
  };


const dispatch = useAppDispatch();

const handleSave = async () => {
  if (!validate()) return;
  try {
    await dispatch(addComponent({
      
      categoryId: form.categoryId,
      name:       form.name,
      model:      form.model,
      notes:      form.notes,
      tags:       form.tags.split(",").map(t => t.trim()).filter(Boolean),
      specs:      [],
      hasImage:   false,
    })).unwrap();
    Alert.alert("¡Guardado!", `${form.name} fue agregado.`, [
      { text: "Aceptar", onPress: () => navigation.goBack() },
    ]);
  } catch (err: any) {
    Alert.alert("Error", err.message ?? "No se pudo guardar el componente");
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
          {/* Selector de categoría con estilo condicional */}
          <Text style={[styles.sectionLabel, { color: theme.textSub }]}>
            CATEGORÍA *
          </Text>
          {errors.categoryId && (
            <Text style={[styles.errText, { color: theme.danger }]}>
              {errors.categoryId}
            </Text>
          )}
          <View style={styles.chipGrid}>
            {CATEGORIES.map(cat => {
              const selected = form.categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? cat.bgColor : theme.card,
                      borderColor:     selected ? cat.color   : theme.border,
                      borderWidth:     selected ? 1.5 : 0.75,
                    },
                  ]}
                  onPress={() => set("categoryId")(cat.id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.chipText,
                      { color: selected ? cat.color : theme.textSub,
                        fontWeight: selected ? "600" : "400" },
                    ]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <CustomInput label="Nombre del componente" value={form.name}  onChangeText={set("name")}  placeholder="Ej. Ryzen 7 5700G"          error={errors.name} required />
          <CustomInput label="Modelo / SKU"          value={form.model} onChangeText={set("model")} placeholder="Ej. 100-100000263BOX" />
          <CustomInput label="Notas técnicas"        value={form.notes} onChangeText={set("notes")} placeholder="Latencias, voltajes, configs..." multiline numberOfLines={4} />
          <CustomInput label="Etiquetas (coma)"      value={form.tags}  onChangeText={set("tags")}  placeholder="APU, AM4, OC" />

          <CustomButton label="💾  Guardar ficha" onPress={handleSave} />
          <CustomButton label="Cancelar" onPress={() => navigation.goBack()} variant="secondary" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1 },
  flex:  { flex: 1 },
  scroll: { padding: 16, paddingBottom: 60 },

  sectionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.6, marginBottom: 8 },
  errText:      { fontSize: 11, marginBottom: 6 },

  // Chips de categoría — flexbox wrap
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipEmoji: { fontSize: 14 },
  chipText:  { fontSize: 12 },
});

