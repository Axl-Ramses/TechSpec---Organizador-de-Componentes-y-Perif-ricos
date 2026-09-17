import { Node } from "./Node";

/**
 * TechSpec - Estructura de Datos: Cola (Queue - FIFO: First-In, First-Out)
 *
 * Implementación manual orientada a objetos (POO) basada en nodos enlazados.
 * El primer elemento en entrar es el primer elemento en salir.
 *
 * Se mantienen dos punteros (frente y final) para que el encolado sea O(1):
 * sin el puntero al final habría que recorrer toda la cola en cada inserción.
 *
 * Complejidad temporal:
 * - enqueue(): O(1) (inserta al final usando el puntero rear)
 * - dequeue(): O(1) (extrae del frente)
 * - peek():    O(1) (consulta el elemento del frente)
 * - size():    O(1) (contador interno)
 * - isEmpty(): O(1)
 * - isFull():  O(1)
 * - contains() / removeIf() / toArray(): O(n) (recorrido secuencial)
 */
export class Queue<T> {
  // Puntero al primer nodo de la cola (frente: por aquí se atiende / sale)
  private front: Node<T> | null = null;
  // Puntero al último nodo de la cola (final: por aquí se encola / entra)
  private rear: Node<T> | null = null;
  // Contador de elementos presentes en la cola
  private _size: number = 0;
  // Límite opcional de capacidad (null = ilimitada)
  private readonly capacity: number | null;

  /**
   * Constructor de la cola
   * @param capacity Capacidad máxima opcional (null para capacidad ilimitada)
   */
  constructor(capacity: number | null = null) {
    this.capacity = capacity;
  }

  /**
   * Encola un elemento al final de la cola.
   * Complejidad: O(1)
   * @param data Elemento a encolar
   * @returns true si se encoló, false si la cola ya estaba llena
   */
  public enqueue(data: T): boolean {
    // Desbordamiento: la cola alcanzó su capacidad máxima
    if (this.isFull()) {
      return false;
    }

    const newNode = new Node<T>(data);

    if (this.rear === null) {
      // Cola vacía: el nuevo nodo es simultáneamente frente y final
      this.front = newNode;
      this.rear  = newNode;
    } else {
      // El antiguo final apunta al nuevo nodo y el final se desplaza
      this.rear.next = newNode;
      this.rear      = newNode;
    }

    this._size++;
    return true;
  }

  /**
   * Extrae y retorna el elemento del frente de la cola.
   * Complejidad: O(1)
   * @returns El dato del frente, o null si la cola está vacía
   */
  public dequeue(): T | null {
    if (this.front === null) {
      return null;
    }

    const removedData = this.front.data;
    // El frente avanza al siguiente nodo
    this.front = this.front.next;

    // Si la cola quedó vacía, el puntero al final también se limpia
    if (this.front === null) {
      this.rear = null;
    }

    this._size--;
    return removedData;
  }

  /**
   * Retorna el elemento del frente sin extraerlo.
   * Complejidad: O(1)
   */
  public peek(): T | null {
    return this.front ? this.front.data : null;
  }

  /**
   * Retorna el último elemento encolado sin extraerlo.
   * Complejidad: O(1)
   */
  public peekRear(): T | null {
    return this.rear ? this.rear.data : null;
  }

  /**
   * Determina si la cola se encuentra vacía.
   * Complejidad: O(1)
   */
  public isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * Determina si la cola alcanzó su capacidad máxima.
   * Complejidad: O(1)
   */
  public isFull(): boolean {
    return this.capacity !== null && this._size >= this.capacity;
  }

  /**
   * Retorna la cantidad de elementos almacenados en la cola.
   * Complejidad: O(1)
   */
  public size(): number {
    return this._size;
  }

  /**
   * Retorna la capacidad máxima configurada (null si es ilimitada).
   * Complejidad: O(1)
   */
  public maxSize(): number | null {
    return this.capacity;
  }

  /**
   * Verifica si existe un elemento que cumpla la condición dada.
   * Complejidad: O(n)
   */
  public contains(predicate: (item: T) => boolean): boolean {
    let current = this.front;

    while (current !== null) {
      if (predicate(current.data)) return true;
      current = current.next;
    }

    return false;
  }

  /**
   * Remueve el primer elemento que cumpla la condición, conservando el orden
   * FIFO del resto. Necesario para poder sacar un componente concreto de la
   * comparación sin vaciar la cola completa.
   * Complejidad: O(n)
   * @returns true si se removió algún elemento
   */
  public removeIf(predicate: (item: T) => boolean): boolean {
    if (this.front === null) return false;

    // Caso 1: el elemento a remover está en el frente
    if (predicate(this.front.data)) {
      this.dequeue();
      return true;
    }

    // Caso 2: se busca en el resto de la cola manteniendo el nodo previo
    let previous = this.front;
    while (previous.next !== null) {
      if (predicate(previous.next.data)) {
        // Si removemos el último nodo, el puntero rear debe retroceder
        if (previous.next === this.rear) {
          this.rear = previous;
        }
        previous.next = previous.next.next;
        this._size--;
        return true;
      }
      previous = previous.next;
    }

    return false;
  }

  /**
   * Vacía completamente la cola.
   * Complejidad: O(1)
   */
  public clear(): void {
    this.front = null;
    this.rear  = null;
    this._size = 0;
  }

  /**
   * Convierte la cola en un arreglo en orden FIFO (del frente al final).
   * Facilita el renderizado en interfaces de React Native.
   * Complejidad: O(n)
   */
  public toArray(): T[] {
    const result: T[] = [];
    let current = this.front;

    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Construye una cola a partir de un arreglo, encolando en orden.
   * Complejidad: O(n)
   */
  public static fromArray<T>(items: T[], capacity: number | null = null): Queue<T> {
    const queue = new Queue<T>(capacity);
    for (const item of items) {
      queue.enqueue(item);
    }
    return queue;
  }
}
