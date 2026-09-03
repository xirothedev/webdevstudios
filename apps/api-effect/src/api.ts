import { Schema } from 'effect';
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from 'effect/unstable/httpapi';

// The mirror validates like its blueprint: bindBody over the raw JSON body,
// raw query strings with Go-side defaults. Path params are plain strings, and
// handlers return raw HttpServerResponses (cookies/status), so the success
// codec never runs — Schema.Unknown keeps the declaration honest about that.
const json = { success: Schema.Unknown } as const;
const p = (fields: Schema.Struct.Fields) => ({ ...json, params: Schema.Struct(fields) });

const Slug = { slug: Schema.String };
const Id = { id: Schema.String };

const core = HttpApiGroup.make('core').add(
  HttpApiEndpoint.get('ping', '/v1/ping', json),
  HttpApiEndpoint.get('csrfToken', '/v1/csrf-token', json),
);

const blog = HttpApiGroup.make('blog').add(
  HttpApiEndpoint.get('listPosts', '/v1/blog/posts', json),
  HttpApiEndpoint.get('searchPosts', '/v1/blog/posts/search', json),
  HttpApiEndpoint.get('listAllPosts', '/v1/blog/posts/admin/all', json),
  HttpApiEndpoint.post('createPost', '/v1/blog/posts', json),
  HttpApiEndpoint.patch('updatePost', '/v1/blog/posts/:id', p(Id)),
  HttpApiEndpoint.delete('deletePost', '/v1/blog/posts/:id', p(Id)),
  HttpApiEndpoint.get('getPost', '/v1/blog/posts/:slug', p(Slug)),
);

const products = HttpApiGroup.make('products').add(
  HttpApiEndpoint.get('listProducts', '/v1/products', json),
  HttpApiEndpoint.get('getProduct', '/v1/products/:slug', p(Slug)),
  HttpApiEndpoint.get('getProductStock', '/v1/products/:slug/stock', p(Slug)),
);

const cart = HttpApiGroup.make('cart').add(
  HttpApiEndpoint.get('getCart', '/v1/cart', json),
  HttpApiEndpoint.post('addItem', '/v1/cart/items', json),
  HttpApiEndpoint.patch('updateItem', '/v1/cart/items/:id', p(Id)),
  HttpApiEndpoint.delete('removeItem', '/v1/cart/items/:id', p(Id)),
  HttpApiEndpoint.delete('clearCart', '/v1/cart', json),
);

const orders = HttpApiGroup.make('orders').add(
  HttpApiEndpoint.post('createOrder', '/v1/orders', json),
  HttpApiEndpoint.get('listOrders', '/v1/orders', json),
  HttpApiEndpoint.get('getOrder', '/v1/orders/:id', p(Id)),
  HttpApiEndpoint.patch('cancelOrder', '/v1/orders/:id/cancel', p(Id)),
  HttpApiEndpoint.get('listAllOrders', '/v1/admin/orders/all', json),
  HttpApiEndpoint.get('adminGetOrder', '/v1/admin/orders/:id', p(Id)),
  HttpApiEndpoint.patch('adminUpdateStatus', '/v1/admin/orders/:id/status', p(Id)),
  HttpApiEndpoint.post('adminMarkPaid', '/v1/admin/orders/:id/mark-paid', p(Id)),
);

const payments = HttpApiGroup.make('payments').add(
  HttpApiEndpoint.post('createLink', '/v1/payments/create-link', json),
  HttpApiEndpoint.post('webhook', '/v1/payments/webhook', json),
  HttpApiEndpoint.get(
    'verify',
    '/v1/payments/verify/:transactionCode',
    p({
      transactionCode: Schema.String,
    }),
  ),
  HttpApiEndpoint.get('transactions', '/v1/payments/transactions', json),
);

const reviews = HttpApiGroup.make('reviews').add(
  HttpApiEndpoint.post('createReview', '/v1/products/:slug/reviews', p(Slug)),
  HttpApiEndpoint.get('listReviews', '/v1/products/:slug/reviews', p(Slug)),
  HttpApiEndpoint.patch('updateReview', '/v1/reviews/:id', p(Id)),
  HttpApiEndpoint.delete('deleteReview', '/v1/reviews/:id', p(Id)),
);

const users = HttpApiGroup.make('users').add(
  HttpApiEndpoint.get('me', '/v1/users/me', json),
  HttpApiEndpoint.patch('updateProfile', '/v1/users/profile', json),
  HttpApiEndpoint.patch('updateAvatar', '/v1/users/avatar', json),
  HttpApiEndpoint.get('listUsers', '/v1/users', json),
  HttpApiEndpoint.get('getUser', '/v1/users/:id', p(Id)),
);

const auth = HttpApiGroup.make('auth').add(
  HttpApiEndpoint.post('register', '/v1/auth/register', json),
  HttpApiEndpoint.post('login', '/v1/auth/login', json),
  HttpApiEndpoint.post('refresh', '/v1/auth/refresh', json),
  HttpApiEndpoint.post('logout', '/v1/auth/logout', json),
  HttpApiEndpoint.get('sessions', '/v1/auth/sessions', json),
  HttpApiEndpoint.get('verifyEmail', '/v1/auth/verify-email', json),
  HttpApiEndpoint.post('resetRequest', '/v1/auth/password/reset-request', json),
  HttpApiEndpoint.post('reset', '/v1/auth/password/reset', json),
  HttpApiEndpoint.post('enable2fa', '/v1/auth/2fa/enable', json),
  HttpApiEndpoint.post('verify2fa', '/v1/auth/2fa/verify', json),
  HttpApiEndpoint.get('oauthGoogle', '/v1/auth/oauth/google', json),
  HttpApiEndpoint.get('oauthGoogleCallback', '/v1/auth/oauth/google/callback', json),
  HttpApiEndpoint.get('oauthGithub', '/v1/auth/oauth/github', json),
  HttpApiEndpoint.get('oauthGithubCallback', '/v1/auth/oauth/github/callback', json),
);

const events = HttpApiGroup.make('events').add(
  HttpApiEndpoint.get('listEvents', '/v1/events', json),
  HttpApiEndpoint.get('getEvent', '/v1/events/:id', p(Id)),
  HttpApiEndpoint.post('createEvent', '/v1/events', json),
  HttpApiEndpoint.patch('updateEvent', '/v1/events/:id', p(Id)),
  HttpApiEndpoint.delete('deleteEvent', '/v1/events/:id', p(Id)),
);

export const api = HttpApi.make('api-effect').add(
  core,
  blog,
  products,
  cart,
  orders,
  payments,
  reviews,
  users,
  auth,
  events,
);
