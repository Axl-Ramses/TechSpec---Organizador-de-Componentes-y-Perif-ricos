import React, { useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { CATEGORIES, HardwareComponent } from "../../assets/data";
import { useTheme }      from "../context/ThemeContext";
import { useStructures } from "../context/StructuresContext";
import EmptyState        from "../components/EmptyState";
import CustomButton      from "../components/CustomButton";
import { LinkedList }    from "../structures";

const COL_WIDTH = 130;

export default function CompareScreen() {
  const { theme } = useTheme();
  const {
    comparisonQueue,
    comparisonQueueSize,
    comparisonQueueCapacity,
    dequeueFromComparison,
    removeFromComparison,
    clearComparison,
  } = useStructures();

  /**
   * Unión de todas las claves de especificación presentes en los componentes
   * encolados. Se acumulan en una Lista Enlazada respetando el orden de
   * aparición, de modo que cada fila de la tabla es un nodo de la lista.
   */
  const specKeys = useMemo(() => {
    const keys = new LinkedList<string>();

    for (const component of comparisonQueue) {
      for (const spec of component.specs ?? []) {
        // find() recorre la lista: evita claves repetidas entre componentes
        if (keys.find(k => k.toLowerCase() === spec.key.toLowerCase()) === null) {
          keys.insert(spec.key);
        }
      }
    }

    return keys.toArray();
  }, [comparisonQueue]);

  const valueFor = (component: HardwareComponent, key: string): string => {
    const spec = (component.specs ?? []).find(
      s => s.key.toLowerCase() === key.toLowerCase()
    );
    return spec?.value ?? "—";
  };

  const handleDequeue = () => {
    const removed = dequeueFromComparison();
    if (removed) {
      Alert.alert(
        "Cola FIFO: Desencolar",
        `Salió "${removed.name}", el primer componente que entró a la cola.`
      );
    }
  };

  if (comparisonQueueSize === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <EmptyState
          emoji="⚖️"
          title="Cola de comparación vacía"
          subtitle="Abre un componente y toca “Comparar” para encolarlo. Puedes comparar hasta 3 a la vez."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Estado de la cola */}
        <View style={[styles.queueCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.queueHeader}>
            <Text style={[styles.queueTitle, { color: theme.textMuted }]}>COLA DE COMPARACIÓN</Text>
            <Text style={[styles.structureBadge, { color: theme.brand }]}>
              ➡️ Cola FIFO: {comparisonQueueSize}/{comparisonQueueCapacity}
            </Text>
          </View>

          {/* Orden de la cola: frente → final */}
          {comparisonQueue.map((component, index) => {
            const cat = CATEGORIES.find(c => c.id === component.categoryId);
            const isFront = index === 0;
            const isRear  = index === comparisonQueue.length - 1;

            return (
              <View
                key={component.id}
                style={[styles.queueRow, { borderColor: theme.border }]}
              >
                <Text style={styles.queueEmoji}>{cat?.emoji ?? "📦"}</Text>
                <View style={styles.queueTexts}>
                  <Text style={[styles.queueName, { color: theme.text }]} numberOfLines={1}>
                    {component.name}
                  </Text>
                  <Text style={[styles.queuePos, { color: theme.textMuted }]}>
                    {isFront && isRear
                      ? "Frente y final"
                      : isFront
                      ? "Frente (sale primero)"
                      : isRear
                      ? "Final (último en entrar)"
                      : `Posición ${index + 1}`}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeFromComparison(component.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={20} color={theme.danger} />
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={styles.queueActions}>
            <View style={styles.queueActionBtn}>
              <CustomButton label="⬅️  Desencolar" onPress={handleDequeue} variant="secondary" />
            </View>
            <View style={styles.queueActionBtn}>
              <CustomButton label="🧹  Vaciar" onPress={clearComparison} variant="secondary" />
            </View>
          </View>
        </View>

        {/* Tabla comparativa — scroll horizontal cuando hay 3 columnas */}
        <Text style={[styles.sectionLabel, { color: theme.textSub }]}>
          ESPECIFICACIONES COMPARADAS ({specKeys.length})
        </Text>

        {specKeys.length === 0 ? (
          <Text style={[styles.noSpecs, { color: theme.textMuted }]}>
            Los componentes encolados no tienen especificaciones registradas.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.table, { backgroundColor: theme.card, borderColor: theme.border }]}>

              {/* Encabezado con los nombres de los componentes */}
              <View style={[styles.row, styles.headerRow, { borderBottomColor: theme.border }]}>
                <View style={styles.keyCell}>
                  <Text style={[styles.headerText, { color: theme.textMuted }]}>SPEC</Text>
                </View>
                {comparisonQueue.map(component => (
                  <View key={component.id} style={styles.valueCell}>
                    <Text style={[styles.headerText, { color: theme.brand }]} numberOfLines={2}>
                      {component.name}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Una fila por cada clave de la Lista Enlazada */}
              {specKeys.map((key, index) => {
                const values = comparisonQueue.map(c => valueFor(c, key));
                // Resaltamos las filas donde los valores difieren entre piezas
                const allEqual = values.every(v => v === values[0]);

                return (
                  <View
                    key={`${key}-${index}`}
                    style={[
                      styles.row,
                      {
                        borderBottomColor: theme.border,
                        backgroundColor: !allEqual && comparisonQueue.length > 1
                          ? theme.brandLight
                          : "transparent",
                      },
                    ]}
                  >
                    <View style={styles.keyCell}>
                      <Text style={[styles.keyText, { color: theme.textSub }]}>{key}</Text>
                    </View>
                    {values.map((value, i) => (
                      <View key={`${key}-${i}`} style={styles.valueCell}>
                        <Text style={[styles.valueText, { color: theme.text }]}>{value}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        <Text style={[styles.hint, { color: theme.textMuted }]}>
          Las filas resaltadas son las especificaciones en las que los componentes difieren.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  queueCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 18,
  },
  queueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  queueTitle: { fontSize: 11, fontWeight: "600", letterSpacing: 0.7 },
  structureBadge: { fontSize: 10, fontWeight: "600" },

  queueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 0.5,
  },
  queueEmoji: { fontSize: 20 },
  queueTexts: { flex: 1 },
  queueName:  { fontSize: 14, fontWeight: "500" },
  queuePos:   { fontSize: 11, marginTop: 1 },

  queueActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  queueActionBtn: { flex: 1 },

  sectionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.6, marginBottom: 8 },
  noSpecs:      { fontSize: 12, fontStyle: "italic" },

  table: {
    borderRadius: 14,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
  },
  headerRow: { paddingVertical: 4 },
  keyCell: {
    width: 120,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  valueCell: {
    width: COL_WIDTH,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  headerText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  keyText:    { fontSize: 12, fontWeight: "600" },
  valueText:  { fontSize: 12 },

  hint: { fontSize: 11, marginTop: 12, lineHeight: 16 },
});
