# TestMarket agent-commerce integration

An agent starts with the store origin and fetches:

- `GET /.well-known/oauth-authorization-server`
- `GET /.well-known/agent-commerce`

The OAuth metadata advertises the authorization, token, dynamic registration, and revocation endpoints. All tokens are bearer tokens and all agent endpoints use JSON.

## Connect flow

1. Register a client with `POST /oauth/register`.
   - Required: `client_name`, `redirect_uris` (HTTPS, or a loopback callback for local apps).
   - Optional: `scope`, `token_endpoint_auth_method` (`client_secret_post` or `none`).
   - The returned `client_secret` is displayed once and is stored hashed by TestMarket.
2. Create a high-entropy PKCE verifier and an S256 challenge.
3. Direct the signed-in customer to `/oauth/authorize` with `response_type=code`, `client_id`, exact `redirect_uri`, `state`, `scope`, `code_challenge`, and `code_challenge_method=S256`.
4. Exchange the returned code at `POST /oauth/token` using `grant_type=authorization_code`, the same `redirect_uri`, and `code_verifier`.
5. Refresh tokens with `grant_type=refresh_token`. Refresh tokens rotate on every successful use; discard the old token.
6. Revoke either access or refresh tokens with `POST /oauth/revoke`.

Dynamic and public (`token_endpoint_auth_method=none`) clients must use PKCE S256. Existing manually registered confidential clients remain supported during migration.

## Scopes

`profile`, `cart:read`, `cart:write`, `checkout:prepare`, `checkout:confirm`, `orders:read`.

New OAuth tokens are checked on both the agent endpoints and the existing authenticated API routes. Browser sessions are unchanged.

## Agent endpoints

| Endpoint | Scope | Purpose |
| --- | --- | --- |
| `GET /api/agent/commerce/v1/products/search?q=&limit=` | none | Public product search. |
| `GET /api/agent/commerce/v1/me` | `profile` | Customer profile. |
| `POST /api/agent/commerce/v1/checkout/prepare` | `checkout:prepare` | Quote a short-lived checkout intent. Body: `{ items: [{ product_id, quantity }], delivery_address }`. |
| `POST /api/agent/commerce/v1/checkout/confirm` | `checkout:confirm` | Confirm one unexpired checkout intent. Body: `{ checkout_id, payment_method }`. |
| `GET /api/agent/commerce/v1/orders?limit=` | `orders:read` | Customer order history. |

Checkout preparation does not reserve stock. Confirmation rechecks stock atomically and returns `409 INSUFFICIENT_STOCK` if availability changed. Stellar payments use the same verification path as the existing customer checkout.
