# 1. Use Passport strategies for OAuth

## Status
Accepted

## Context
OAuth handling was implemented with manual HTTP calls and custom validation. The code duplicated provider-specific profile mapping and was difficult to extend.

## Decision
Use `passport-google-oauth20` and `passport-github2` with NestJS `PassportStrategy`. Strategies map raw provider profiles to a canonical `OAuthProfile` and delegate user creation/linking to `OAuthService`.

## Consequences
- Standardized verification callbacks, state handling, and error handling via Passport.
- Strategies become thin infrastructure; domain logic remains in `OAuthService`.
- Adding a provider requires a new strategy class but no changes to domain services.
- Coupling to Passport `VerifyCallback` is acceptable as an infrastructure concern.
