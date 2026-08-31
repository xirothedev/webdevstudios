import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { authStoreReady } from '@/composables/use-auth';
import About from '@/pages/about.vue';
import AccountProfile from '@/pages/account/profile.vue';
import AccountSettings from '@/pages/account/settings.vue';
import Achievements from '@/pages/achievements.vue';
import Activities from '@/pages/activities.vue';
import AdminBlogEdit from '@/pages/admin/blog/[id].vue';
import AdminBlog from '@/pages/admin/blog/index.vue';
import AdminBlogNew from '@/pages/admin/blog/new.vue';
import Admin from '@/pages/admin/index.vue';
import AdminOrders from '@/pages/admin/orders.vue';
import AdminProducts from '@/pages/admin/products.vue';
import AdminTransactions from '@/pages/admin/transactions.vue';
import AdminUsers from '@/pages/admin/users.vue';
import Auth2fa from '@/pages/auth/2fa.vue';
import AuthForgotPassword from '@/pages/auth/forgot-password.vue';
import AuthLogin from '@/pages/auth/login.vue';
import AuthOauthCallback from '@/pages/auth/oauth-callback.vue';
import AuthResetPassword from '@/pages/auth/reset-password.vue';
import AuthSignup from '@/pages/auth/signup.vue';
import AuthVerifyEmail from '@/pages/auth/verify-email.vue';
import Blog from '@/pages/blog/index.vue';
import BlogPost from '@/pages/blog/[slug].vue';
import Calendar from '@/pages/calendar.vue';
import Cart from '@/pages/cart.vue';
import Checkout from '@/pages/checkout.vue';
import Faq from '@/pages/faq.vue';
import Generation from '@/pages/generation.vue';
import Home from '@/pages/home.vue';
import LegalPrivacy from '@/pages/legal/privacy.vue';
import LegalRefund from '@/pages/legal/refund.vue';
import LegalTerms from '@/pages/legal/terms.vue';
import NotFound from '@/pages/not-found.vue';
import Orders from '@/pages/orders/index.vue';
import OrderDetail from '@/pages/orders/[id].vue';
import Partner from '@/pages/partner.vue';
import PaymentsCancel from '@/pages/payments/cancel.vue';
import PaymentsReturn from '@/pages/payments/return.vue';
import PaymentDetail from '@/pages/payments/[orderId].vue';
import ShopAoThun from '@/pages/shop/ao-thun.vue';
import ShopDayDeo from '@/pages/shop/day-deo.vue';
import Shop from '@/pages/shop/index.vue';
import ShopMocKhoa from '@/pages/shop/moc-khoa.vue';
import ShopPadChuot from '@/pages/shop/pad-chuot.vue';

declare module 'vue-router' {
  interface RouteMeta {
    /** mirrors apps/web app/admin/layout.tsx guard */
    admin?: boolean;
  }
}

// Same URL paths as apps/web; dynamic params use the apps/web segment names.
// meta.admin is the ONLY guard apps/web has (admin layout); every other route is
// public and its pages self-redirect on 401 — do not add auth gates they don't have.
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Home },
  { path: '/about', name: 'about', component: About },
  { path: '/account/profile', name: 'account-profile', component: AccountProfile },
  { path: '/account/settings', name: 'account-settings', component: AccountSettings },
  { path: '/achievements', name: 'achievements', component: Achievements },
  { path: '/activities', name: 'activities', component: Activities },
  { path: '/admin', name: 'admin', component: Admin, meta: { admin: true } },
  { path: '/admin/blog', name: 'admin-blog', component: AdminBlog, meta: { admin: true } },
  {
    path: '/admin/blog/new',
    name: 'admin-blog-new',
    component: AdminBlogNew,
    meta: { admin: true },
  },
  {
    path: '/admin/blog/:id',
    name: 'admin-blog-edit',
    component: AdminBlogEdit,
    meta: { admin: true },
  },
  { path: '/admin/orders', name: 'admin-orders', component: AdminOrders, meta: { admin: true } },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: AdminProducts,
    meta: { admin: true },
  },
  {
    path: '/admin/transactions',
    name: 'admin-transactions',
    component: AdminTransactions,
    meta: { admin: true },
  },
  { path: '/admin/users', name: 'admin-users', component: AdminUsers, meta: { admin: true } },
  { path: '/auth/2fa', name: 'auth-2fa', component: Auth2fa },
  { path: '/auth/forgot-password', name: 'auth-forgot-password', component: AuthForgotPassword },
  { path: '/auth/login', name: 'auth-login', component: AuthLogin },
  { path: '/auth/oauth/callback', name: 'auth-oauth-callback', component: AuthOauthCallback },
  { path: '/auth/reset-password', name: 'auth-reset-password', component: AuthResetPassword },
  { path: '/auth/signup', name: 'auth-signup', component: AuthSignup },
  { path: '/auth/verify-email', name: 'auth-verify-email', component: AuthVerifyEmail },
  { path: '/blog', name: 'blog', component: Blog },
  { path: '/blog/:slug', name: 'blog-post', component: BlogPost },
  { path: '/calendar', name: 'calendar', component: Calendar },
  { path: '/cart', name: 'cart', component: Cart },
  { path: '/checkout', name: 'checkout', component: Checkout },
  { path: '/faq', name: 'faq', component: Faq },
  { path: '/generation', name: 'generation', component: Generation },
  { path: '/privacy', name: 'legal-privacy', component: LegalPrivacy },
  { path: '/refund', name: 'legal-refund', component: LegalRefund },
  { path: '/terms', name: 'legal-terms', component: LegalTerms },
  { path: '/orders', name: 'orders', component: Orders },
  { path: '/orders/:id', name: 'order-detail', component: OrderDetail },
  { path: '/partner', name: 'partner', component: Partner },
  { path: '/payments/cancel', name: 'payments-cancel', component: PaymentsCancel },
  { path: '/payments/return', name: 'payments-return', component: PaymentsReturn },
  { path: '/payments/:orderId', name: 'payments-detail', component: PaymentDetail },
  { path: '/shop', name: 'shop', component: Shop },
  { path: '/shop/ao-thun', name: 'shop-ao-thun', component: ShopAoThun },
  { path: '/shop/day-deo', name: 'shop-day-deo', component: ShopDayDeo },
  { path: '/shop/moc-khoa', name: 'shop-moc-khoa', component: ShopMocKhoa },
  { path: '/shop/pad-chuot', name: 'shop-pad-chuot', component: ShopPadChuot },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
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
  if (!store.user.value) return '/auth/login';
  if (store.user.value.role !== 'ADMIN') return '/';
  return true;
});
