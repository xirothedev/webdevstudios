// Owns the checkout → payments handshake in localStorage. Both keys live here;
// call sites go through these named functions, never the raw keys.

const PENDING_ORDER_ID_KEY = 'pendingOrderId';
const paymentUrlKey = (orderId: string) => `paymentUrl_${orderId}`;

export function usePendingOrder() {
  return {
    id: () => localStorage.getItem(PENDING_ORDER_ID_KEY),
    remember: (orderId: string) => localStorage.setItem(PENDING_ORDER_ID_KEY, orderId),
    clearFor: (orderId: string) => {
      localStorage.removeItem(PENDING_ORDER_ID_KEY);
      localStorage.removeItem(paymentUrlKey(orderId));
    },
    savePaymentUrl: (orderId: string, url: string) =>
      localStorage.setItem(paymentUrlKey(orderId), url),
    paymentUrl: (orderId: string) => localStorage.getItem(paymentUrlKey(orderId)),
  };
}
