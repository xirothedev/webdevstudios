// ponytail: sonner is React-only and not in web-vue deps (no new deps allowed) — minimal DOM
// toast with sonner's call surface, top-center like apps/web's <Toaster position="top-center" />.
// Swap this file's body for vue-sonner (+ <Toaster /> in App.vue) when a dep is allowed.
type ToastType = 'success' | 'error' | 'info' | 'warning';

const colors: Record<ToastType, string> = {
  success: '#16a34a',
  error: '#dc2626',
  info: '#2563eb',
  warning: '#d97706',
};

function show(message: string, type: ToastType) {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.textContent = message;
  el.style.cssText = `position:fixed;top:1rem;left:50%;transform:translateX(-50%);z-index:9999;max-width:90vw;padding:0.75rem 1rem;border-radius:0.5rem;color:#fff;font-size:0.875rem;background:${colors[type]}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

export const toast = {
  success: (message: string) => show(message, 'success'),
  error: (message: string) => show(message, 'error'),
  info: (message: string) => show(message, 'info'),
  warning: (message: string) => show(message, 'warning'),
  message: (message: string) => show(message, 'info'),
};
