// Tipos de datos y datos de ejemplo para TechSpec

export interface Category {
  id:      string;
  name:    string;
  icon:    string;  // nombre de Ionicon
  emoji:   string;
  color:   string;
  bgColor: string;
  count:   number;
}

export interface Spec {
  key:   string;
  value: string;
}

export interface HardwareComponent {
  id:         string;
  categoryId: string;
  name:       string;
  model:      string;
  notes:      string;
  tags:       string[];
  specs:      Spec[];
  hasImage:   boolean;
  createdAt:  string;
  updatedAt:  string;
}

// ── Categorías ────────────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { id: "cpu",     name: "Procesadores",  icon: "hardware-chip",  emoji: "🔲", color: "#085041", bgColor: "#E1F5EE", count: 2 },
  { id: "kb",      name: "Teclados",      icon: "keypad",         emoji: "⌨️", color: "#185FA5", bgColor: "#E6F1FB", count: 1 },
  { id: "storage", name: "Almacenamiento",icon: "save",           emoji: "💾", color: "#633806", bgColor: "#FAEEDA", count: 3 },
  { id: "monitor", name: "Monitores",     icon: "desktop",        emoji: "🖥️", color: "#72243E", bgColor: "#FBEAF0", count: 1 },
  { id: "gpu",     name: "GPUs",          icon: "flash",          emoji: "⚡", color: "#791F1F", bgColor: "#FCEBEB", count: 1 },
  { id: "ram",     name: "RAM",           icon: "albums",         emoji: "🧩", color: "#27500A", bgColor: "#EAF3DE", count: 2 },
];

// ── Componentes de ejemplo ────────────────────────────────────────────────────
export const COMPONENTS: HardwareComponent[] = [
  {
    id: "c1", categoryId: "cpu",
    name: "Ryzen 7 5700G", model: "100-100000263BOX",
    notes: "RAM estable a 3600 MHz CL16 · Voltaje 1.35V · Perfil DOCP activo. Ideal para setup sin GPU dedicada.",
    tags: ["APU", "AM4", "Zen 3"],
    specs: [
      { key: "Núcleos / Hilos", value: "8C / 16T" },
      { key: "Frecuencia base",  value: "3.8 GHz" },
      { key: "Boost máx",        value: "4.6 GHz" },
      { key: "TDP",              value: "65W" },
      { key: "Socket",           value: "AM4" },
      { key: "GPU integrada",    value: "Radeon RX Vega 8" },
      { key: "Caché L3",         value: "16 MB" },
    ],
    hasImage: true, createdAt: "2024-01-10", updatedAt: "2024-06-03",
  },
  {
    id: "c2", categoryId: "cpu",
    name: "Ryzen 5 5600X", model: "100-100000065BOX",
    notes: "Sin gráficos integrados. Excelente para gaming con GPU dedicada.",
    tags: ["AM4", "Zen 3", "Gaming"],
    specs: [
      { key: "Núcleos / Hilos", value: "6C / 12T" },
      { key: "Frecuencia base",  value: "3.7 GHz" },
      { key: "Boost máx",        value: "4.6 GHz" },
      { key: "TDP",              value: "65W" },
      { key: "Socket",           value: "AM4" },
      { key: "Caché L3",         value: "32 MB" },
    ],
    hasImage: false, createdAt: "2024-02-15", updatedAt: "2024-05-20",
  },
  {
    id: "c3", categoryId: "kb",
    name: "Keychron K2 Pro", model: "K2P-B3-US",
    notes: "Switches Gateron G Pro Brown. Perfil OSA. Modo inalámbrico activo por defecto.",
    tags: ["Mecánico", "BT 5.1", "75%"],
    specs: [
      { key: "Disposición",    value: "75% (84 teclas)" },
      { key: "Switch",         value: "Gateron G Pro Brown" },
      { key: "Conectividad",   value: "USB-C / BT 5.1" },
      { key: "Batería",        value: "4000 mAh" },
      { key: "Retroiluminación", value: "RGB per-key" },
    ],
    hasImage: false, createdAt: "2024-03-01", updatedAt: "2024-06-01",
  },
];
