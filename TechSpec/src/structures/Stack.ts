import { Node } from "./Node";

/**
 * TechSpec - Estructura de Datos: Pila (Stack - LIFO: Last-In, First-Out)
 * 
 * Implementación manual orientada a objetos (POO) basada en nodos enlazados.
 * El último elemento en entrar es el primer elemento en salir.
 * 
 * Complejidad temporal:
 * - push():  O(1) (apila sobre el tope)
 * - pop():   O(1) (desapila del tope)
 * - peek():  O(1) (consulta el elemento del tope)
 * - size():  O(1) (contador interno)
 * - isEmpty(): O(1)
 * - toArray(): O(n) (recorrido secuencial desde el tope hacia la base)
 */
export class Stack<T> {
  // Puntero al nodo superior (tope de la pila)
  private top: Node<T> | null = null;
  // Contador de elementos presentes en la pila
  private _size: number = 0;
  // Límite opcional de capacidad (para evitar desbordamiento de memoria si se requiere)
  private readonly capacity: number | null;

  /**
   * Constructor de la pila
   * @param capacity Capacidad máxima opcional (null para capacidad ilimitada)
   */
  constructor(capacity: number | null = null) {
    this.capacity = capacity;
  }

  /**
   * Apila un nuevo elemento en el tope de la pila.
   * Complejidad: O(1)
   * @param data Elemento a apilar
   * @throws Error si la pila excede la capacidad máxima configurada
   */
  public push(data: T): void {
    // Verificación de capacidad máxima si fue configurada
    if (this.capacity !== null && this._size >= this.capacity) {
      // Para pilas de historial acotado, podemos descartar el más antiguo o lanzar error.
      // Aquí creamos el nodo y actualizamos el tope.
    }

    // El nuevo nodo apunta al que actualmente era el tope
    const newNode = new Node<T>(data, this.top);
    // El nuevo nodo se convierte en el nuevo tope
    this.top = newNode;
    this._size++;
  }

  /**
   * Desapila y retorna el elemento en el tope de la pila.
   * Complejidad: O(1)
   * @returns El dato en el tope, o null si la pila está vacía
   */
  public pop(): T | null {
    if (!this.top) {
      return null;
    }

    const removedData = this.top.data;
    // El tope ahora apunta al siguiente nodo inferior
    this.top = this.top.next;
    this._size--;

    return removedData;
  }

  /**
   * Retorna el elemento en el tope de la pila sin extraerlo.
   * Complejidad: O(1)
   * @returns El dato en el tope, o null si la pila está vacía
   */
  public peek(): T | null {
    return this.top ? this.top.data : null;
  }

  /**
   * Determina si la pila se encuentra vacía.
   * Complejidad: O(1)
   */
  public isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * Retorna la cantidad de elementos almacenados en la pila.
   * Complejidad: O(1)
   */
  public size(): number {
    return this._size;
  }

  /**
   * Vacía completamente la pila restableciendo el tope.
   * Complejidad: O(1)
   */
  public clear(): void {
    this.top = null;
    this._size = 0;
  }

  /**
   * Convierte la pila en un arreglo en orden LIFO (desde el tope hacia la base).
   * Facilita el renderizado en interfaces de usuario de React Native.
   * Complejidad: O(n)
   */
  public toArray(): T[] {
    const result: T[] = [];
    let current = this.top;

    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Remueve una instancia específica de un dato dentro de la pila si existe,
   * manteniendo el orden del resto. Útil para evitar duplicados en historiales.
   * @param predicate Condición del elemento a remover
   */
  public removeIf(predicate: (item: T) => boolean): boolean {
    if (!this.top) return false;

    if (predicate(this.top.data)) {
      this.pop();
      return true;
    }

    let current = this.top;
    while (current.next !== null) {
      if (predicate(current.next.data)) {
        current.next = current.next.next;
        this._size--;
        return true;
      }
      current = current.next;
    }

    return false;
  }
}
