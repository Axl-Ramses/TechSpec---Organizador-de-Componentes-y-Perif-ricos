/**
 * TechSpec - Estructura de Datos
 * Clase genérica Node<T> para estructuras enlazadas (Listas Enlazadas, Pilas, etc.)
 * 
 * Implementación manual siguiendo el paradigma de Programación Orientada a Objetos (POO).
 */
export class Node<T> {
  // Dato o valor almacenado en el nodo
  public data: T;
  
  // Puntero / referencia al siguiente nodo en la secuencia
  public next: Node<T> | null;

  /**
   * Constructor del nodo
   * @param data Valor que almacenará el nodo
   * @param next Referencia al siguiente nodo (opcional, null por defecto)
   */
  constructor(data: T, next: Node<T> | null = null) {
    this.data = data;
    this.next = next;
  }
}
