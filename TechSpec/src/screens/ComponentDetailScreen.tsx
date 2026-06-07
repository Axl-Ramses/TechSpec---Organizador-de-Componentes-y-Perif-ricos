import React from "react";
import {
  View, Text, StyleSheet, ScrollView,
  Image, Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeStackParamList } from "../navigation/types";
import { CATEGORIES }  from "../../assets/data";
import { useTheme }    from "../context/ThemeContext";
import SpecRow         from "../components/SpecRow";
import Badge           from "../components/Badge";
import CustomButton    from "../components/CustomButton";

type Nav   = NativeStackNavigationProp<HomeStackParamList, "ComponentDetail">;
type Route = RouteProp<HomeStackParamList, "ComponentDetail">;

const BADGE_COLORS = ["teal", "blue", "amber"] as const;

export default function ComponentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { theme }  = useTheme();
  const { component } = params;

  const cat = CATEGORIES.find(c => c.id === component.categoryId);

  const shareSpecs = () => {
    const text = component.specs.map(s => `${s.key}: ${s.value}`).join("\n");
    Alert.alert("Compartir", `${component.name}\n\n${text}`);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero con imagen local */}
        <View style={[styles.hero, { backgroundColor: theme.brandDark }]}>
          {component.hasImage ? (
            <Image
              source={require("../../assets/icon.png")}
              style={styles.heroBg}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.heroEmoji}>{cat?.emoji ?? "📦"}</Text>
          )}
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{component.name}</Text>
            <Text style={styles.heroMeta}>{cat?.name} · {component.model}</Text>
          </View>
        </View>

        {/* Tags / Badges */}
        <View style={[styles.tagsRow, { backgroundColor: theme.brandDark }]}>
          {component.tags.map((tag, i) => (
            <Badge
              key={i}
              label={tag}
              color={BADGE_COLORS[i % BADGE_COLORS.length]}
            />
          ))}
        </View>

        <View style={styles.content}>
          {/* Especificaciones */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.textMuted }]}>ESPECIFICACIONES</Text>
            {component.specs.map((s, i) => (
              <SpecRow key={i} label={s.key} value={s.value} />
            ))}
          </View>

          {/* Notas técnicas */}
          {!!component.notes && (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>NOTAS TÉCNICAS</Text>
              <Text style={[styles.notes, { color: theme.text }]}>{component.notes}</Text>
            </View>
          )}

          {/* Metadatos */}
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: theme.textMuted }]}>Creado: {component.createdAt}</Text>
            <Text style={[styles.metaText, { color: theme.textMuted }]}>Actualizado: {component.updatedAt}</Text>
          </View>

          {/* Acciones — fila flexbox */}
          <View style={styles.actionsRow}>
            <View style={styles.actionBtn}>
              <CustomButton
                label="✏️  Editar"
                onPress={() => navigation.navigate("AddComponent", { categoryId: component.categoryId })}
              />
            </View>
            <View style={styles.actionBtn}>
              <CustomButton label="📤  Compartir" onPress={shareSpecs} variant="secondary" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.15,
  },
  heroEmoji: { fontSize: 60, opacity: 0.4, position: "absolute" },
  heroContent: {
    width: "100%",
    padding: 16,
    justifyContent: "flex-end",
    flex: 1,
  },
  heroName: { fontSize: 22, fontWeight: "600", color: "#fff" },
  heroMeta: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 3 },

  // Tags
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  content: { padding: 16, paddingBottom: 40 },

  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  notes: { fontSize: 13, lineHeight: 22 },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metaText: { fontSize: 11 },

  // Acciones — 2 botones en fila
  actionsRow: { flexDirection: "row", gap: 8 },
  actionBtn:  { flex: 1 },
});
