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
| `GET /api/agent/commerce/v1/products/search?q=&category=&in_stock=&min_price_xlm=&max_price_xlm=&sort=&limit=&offset=` | none | Public, paginated product search and catalogue browse. |
| `GET /api/agent/commerce/v1/products/{product_id}` | none | Public product detail, including structured attributes. |
| `GET /api/agent/commerce/v1/me` | `profile` | Customer profile. |
| `POST /api/agent/commerce/v1/checkout/prepare` | `checkout:prepare` | Quote a short-lived checkout intent. Body: `{ items: [{ product_id, quantity }], delivery_address }`. |
| `POST /api/agent/commerce/v1/checkout/confirm` | `checkout:confirm` | Confirm one unexpired checkout intent. Body: `{ checkout_id, payment_method }`. |
| `GET /api/agent/commerce/v1/orders?limit=` | `orders:read` | Customer order history. |

Checkout preparation does not reserve stock. Confirmation rechecks stock atomically and returns `409 INSUFFICIENT_STOCK` if availability changed. Stellar payments use the same verification path as the existing customer checkout.

## Product discovery contract

`products/search` is safe for both literal lookup and bounded full-catalog browsing. `q` is optional. Without it, pages are ordered deterministically by newest product. With it, TestMarket first expands the request through its merchant-owned product taxonomy, then applies field-weighted relevance across identity, product type, category path, aliases, structured attributes, and description. This lets a generic request such as `wireless audio` discover earbuds and headphones even when a seed description does not repeat those exact words.

The taxonomy is a merchant capability, not an instruction tailored to a particular agent. A calling agent should keep its own user/session context and use the merchant `relevance` as one signal alongside its own intent-aware ranking.

- `offset` is zero-based; default page size is `20`, maximum is `48`.
- Responses include `pagination: { offset, limit, total, next_offset }`.
- `in_stock` defaults to `true`; pass `false` only when unavailable items are needed for a non-purchase view.
- Supported `sort` values are `relevance`, `price_asc`, `price_desc`, and `rating_desc`. `brand` is also accepted as an exact filter.
- Prices and settlements are Testnet XLM. Every agent product includes `price`, `price_xlm`, and exact `price_stroops`; checkout/order responses use corresponding XLM fields.
- Query responses include `facets` for available categories, brands, product types, and the XLM price range. Each matched product includes a non-negative `relevance` score; zero-score products are never returned as a search result.

Products publish `category`, `category_name`, `product_type`, `taxonomy_path`, `search_aliases`, `tags`, `attributes`, `availability`, rating/review count, seller, and a canonical product URL. These are merchant facts for agent retrieval and explanation—not instructions to an agent.

`GET /.well-known/agent-catalog` advertises both the public paginated feed and the richer public search/detail endpoints. The public `catalog.json` feed exposes the same enriched discovery fields, alongside its existing `id` and category object for backwards compatibility.
