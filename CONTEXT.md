# WebDev Studios

WebDev Studios is an e-commerce platform with a NestJS API, a Next.js storefront, and a blog. The platform covers identity (email/OAuth/2FA), the shop (products, cart, orders, payments), a calendar of events, reviews, and an admin surface.

## Language

**User**:
A registered account with a role (`USER` or `ADMIN`), an email, optional phone verification, and optional multi-factor authentication.
_Avoid_: account, member, customer

**Session**:
A logged-in device session holding a refresh token; revocable by the owner or by an admin.
_Avoid_: login, device login

**ExternalAccount**:
An identity linked to a User through an OAuth provider (Google or GitHub), used to authenticate without a password.
_Avoid_: oauth, social login

**MFA**:
Multi-factor authentication using a TOTP secret and a QR code; once enabled, sign-in requires a one-time code.
_Avoid_: 2FA factor, two-step

**Product**:
A sellable catalog item with a slug, price, optional sizes with per-size stock, and a total stock count.
_Avoid_: item, article

**Cart**:
A User's pending collection of cart items, each referencing a Product, an optional size, and a quantity.
_Avoid_: basket, bag

**Order**:
A checkout-created purchase containing order items, a total, a status, and a payment status; unpaid orders expire and are cancelled.
_Avoid_: purchase, transaction

**Settle**:
The single transition that resolves a pending Order as paid or unpaid; it claims the Order exactly once and releases reserved stock exactly once, regardless of which caller triggers it (payment webhook, expiry, cancellation, admin mark-paid).
_Avoid_: confirm, complete, finalize

**Payment**:
A PayOS-backed payment attempt for an Order, created as a payment link; a webhook verifies the result and updates the order's payment status.
_Avoid_: transaction, charge

**ShippingFee**:
A delivery cost added to an Order total: a flat fee, waived when the subtotal reaches the free-shipping threshold. One policy, mirrored per app (web, api, api-go, api-elysia) — changing it touches every mirror.
_Avoid_: delivery cost, postage

**BlogPost**:
A blog article with markdown content, a cover image, tags, an author, a publish state, and a view count.
_Avoid_: article, story

**BlogTag**:
A label attached to BlogPosts for filtering and grouping.
_Avoid_: category, label

**Event**:
A calendar entry with a type, start and end dates, an optional location, organizer, attendees, and an optional survey link.
_Avoid_: calendar item, activity

**Review**:
A User's rating and comment on a Product, subject to moderation state.
_Avoid_: feedback, rating

**SecurityLog**:
An append-only audit record of security-relevant actions (auth successes, authorization failures, rate-limit hits).
_Avoid_: log entry, audit entry
