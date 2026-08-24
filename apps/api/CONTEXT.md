# API Context

## Domain terms

### ExternalAccount
An identity link between a `User` and an external OAuth provider. The link is identified by the composite key `provider_providerId`. `providerId` is unique only within its provider.

_Avoid_: social login record.

### OAuthProfile
Normalized internal shape returned by Passport strategies after mapping provider-specific profiles:
- `provider`: OAuthProvider enum
- `providerId`: provider-scoped identifier
- `email`: verified email from provider, required
- `name`: display name
- `picture`: avatar URL

Strategies must map to `OAuthProfile`; raw Passport profiles must not leak into domain services.

### OAuthProvider
Supported providers are enumerated in Prisma `OAuthProvider`. Current set: `GOOGLE`, `GITHUB`.

Adding a provider requires:
1. Enum update
2. Prisma migration
3. Passport strategy + guard
4. Config for client id/secret/callback
5. Entry in `SupportedOAuthProviders` glossary

### Session
A logged-in device session holding a refresh token. Sessions created via OAuth are considered MFA-verified by issuance — OAuth authentication is treated as inherently stronger than password.

### User
Registered account with role `CUSTOMER` or `ADMIN`. Can be created via password registration or via OAuth linking. Email is unique and normalized case-insensitively.

## Invariants
- `ExternalAccount.providerId` is unique per `provider` via composite key.
- `ExternalAccount` cannot exist without a `User`.
- `OAuthProfile.email` is required for login; missing email is a fatal auth error.
- Linking an `ExternalAccount` to an existing `User` by email requires exact normalized email match.
- Avatar from OAuth does not overwrite an existing user-managed avatar on subsequent logins.
- `providerEmail` on `ExternalAccount` is updated on each successful login to reflect provider state.

## Decisions
- Strategies map to `OAuthProfile`; domain boundary is `OAuthService.handleOAuthCallback`.
- Linking existing users is allowed and logs a security event.
- An Order settles exactly once: concurrent settle attempts claim conditionally; losers no-op. Stock releases only inside the winning claim.
- Payment webhooks settle only signature-verified payloads whose amount equals the Order total. Amount mismatches log to SecurityLog and never settle.
