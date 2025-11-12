/**
 * Geração de IDs únicos
 */
import { randomUUID } from 'crypto';

/**
 * Gera um ID único usando UUID v4
 */
export function generateId(): string {
  return randomUUID();
}

