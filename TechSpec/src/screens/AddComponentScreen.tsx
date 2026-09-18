import React, { useState, useRef, useLayoutEffect } from "react";
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
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addComponent, updateComponent } from "../store/componentsSlice";
import { LinkedList } from "../structures/LinkedList";
import { useStructures } from "../context/StructuresContext";

type Route = RouteProp<HomeStackParamList, "AddComponent">;

export default function AddComponentScreen() {
  // La pantalla se monta tanto dentro de un stack como en la raíz del tab "Agregar",
  // por lo que el navegador recibido no siempre es del mismo tipo.
  const navigation = useNavigation<any>();
  const route      = useRoute<Route>();
  const { theme }  = useTheme();
  const dispatch   = useAppDispatch();
  const { updateComponentInStructures } = useStructures();

  // ── Modo edición: si llega un componentId, precargamos la ficha existente ──
  const editingId = route.params?.componentId;
  const existing  = useAppSelector(state =>
    state.components.items.find(c => c.id === editingId)
  );
  const isEditing = !!existing;

  const [form, setForm] = useState({
    categoryId: existing?.categoryId ?? route.params?.categoryId ?? "",
    name:  existing?.name  ?? "",
    model: existing?.model ?? "",
    notes: existing?.notes ?? "",
    tags:  existing?.tags?.join(", ") ?? "",
  });

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEditing ? "Editar ficha" : "Nueva ficha" });
  }, [navigation, isEditing]);
  const [errors, setErrors] = useState<{ categoryId?: string; name?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Estructura de Datos: Lista Enlazada Simple (LinkedList<Spec>) ──
  const specsLinkedListRef = useRef<LinkedList<Spec>>(
    (() => {
      const list = new LinkedList<Spec>();
      for (const spec of existing?.specs ?? []) list.insert({ ...spec });
      return list;
    })()
  );
  const [specsDisplay, setSpecsDisplay] = useState<Spec[]>(
    () => specsLinkedListRef.current.toArray()
  );
  const [newSpecKey, setNewSpecKey]         = useState("");
  const [newSpecValue, setNewSpecValue]     = useState("");
  const [editingSpecKey, setEditingSpecKey] = useState<string | null>(null);

  /**
   * Agrega o actualiza un nodo en la Lista Enlazada de especificaciones.
   * Si está en modo edición de spec, utiliza LinkedList.update (O(n)).
   * Si es nueva, utiliza LinkedList.insert (O(1)).
   */
  const handleSaveSpecNode = () => {
    const key = newSpecKey.trim();
    const value = newSpecValue.trim();

    if (!key || !value) {
      Alert.alert("Atención", "Ingresa el nombre y valor de la especificación.");
      return;
    }

    if (editingSpecKey !== null) {
      // Modo edición de spec: actualiza el nodo en la Lista Enlazada
      specsLinkedListRef.current.update(
        s => s.key.toLowerCase() === editingSpecKey.toLowerCase(),
        { key, value }
      );
      setEditingSpecKey(null);
    } else {
      // Verifica si ya existe una clave idéntica para prevenir duplicados
      const exists = specsLinkedListRef.current.find(
        s => s.key.toLowerCase() === key.toLowerCase()
      );
      if (exists) {
        Alert.alert(
          "Especificación existente",
          `La clave "${key}" ya existe. Tócala en la lista para editar su valor o usa otro nombre.`
        );
        return;
      }
      // Inserción en la lista enlazada (O(1))
      specsLinkedListRef.current.insert({ key, value });
    }

    // Actualizamos la vista recorriendo la lista enlazada (O(n))
    setSpecsDisplay(specsLinkedListRef.current.toArray());
    setNewSpecKey("");
    setNewSpecValue("");
  };

  const handleStartEditSpec = (spec: Spec) => {
    setEditingSpecKey(spec.key);
    setNewSpecKey(spec.key);
    setNewSpecValue(spec.value);
  };

  const handleCancelEditSpec = () => {
    setEditingSpecKey(null);
    setNewSpecKey("");
    setNewSpecValue("");
  };

  const handleRemoveSpecNode = (keyToRemove: string) => {
    if (editingSpecKey === keyToRemove) {
      handleCancelEditSpec();
    }
    // Eliminación del nodo en la lista enlazada (O(n))
    specsLinkedListRef.current.delete(s => s.key === keyToRemove);
    setSpecsDisplay(specsLinkedListRef.current.toArray());
  };

  /**
   * Limpia el formulario y la Lista Enlazada de especificaciones. Necesario
   * cuando la pantalla es la raíz del tab "Agregar": ahí no hay pantalla previa
   * a la que volver, así que tras guardar hay que dejarla lista para otra ficha.
   */
  const resetForm = () => {
    setForm({
      categoryId: route.params?.categoryId ?? "",
      name:  "",
      model: "",
      notes: "",
      tags:  "",
    });
    setErrors({});
    specsLinkedListRef.current.clear();
    setSpecsDisplay([]);
    setNewSpecKey("");
    setNewSpecValue("");
    setEditingSpecKey(null);
  };

  /** Cierra la pantalla: vuelve atrás si hay historial; si no, limpia y va a "Mis specs". */
  const closeAfterSave = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    resetForm();
    navigation.navigate("MySpecsTab");
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
    setSubmitting(true);
    try {
      if (isEditing && existing) {
        const updated = await dispatch(updateComponent({
          id:         existing.id,
          categoryId: form.categoryId,
          name:       form.name,
          model:      form.model,
          notes:      form.notes,
          tags:       form.tags.split(",").map(t => t.trim()).filter(Boolean),
          specs:      specsLinkedListRef.current.toArray(), // Extraído de la Lista Enlazada
          hasImage:   existing.hasImage,
        })).unwrap();

        // Sincroniza la versión actualizada en las estructuras de datos (Pila y Cola)
        updateComponentInStructures(updated);

        Alert.alert("¡Actualizado!", `${form.name} se guardó con ${specsLinkedListRef.current.size()} especificaciones.`, [
          { text: "Aceptar", onPress: closeAfterSave },
        ]);
        return;
      }

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
        { text: "Aceptar", onPress: closeAfterSave },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "No se pudo guardar el componente");
    } finally {
      setSubmitting(false);
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

            <View style={styles.specActionsRow}>
              <TouchableOpacity
                style={[
                  styles.addSpecBtn,
                  {
                    backgroundColor: editingSpecKey ? theme.brand : theme.card,
                    borderColor:     editingSpecKey ? theme.brand : theme.border,
                    flex: 1,
                  },
                ]}
                onPress={handleSaveSpecNode}
              >
                <Ionicons
                  name={editingSpecKey ? "checkmark-circle" : "add-circle"}
                  size={18}
                  color={editingSpecKey ? theme.white : theme.brand}
                />
                <Text
                  style={[
                    styles.addSpecBtnText,
                    { color: editingSpecKey ? theme.white : theme.brand },
                  ]}
                >
                  {editingSpecKey ? "Actualizar en Lista Enlazada" : "Insertar en Lista Enlazada"}
                </Text>
              </TouchableOpacity>

              {editingSpecKey && (
                <TouchableOpacity
                  style={[styles.cancelSpecBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                  onPress={handleCancelEditSpec}
                >
                  <Text style={[styles.cancelSpecBtnText, { color: theme.textSub }]}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Lista de nodos agregados */}
            {specsDisplay.length > 0 && (
              <View style={styles.specsListWrap}>
                {specsDisplay.map((spec, index) => {
                  const isBeingEdited = editingSpecKey === spec.key;
                  return (
                    <View
                      key={`${spec.key}-${index}`}
                      style={[
                        styles.specChip,
                        {
                          backgroundColor: isBeingEdited ? theme.brandLight : theme.card,
                          borderColor:     isBeingEdited ? theme.brand      : theme.border,
                          borderWidth:     isBeingEdited ? 1 : 0.5,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.specChipTexts}
                        onPress={() => handleStartEditSpec(spec)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.specChipKey, { color: theme.brand }]}>{spec.key}:</Text>
                        <Text style={[styles.specChipVal, { color: theme.text }]}>{spec.value}</Text>
                        <Ionicons name="pencil-outline" size={13} color={theme.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveSpecNode(spec.key)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close-circle" size={18} color={theme.danger} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <CustomButton
            label={isEditing ? "💾  Guardar cambios" : "💾  Guardar ficha"}
            onPress={handleSave}
            loading={submitting}
            disabled={submitting}
          />
          <CustomButton
            label={navigation.canGoBack() ? "Cancelar" : "Limpiar formulario"}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : resetForm())}
            variant="secondary"
            disabled={submitting}
          />
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
  specActionsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
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
  },
  addSpecBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  cancelSpecBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 0.75,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelSpecBtnText: {
    fontSize: 13,
    fontWeight: "500",
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


