/**
 * TechSpec - Algoritmos de Ordenamiento implementados manualmente
 *
 * No se usa Array.prototype.sort(): los algoritmos están escritos a mano para
 * poder instrumentar el número de comparaciones e intercambios que realiza
 * cada uno y mostrarlo en la interfaz.
 *
 * - Merge Sort: O(n log n) en el mejor, promedio y peor caso. Estable.
 *   Divide el arreglo por la mitad, ordena cada mitad y mezcla ambas.
 * - Quick Sort: O(n log n) promedio, O(n²) en el peor caso. No estable.
 *   Particiona alrededor de un pivote y ordena cada partición.
 */

/** Función de comparación: negativo si a va antes, positivo si b va antes. */
export type Comparator<T> = (a: T, b: T) => number;

/** Métricas recolectadas durante el ordenamiento, para mostrarlas en la UI. */
export interface SortMetrics {
  algorithm:   string;
  comparisons: number;
  swaps:       number;
  items:       number;
}

export interface SortResult<T> {
  sorted:  T[];
  metrics: SortMetrics;
}

/**
 * Merge Sort (ordenamiento por mezcla) — O(n log n), estable.
 * Trabaja sobre una copia, por lo que no muta el arreglo recibido
 * (importante: el arreglo de Redux es inmutable).
 */
export function mergeSort<T>(items: T[], compare: Comparator<T>): SortResult<T> {
  let comparisons = 0;

  // Mezcla dos mitades ya ordenadas en un solo arreglo ordenado — O(n)
  const merge = (left: T[], right: T[]): T[] => {
    const merged: T[] = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      comparisons++;
      if (compare(left[i], right[j]) <= 0) {
        merged.push(left[i]);
        i++;
      } else {
        merged.push(right[j]);
        j++;
      }
    }

    // Los elementos restantes de una mitad ya están ordenados
    while (i < left.length) { merged.push(left[i]); i++; }
    while (j < right.length) { merged.push(right[j]); j++; }

    return merged;
  };

  // División recursiva hasta llegar a subarreglos de un solo elemento
  const divide = (list: T[]): T[] => {
    if (list.length <= 1) return list;

    const middle = Math.floor(list.length / 2);
    const left   = divide(list.slice(0, middle));
    const right  = divide(list.slice(middle));

    return merge(left, right);
  };

  const sorted = divide([...items]);

  return {
    sorted,
    metrics: {
      algorithm:   "Merge Sort  ·  O(n log n)",
      comparisons,
      swaps:       0, // Merge Sort no intercambia: construye arreglos nuevos
      items:       items.length,
    },
  };
}

/**
 * Quick Sort (ordenamiento rápido) — O(n log n) promedio, in-place.
 * Usa el esquema de partición de Lomuto con el último elemento como pivote.
 */
export function quickSort<T>(items: T[], compare: Comparator<T>): SortResult<T> {
  let comparisons = 0;
  let swaps       = 0;

  // Se ordena una copia para no mutar el arreglo original
  const list = [...items];

  const swap = (i: number, j: number) => {
    if (i === j) return;
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
    swaps++;
  };

  // Partición de Lomuto: deja el pivote en su posición final y retorna su índice
  const partition = (low: number, high: number): number => {
    const pivot = list[high];
    let boundary = low - 1;

    for (let current = low; current < high; current++) {
      comparisons++;
      if (compare(list[current], pivot) <= 0) {
        boundary++;
        swap(boundary, current);
      }
    }

    swap(boundary + 1, high);
    return boundary + 1;
  };

  const sort = (low: number, high: number): void => {
    if (low >= high) return;

    const pivotIndex = partition(low, high);
    sort(low, pivotIndex - 1);  // Sub-arreglo izquierdo (menores al pivote)
    sort(pivotIndex + 1, high); // Sub-arreglo derecho (mayores al pivote)
  };

  sort(0, list.length - 1);

  return {
    sorted: list,
    metrics: {
      algorithm:   "Quick Sort  ·  O(n log n) prom.",
      comparisons,
      swaps,
      items:       items.length,
    },
  };
}

// ── Comparadores reutilizables para HardwareComponent ────────────────────────

/** Comparación alfabética insensible a mayúsculas y acentos. */
export const byText = (a: string, b: string): number =>
  a.localeCompare(b, "es", { sensitivity: "base" });

/**
 * Convierte una fecha "DD-MM-AAAA" (formato usado en los datos de la app) o
 * una fecha ISO de Supabase en un número comparable.
 */
export const dateToNumber = (value: string): number => {
  if (!value) return 0;

  // Formato local DD-MM-AAAA
  const localMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (localMatch) {
    const [, day, month, year] = localMatch;
    return Number(`${year}${month}${day}`);
  }

  // Cualquier otro formato reconocible (ISO de Supabase)
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};
