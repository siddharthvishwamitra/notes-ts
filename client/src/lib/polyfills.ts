// Polyfill for Node.js 'global' in browser environment
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  (window as any).global = window;
}