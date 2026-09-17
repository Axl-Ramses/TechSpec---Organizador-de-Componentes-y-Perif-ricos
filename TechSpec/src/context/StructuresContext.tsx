import React, { createContext, useContext, useState, useRef, useMemo } from "react";
import { Stack, LinkedList } from "../structures";
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

  // ── Fábrica / Utilidades de Listas Enlazadas ──
  createComponentsLinkedList: (items: HardwareComponent[]) => LinkedList<HardwareComponent>;
  createSpecsLinkedList: (specs: Spec[]) => LinkedList<Spec>;
}

const StructuresContext = createContext<StructuresContextType | undefined>(undefined);

export function StructuresProvider({ children }: { children: React.ReactNode }) {
  // Instancias persistentes de las estructuras basadas en POO
  const historyStackRef = useRef<Stack<HardwareComponent>>(new Stack<HardwareComponent>(15));
  const undoStackRef    = useRef<Stack<HardwareComponent>>(new Stack<HardwareComponent>(10));

  // Estados locales para forzar re-renderizados en la UI de React al mutar las estructuras
  const [recentlyViewed, setRecentlyViewed] = useState<HardwareComponent[]>([]);
  const [canUndo, setCanUndo]               = useState<boolean>(false);
  const [undoStackSize, setUndoStackSize]   = useState<number>(0);

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

    createComponentsLinkedList,
    createSpecsLinkedList,
  }), [recentlyViewed, canUndo, undoStackSize]);

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
