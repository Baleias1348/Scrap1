/**
 * Utility helpers used across the app
 */

// Tailwind + clsx merge helper (compatible with tailwind-merge once deps are installed)
export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// Simple event emitter used before WebSocket integration
export type Listener = (...args: any[]) => void;

export class Emitter {
  private events = new Map<string, Set<Listener>>();

  on(event: string, listener: Listener) {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: string, listener: Listener) {
    this.events.get(event)?.delete(listener);
  }

  emit(event: string, ...args: any[]) {
    this.events.get(event)?.forEach((l) => l(...args));
  }
}