export type Category =
  | 'Procesadores'
  | 'Memoria RAM'
  | 'Almacenamiento'
  | 'Tarjetas Gráficas'
  | 'Teclados'
  | 'Monitores'
  | 'Otros';

export type HardwareComponent = {
  id: string;
  name: string;
  model: string;
  category: Category;
  notes: string;
};