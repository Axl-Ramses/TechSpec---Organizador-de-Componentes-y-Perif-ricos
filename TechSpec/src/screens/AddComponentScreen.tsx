import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useComponents } from '../context/ComponentsContext';  // ← agrega este import
import { Category, HardwareComponent } from '../types';



const CATEGORIES: Category[] = [
  'Procesadores', 'Memoria RAM', 'Almacenamiento',
  'Tarjetas Gráficas', 'Teclados', 'Monitores', 'Otros',
];

export default function AddComponentScreen() {
  const { colors } = useTheme();
  const { addComponent } = useComponents();

  const [name, setName]           = useState('');
  const [model, setModel]         = useState('');
  const [notes, setNotes]         = useState('');
  const [category, setCategory]   = useState<Category>('Procesadores');

  const handleSave = () => {
    if (!name.trim() || !model.trim()) {
      Alert.alert('Error', 'El nombre y modelo son obligatorios.');
      return;
    }

    const newComponent: HardwareComponent = {
      id: Date.now().toString(),
      name: name.trim(),
      model: model.trim(),
      category,
      notes: notes.trim(),
    };

    addComponent(newComponent);
    Alert.alert('¡Guardado!', `${name} fue agregado a ${category}.`);
    setName(''); setModel(''); setNotes('');
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Nombre del componente</Text>
      <TextInput
        style={inputStyle}
        placeholder='Ej: Ryzen 7 5700G'
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.label, { color: colors.text }]}>Modelo</Text>
      <TextInput
        style={inputStyle}
        placeholder='Ej: AMD Ryzen 7 5700G OEM'
        placeholderTextColor={colors.textSecondary}
        value={model}
        onChangeText={setModel}
      />

      <Text style={[styles.label, { color: colors.text }]}>Categoría</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              {
                backgroundColor: category === cat ? colors.accent : colors.surface,
                borderColor: category === cat ? colors.accent : colors.border,
              }
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={{ color: category === cat ? '#FFF' : colors.text, fontWeight: '600' }}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.label, { color: colors.text }]}>Notas técnicas</Text>
      <TextInput
        style={[inputStyle, styles.textArea]}
        placeholder='Ej: XMP activado, CL17, voltaje 1.35V'
        placeholderTextColor={colors.textSecondary}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.accent }]}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Text style={styles.saveText}>Guardar Componente</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { padding: 24, paddingBottom: 40 },
  label:          { fontSize: 15, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input:          { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  textArea:       { height: 100, textAlignVertical: 'top' },
  categoryScroll: { marginBottom: 8 },
  categoryChip:   { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  saveButton:     { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  saveText:       { color: '#FFF', fontSize: 16, fontWeight: '700' },
});