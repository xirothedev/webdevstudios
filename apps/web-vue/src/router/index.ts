import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { authStoreReady } from '@/composables/use-auth';
import { adminRedirectFor } from '@/lib/auth';

declare module 'vue-router' {
  interface RouteMeta {
    /** mirrors apps/web app/admin/layout.tsx guard */
    admin?: boolean;
    /** pages that render their own chrome (auth/admin layouts) hide the App.vue Navbar/Footer */
    chrome?: 'none';
    /** apps/web Navbar variant per route (default dark) */
    navbarVariant?: 'dark' | 'light';
  }
}

// Same URL paths as apps/web; dynamic params use the apps/web segment names.
// meta.admin is the ONLY guard apps/web has (admin layout); every other route is
// public and its pages self-redirect on 401 — do not add auth gates they don't have.
// navbarVariant/chrome mirror the per-page <Navbar variant> / own-chrome usage in apps/web.
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home.vue'),
    meta: { navbarVariant: 'light' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/about.vue'),
    meta: { navbarVariant: 'light' },
  },
  {
    path: '/account/profile',
    name: 'account-profile',
    component: () => import('@/pages/account/profile.vue'),
    meta: { navbarVariant: 'light' },
  },
  {
    path: '/account/settings',
    name: 'account-settings',
    component: () => import('@/pages/account/settings.vue'),
    meta: { navbarVariant: 'light' },
  },
  {
    path: '/achievements',
    name: 'achievements',
    component: () => import('@/pages/achievements.vue'),
  },
  { path: '/activities', name: 'activities', component: () => import('@/pages/activities.vue') },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/pages/admin/index.vue'),
    meta: { admin: true, chrome: 'none' },
  },
  {
    path: '/admin/blog',
    name: 'admin-blog',
    component: () => import('@/pages/admin/blog/index.vue'),
    meta: { admin: true, chrome: 'none' },
  },
  {
    path: '/admin/blog/new',
    name: 'admin-blog-new',
    component: () => import('@/pages/admin/blog/new.vue'),
    meta: { admin: true, chrome: 'none' },
  },
  {
    path: '/admin/blog/:id',
    name: 'admin-blog-edit',
    component: () => import('@/pages/admin/blog/[id].vue'),
    meta: { admin: true, chrome: 'none' },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/pages/admin/orders.vue'),
    meta: { admin: true, chrome: 'none' },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('@/pages/admin/products.vue'),
    meta: { admin: true, chrome: 'none' },
  },
  {
    path: '/admin/transactions',
    name: 'admin-transactions',
    component: () => import('@/pages/admin/transactions.vue'),
    meta: { admin: true, chrome: 'none' },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/pages/admin/users.vue'),
    meta: { admin: true, chrome: 'none' },
  },
  {
    path: '/auth/2fa',
    name: 'auth-2fa',
    component: () => import('@/pages/auth/2fa.vue'),
    meta: { chrome: 'none' },
  },
  {
    path: '/auth/forgot-password',
    name: 'auth-forgot-password',
    component: () => import('@/pages/auth/forgot-password.vue'),
    meta: { chrome: 'none' },
  },
  {
    path: '/auth/login',
    name: 'auth-login',
    component: () => import('@/pages/auth/login.vue'),
    meta: { chrome: 'none' },
  },
  {
    path: '/auth/oauth/callback',
    name: 'auth-oauth-callback',
    component: () => import('@/pages/auth/oauth-callback.vue'),
    meta: { chrome: 'none' },
  },
  {
    path: '/auth/reset-password',
    name: 'auth-reset-password',
    component: () => import('@/pages/auth/reset-password.vue'),
    meta: { chrome: 'none' },
  },
  {
    path: '/auth/signup',
    name: 'auth-signup',
    component: () => import('@/pages/auth/signup.vue'),
    meta: { chrome: 'none' },
  },
  {
    path: '/auth/verify-email',
    name: 'auth-verify-email',
    component: () => import('@/pages/auth/verify-email.vue'),
    meta: { chrome: 'none' },
  },
  { path: '/blog', name: 'blog', component: () => import('@/pages/blog/index.vue') },
  { path: '/blog/:slug', name: 'blog-post', component: () => import('@/pages/blog/[slug].vue') },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('@/pages/calendar.vue'),
    meta: { navbarVariant: 'light' },
  },
  { path: '/cart', name: 'cart', component: () => import('@/pages/cart.vue') },
  { path: '/checkout', name: 'checkout', component: () => import('@/pages/checkout.vue') },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('@/pages/faq.vue'),
    meta: { navbarVariant: 'light' },
  },
  {
    path: '/generation',
    name: 'generation',
    component: () => import('@/pages/generation.vue'),
    meta: { navbarVariant: 'light' },
  },
  { path: '/privacy', name: 'legal-privacy', component: () => import('@/pages/legal/privacy.vue') },
  { path: '/refund', name: 'legal-refund', component: () => import('@/pages/legal/refund.vue') },
  { path: '/terms', name: 'legal-terms', component: () => import('@/pages/legal/terms.vue') },
  { path: '/orders', name: 'orders', component: () => import('@/pages/orders/index.vue') },
  { path: '/orders/:id', name: 'order-detail', component: () => import('@/pages/orders/[id].vue') },
  { path: '/partner', name: 'partner', component: () => import('@/pages/partner.vue') },
  {
    path: '/payments/cancel',
    name: 'payments-cancel',
    component: () => import('@/pages/payments/cancel.vue'),
  },
  {
    path: '/payments/return',
    name: 'payments-return',
    component: () => import('@/pages/payments/return.vue'),
  },
  {
    path: '/payments/:orderId',
    name: 'payments-detail',
    component: () => import('@/pages/payments/[orderId].vue'),
  },
  { path: '/shop', name: 'shop', component: () => import('@/pages/shop/index.vue') },
  {
    path: '/shop/ao-thun',
    name: 'shop-ao-thun',
    component: () => import('@/pages/shop/ao-thun.vue'),
  },
  {
    path: '/shop/day-deo',
    name: 'shop-day-deo',
    component: () => import('@/pages/shop/day-deo.vue'),
  },
  {
    path: '/shop/moc-khoa',
    name: 'shop-moc-khoa',
    component: () => import('@/pages/shop/moc-khoa.vue'),
  },
  {
    path: '/shop/pad-chuot',
    name: 'shop-pad-chuot',
    component: () => import('@/pages/shop/pad-chuot.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/not-found.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// Guard mirrors apps/web app/admin/layout.tsx: while the current-user query is loading it
// renders nothing; !isAuthenticated -> /auth/login; role !== 'ADMIN' -> /
router.beforeEach(async (to) => {
  if (!to.meta.admin) return true;
  const store = await authStoreReady();
  await store.whenLoaded();
  return adminRedirectFor(store.user.value);
});
