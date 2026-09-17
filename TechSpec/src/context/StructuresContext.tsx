import React, { createContext, useContext, useState, useRef, useMemo } from "react";
import { Stack, LinkedList, Queue } from "../structures";
import { HardwareComponent, Spec } from "../../assets/data";

interface StructuresContextType {
  // ── Pila de Historial de Componentes Vistos Recientemente (LIFO) ──
  recentlyViewed: HardwareComponent[];
  pushRecentlyViewed: (component: HardwareComponent) => void;
  popRecentlyViewed: () => HardwareComponent | null;
  peekRecentlyViewed: () => HardwareComponent | null;
  clearRecentlyViewed: () => void;
  recentlyViewedStackSize: number;

  // ── Pila de Deshacer Eliminación (Undo Stack - LIFO) ──
  canUndo: boolean;
  pushUndo: (component: HardwareComponent) => void;
  popUndo: () => HardwareComponent | null;
  peekUndo: () => HardwareComponent | null;
  undoStackSize: number;

  // ── Cola de Comparación de Componentes (Queue - FIFO) ──
  comparisonQueue: HardwareComponent[];
  comparisonQueueSize: number;
  comparisonQueueCapacity: number;
  isQueuedForComparison: (id: string) => boolean;
  enqueueForComparison: (component: HardwareComponent) => boolean;
  dequeueFromComparison: () => HardwareComponent | null;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;

  // ── Fábrica / Utilidades de Listas Enlazadas ──
  createComponentsLinkedList: (items: HardwareComponent[]) => LinkedList<HardwareComponent>;
  createSpecsLinkedList: (specs: Spec[]) => LinkedList<Spec>;
}

// Capacidad máxima de la cola de comparación (FIFO acotada)
const COMPARISON_CAPACITY = 3;

const StructuresContext = createContext<StructuresContextType | undefined>(undefined);

export function StructuresProvider({ children }: { children: React.ReactNode }) {
  // Instancias persistentes de las estructuras basadas en POO
  const historyStackRef = useRef<Stack<HardwareComponent>>(new Stack<HardwareComponent>(15));
  const undoStackRef    = useRef<Stack<HardwareComponent>>(new Stack<HardwareComponent>(10));
  // Cola FIFO acotada: solo tiene sentido comparar unas pocas piezas a la vez
  const comparisonQueueRef = useRef<Queue<HardwareComponent>>(new Queue<HardwareComponent>(COMPARISON_CAPACITY));

  // Estados locales para forzar re-renderizados en la UI de React al mutar las estructuras
  const [recentlyViewed, setRecentlyViewed] = useState<HardwareComponent[]>([]);
  const [canUndo, setCanUndo]               = useState<boolean>(false);
  const [undoStackSize, setUndoStackSize]   = useState<number>(0);
  const [comparisonQueue, setComparisonQueue] = useState<HardwareComponent[]>([]);

  // ── Operaciones de la Pila de Historial (LIFO) ──
  const pushRecentlyViewed = (component: HardwareComponent) => {
    const stack = historyStackRef.current;
    // Evita duplicados en la pila removiendo la ocurrencia previa
    stack.removeIf(c => c.id === component.id);
    // Apila el nuevo componente en el tope O(1)
    stack.push(component);
    // Actualiza la vista extrayendo el arreglo LIFO
    setRecentlyViewed(stack.toArray());
  };

  const popRecentlyViewed = (): HardwareComponent | null => {
    const stack = historyStackRef.current;
    const popped = stack.pop();
    setRecentlyViewed(stack.toArray());
    return popped;
  };

  const peekRecentlyViewed = (): HardwareComponent | null => {
    return historyStackRef.current.peek();
  };

  const clearRecentlyViewed = () => {
    historyStackRef.current.clear();
    setRecentlyViewed([]);
  };

  // ── Operaciones de la Pila de Deshacer (Undo LIFO) ──
  const pushUndo = (component: HardwareComponent) => {
    const stack = undoStackRef.current;
    stack.push(component);
    setCanUndo(!stack.isEmpty());
    setUndoStackSize(stack.size());
  };

  const popUndo = (): HardwareComponent | null => {
    const stack = undoStackRef.current;
    const popped = stack.pop();
    setCanUndo(!stack.isEmpty());
    setUndoStackSize(stack.size());
    return popped;
  };

  const peekUndo = (): HardwareComponent | null => {
    return undoStackRef.current.peek();
  };

  // ── Operaciones de la Cola de Comparación (FIFO) ──
  const isQueuedForComparison = (id: string): boolean => {
    return comparisonQueueRef.current.contains(c => c.id === id);
  };

  const enqueueForComparison = (component: HardwareComponent): boolean => {
    const queue = comparisonQueueRef.current;

    // Evitamos duplicados: el mismo componente no se compara contra sí mismo
    if (queue.contains(c => c.id === component.id)) return false;

    // Si la cola está llena, desencolamos el más antiguo (FIFO) y entra el nuevo
    if (queue.isFull()) queue.dequeue();

    const inserted = queue.enqueue(component);
    setComparisonQueue(queue.toArray());
    return inserted;
  };

  const dequeueFromComparison = (): HardwareComponent | null => {
    const queue = comparisonQueueRef.current;
    const removed = queue.dequeue(); // Sale el primero que entró (FIFO)
    setComparisonQueue(queue.toArray());
    return removed;
  };

  const removeFromComparison = (id: string) => {
    const queue = comparisonQueueRef.current;
    queue.removeIf(c => c.id === id);
    setComparisonQueue(queue.toArray());
  };

  const clearComparison = () => {
    comparisonQueueRef.current.clear();
    setComparisonQueue([]);
  };

  // ── Operaciones con Listas Enlazadas ──
  const createComponentsLinkedList = (items: HardwareComponent[]): LinkedList<HardwareComponent> => {
    return LinkedList.fromArray(items);
  };

  const createSpecsLinkedList = (specs: Spec[]): LinkedList<Spec> => {
    return LinkedList.fromArray(specs);
  };

  const value = useMemo<StructuresContextType>(() => ({
    recentlyViewed,
    pushRecentlyViewed,
    popRecentlyViewed,
    peekRecentlyViewed,
    clearRecentlyViewed,
    recentlyViewedStackSize: historyStackRef.current.size(),

    canUndo,
    pushUndo,
    popUndo,
    peekUndo,
    undoStackSize,

    comparisonQueue,
    comparisonQueueSize: comparisonQueue.length,
    comparisonQueueCapacity: COMPARISON_CAPACITY,
    isQueuedForComparison,
    enqueueForComparison,
    dequeueFromComparison,
    removeFromComparison,
    clearComparison,

    createComponentsLinkedList,
    createSpecsLinkedList,
  }), [recentlyViewed, canUndo, undoStackSize, comparisonQueue]);

  return (
    <StructuresContext.Provider value={value}>
      {children}
    </StructuresContext.Provider>
  );
}

export function useStructures(): StructuresContextType {
  const context = useContext(StructuresContext);
  if (!context) {
    throw new Error("useStructures debe ser usado dentro de un StructuresProvider");
  }
  return context;
}
