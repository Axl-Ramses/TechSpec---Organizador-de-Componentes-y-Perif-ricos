import { ScrollView, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import CategoryCard from '../components/CategoryCard';
import { Category } from '../types/index';
import { useComponents } from '../context/ComponentsContext';

const CATEGORIES: { name: Category; icon: string }[] = [
  { name: 'Procesadores',     icon: 'hardware-chip' },
  { name: 'Memoria RAM',      icon: 'server' },
  { name: 'Almacenamiento',   icon: 'save' },
  { name: 'Tarjetas Gráficas',icon: 'desktop' },
  { name: 'Teclados',         icon: 'keypad' },
  { name: 'Monitores',        icon: 'tv' },
  { name: 'Otros',            icon: 'grid' },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const { getByCategory } = useComponents();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>Mis Componentes</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Selecciona una categoría para ver tus registros
      </Text>

      {CATEGORIES.map(cat => (
        <CategoryCard
          key={cat.name}
          category={cat.name}
          icon={cat.icon}
          count={getByCategory(cat.name).length}
          onPress={() => {}}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  title:    { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
});