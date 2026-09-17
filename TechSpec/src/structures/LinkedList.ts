import { Node } from "./Node";

/**
 * TechSpec - Estructura de Datos: Lista Enlazada Simple (Singly Linked List)
 * 
 * Implementación manual orientada a objetos (POO) sin librerías predefinidas.
 * Cumple con el requerimiento de almacenar colecciones dinámicas de datos mediante
 * nodos encadenados por punteros 'next'.
 * 
 * Complejidad temporal:
 * - Inserción al inicio: O(1)
 * - Inserción al final: O(n) o O(1) con puntero tail
 * - Búsqueda: O(n)
 * - Eliminación: O(n)
 * - Recorrido: O(n)
 */
export class LinkedList<T> {
  // Puntero al primer nodo de la lista
  private head: Node<T> | null = null;
  // Puntero al último nodo de la lista para optimizar inserción al final a O(1)
  private tail: Node<T> | null = null;
  // Contador de elementos presentes en la lista
  private _size: number = 0;

  /**
   * Inserta un nuevo elemento al final de la lista (Append).
   * Complejidad: O(1) gracias al puntero tail.
   * @param data Elemento a insertar
   */
  public insert(data: T): void {
    const newNode = new Node<T>(data);

    if (!this.head) {
      // Lista vacía: head y tail apuntan al nuevo nodo
      this.head = newNode;
      this.tail = newNode;
    } else if (this.tail) {
      // Enlaza el último nodo al nuevo y actualiza el tail
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this._size++;
  }

  /**
   * Inserta un nuevo elemento al inicio de la lista (Prepend).
   * Complejidad: O(1)
   * @param data Elemento a insertar
   */
  public insertFirst(data: T): void {
    const newNode = new Node<T>(data, this.head);
    this.head = newNode;

    if (!this.tail) {
      this.tail = newNode;
    }

    this._size++;
  }

  /**
   * Busca el primer elemento que cumpla con el predicado proporcionado.
   * Complejidad: O(n)
   * @param predicate Función de condición de búsqueda
   * @returns El dato encontrado o null si no existe
   */
  public find(predicate: (item: T) => boolean): T | null {
    let current = this.head;

    while (current !== null) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.next;
    }

    return null;
  }

  /**
   * Elimina el primer elemento que cumpla con el predicado.
   * Complejidad: O(n)
   * @param predicate Función que identifica al elemento a eliminar
   * @returns El dato eliminado o null si no se encontró
   */
  public delete(predicate: (item: T) => boolean): T | null {
    if (!this.head) return null;

    // Caso 1: El elemento a eliminar está en el head
    if (predicate(this.head.data)) {
      const removed = this.head.data;
      this.head = this.head.next;
      this._size--;

      if (this._size === 0) {
        this.tail = null;
      }

      return removed;
    }

    // Caso 2: El elemento está en el cuerpo o al final de la lista
    let current = this.head;
    while (current.next !== null) {
      if (predicate(current.next.data)) {
        const removed = current.next.data;

        // Si eliminamos el último elemento, actualizamos tail
        if (current.next === this.tail) {
          this.tail = current;
        }

        // Saltamos el nodo a eliminar (desvinculación del puntero)
        current.next = current.next.next;
        this._size--;
        return removed;
      }
      current = current.next;
    }

    return null;
  }

  /**
   * Filtra elementos que cumplan con una condición y retorna un arreglo nativo
   * útil para renderizado en componentes visuales.
   * Complejidad: O(n)
   * @param predicate Función de filtrado
   */
  public filter(predicate: (item: T) => boolean): T[] {
    const results: T[] = [];
    let current = this.head;

    while (current !== null) {
      if (predicate(current.data)) {
        results.push(current.data);
      }
      current = current.next;
    }

    return results;
  }

  /**
   * Recorre la lista secuencialmente ejecutando un callback para cada elemento.
   * Complejidad: O(n)
   */
  public forEach(callback: (item: T, index: number) => void): void {
    let current = this.head;
    let index = 0;

    while (current !== null) {
      callback(current.data, index);
      current = current.next;
      index++;
    }
  }

  /**
   * Convierte la lista enlazada a un arreglo estándar de JavaScript.
   * Facilita el paso de datos a FlatLists y componentes de React Native.
   * Complejidad: O(n)
   */
  public toArray(): T[] {
    const array: T[] = [];
    let current = this.head;

    while (current !== null) {
      array.push(current.data);
      current = current.next;
    }

    return array;
  }

  /**
   * Retorna la cantidad de elementos en la lista.
   * Complejidad: O(1)
   */
  public size(): number {
    return this._size;
  }

  /**
   * Indica si la lista se encuentra vacía.
   * Complejidad: O(1)
   */
  public isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * Vacía completamente la lista liberando referencias.
   * Complejidad: O(1)
   */
  public clear(): void {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  /**
   * Método de fábrica para crear e inicializar una lista enlazada a partir de un arreglo.
   * @param items Arreglo inicial de datos
   */
  public static fromArray<T>(items: T[]): LinkedList<T> {
    const list = new LinkedList<T>();
    for (const item of items) {
      list.insert(item);
    }
    return list;
  }
}
