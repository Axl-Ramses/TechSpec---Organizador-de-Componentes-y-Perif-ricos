import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity, Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { HomeStackParamList } from "../navigation/types";
import { CATEGORIES, Spec } from "../../assets/data";
import { useTheme }   from "../context/ThemeContext";
import CustomInput    from "../components/CustomInput";
import CustomButton   from "../components/CustomButton";
import { useAppDispatch } from "../store/hooks";
import { addComponent } from "../store/componentsSlice";
import { LinkedList } from "../structures/LinkedList";

type Route = RouteProp<HomeStackParamList, "AddComponent">;

export default function AddComponentScreen() {
  const navigation = useNavigation();
  const route      = useRoute<Route>();
  const { theme }  = useTheme();
  const dispatch   = useAppDispatch();

  const [form, setForm] = useState({
    categoryId: route.params?.categoryId ?? "",
    name:  "",
    model: "",
    notes: "",
    tags:  "",
  });
  const [errors, setErrors] = useState<{ categoryId?: string; name?: string }>({});

  // ── Estructura de Datos: Lista Enlazada Simple (LinkedList<Spec>) ──
  const specsLinkedListRef = useRef(new LinkedList<Spec>());
  const [specsDisplay, setSpecsDisplay] = useState<Spec[]>([]);
  const [newSpecKey, setNewSpecKey]     = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  const handleAddSpecNode = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) {
      Alert.alert("Atención", "Ingresa el nombre y valor de la especificación.");
      return;
    }
    // Inserción en la lista enlazada (O(1))
    specsLinkedListRef.current.insert({
      key: newSpecKey.trim(),
      value: newSpecValue.trim(),
    });
    // Actualizamos la vista recorriendo la lista enlazada (O(n))
    setSpecsDisplay(specsLinkedListRef.current.toArray());
    setNewSpecKey("");
    setNewSpecValue("");
  };

  const handleRemoveSpecNode = (keyToRemove: string) => {
    // Eliminación del nodo en la lista enlazada (O(n))
    specsLinkedListRef.current.delete(s => s.key === keyToRemove);
    setSpecsDisplay(specsLinkedListRef.current.toArray());
  };

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

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await dispatch(addComponent({
        categoryId: form.categoryId,
        name:       form.name,
        model:      form.model,
        notes:      form.notes,
        tags:       form.tags.split(",").map(t => t.trim()).filter(Boolean),
        specs:      specsLinkedListRef.current.toArray(), // Extraído de la Lista Enlazada
        hasImage:   false,
      })).unwrap();
      Alert.alert("¡Guardado!", `${form.name} fue agregado con ${specsLinkedListRef.current.size()} especificaciones.`, [
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

          {/* Sección de Especificaciones Técnicas con Lista Enlazada */}
          <View style={styles.specsSection}>
            <View style={styles.specsHeaderRow}>
              <Text style={[styles.sectionLabel, { color: theme.textSub, marginBottom: 0 }]}>
                ESPECIFICACIONES TÉCNICAS
              </Text>
              <Text style={[styles.structureBadgeText, { color: theme.brand }]}>
                🔗 Lista Enlazada: {specsDisplay.length} nodos
              </Text>
            </View>

            {/* Inputs para agregar nodo a la lista enlazada */}
            <View style={styles.specInputRow}>
              <View style={styles.specInputHalf}>
                <CustomInput
                  label="Clave"
                  value={newSpecKey}
                  onChangeText={setNewSpecKey}
                  placeholder="Ej. TDP / Socket"
                />
              </View>
              <View style={styles.specInputHalf}>
                <CustomInput
                  label="Valor"
                  value={newSpecValue}
                  onChangeText={setNewSpecValue}
                  placeholder="Ej. 65W / AM4"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.addSpecBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={handleAddSpecNode}
            >
              <Ionicons name="add-circle" size={18} color={theme.brand} />
              <Text style={[styles.addSpecBtnText, { color: theme.brand }]}>
                Insertar en Lista Enlazada
              </Text>
            </TouchableOpacity>

            {/* Lista de nodos agregados */}
            {specsDisplay.length > 0 && (
              <View style={styles.specsListWrap}>
                {specsDisplay.map((spec, index) => (
                  <View
                    key={`${spec.key}-${index}`}
                    style={[styles.specChip, { backgroundColor: theme.card, borderColor: theme.border }]}
                  >
                    <View style={styles.specChipTexts}>
                      <Text style={[styles.specChipKey, { color: theme.brand }]}>{spec.key}:</Text>
                      <Text style={[styles.specChipVal, { color: theme.text }]}>{spec.value}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveSpecNode(spec.key)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={18} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

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

  // Sección de Especificaciones con Lista Enlazada
  specsSection: {
    marginVertical: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  specsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  structureBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  specInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  specInputHalf: {
    flex: 1,
  },
  addSpecBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.75,
    borderStyle: "dashed",
    marginTop: 4,
    marginBottom: 12,
  },
  addSpecBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  specsListWrap: {
    gap: 6,
    marginBottom: 12,
  },
  specChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  specChipTexts: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    flex: 1,
  },
  specChipKey: {
    fontSize: 12,
    fontWeight: "600",
  },
  specChipVal: {
    fontSize: 12,
    flex: 1,
  },
});


