# Production audit — TestMarket

Audit date: 2026-07-17

## Outcome

The application was refactored for a much smaller initial client payload, lower repeated-read load on Supabase, safer authentication and checkout handling, validated input, and production cache headers. The existing UI and user flows are retained. The existing uncommitted Prisma `DIRECT_URL` configuration was preserved.

The Supabase database was previously unmanaged by Prisma Migrate. A baseline migration was created and marked applied, then the performance and wallet-challenge replay-protection migrations were applied successfully. `npx prisma migrate status` now reports that the schema is up to date.

## Measured bundle improvement

| Build output | Before | After | Result |
| --- | ---: | ---: | --- |
| Initial application JavaScript | 883 KB raw (`index` + monolithic `vendor`) | about 283 KB raw for the home route (shell, React, router, icons, and home page) | about 68% smaller initial JS |
| Initial application JavaScript (gzip) | Not recorded by the prior build | about 89 KB gzip | Fast enough for a mobile-first first load |
| Stellar wallet SDK | Included in the initial vendor bundle | 531 KB raw / 149 KB gzip, loaded only for auth or checkout | Removes the main LCP/INP cost from browsing |
| Route code | One eagerly loaded app chunk | Home 20 KB, product 17 KB, cart 10 KB, checkout 18 KB, account 12 KB | Navigation pays only for the route used |

The after figures come from the production Vite build. The before figures are the committed build output found before the refactor. Network and field CWV measurements still need to be collected after deployment.

## Changes made

| Area | Change | Why it was needed | Expected impact |
| --- | --- | --- | --- |
| Rendering and bundle | Lazy-loaded every route and the auth modal; separated React/router/icons/Google/wallet chunks | Checkout and wallet code were loaded before a visitor could browse | Major LCP, INP and mobile parse/execute reduction |
| Rendering | Added short-lived public request de-duplication | React Strict Mode and navigation could issue duplicate catalog/batch requests | Eliminates duplicate concurrent GETs; short cache also avoids cart→checkout re-fetches |
| Rendering | Deferred product reviews until the Reviews tab is opened | Product detail always made a request that most visitors never used | One fewer API/database request per normal product view |
| Rendering | Corrected similar-products request to filter by the product category | The old request ignored the category | Better relevance with no additional request |
| Images | Added native lazy loading/async decode below the fold, high priority for LCP images, font preconnects, and non-blocking font CSS | Eager images and CSS `@import` increased contention | Less image decode work, lower waterfall pressure and reduced layout risk |
| Client state | Replaced persisted JWT storage with an HTTP-only, same-origin session cookie and session restoration | A persistent localStorage token can be stolen by XSS and a random server secret invalidated sessions on cold starts | Removes persistent token exposure and stabilizes sessions |
| Client state | De-duplicated wishlist loading per signed-in user and made optimistic mutations revert on non-2xx responses | Multiple pages could refetch it; failures previously left incorrect local state | Fewer reads and correct optimistic UI |
| API cache | Added bounded in-process request coalescing plus browser/CDN cache headers for categories, product listings, batch lookups and product details | Repeated public catalog reads are the highest free-tier cost | Warm requests avoid Prisma entirely; CDN revalidation cuts database reads further |
| API queries | Replaced broad `include` queries with explicit `select` projections | Several endpoints returned descriptions, specs, full relations or full product rows when the UI needed a few fields | Smaller DB result sets, serialization work and response bodies |
| API limits | Validated pagination/filter inputs and capped product batches, page sizes and review/order lists | Unbounded values can force expensive scans and large responses | Prevents accidental or hostile resource exhaustion |
| Reviews | Replaced `findMany + JavaScript reduce` over all reviews on every submission with a transactional database aggregate | This was an O(number of reviews) N+1-style read amplification on every write | Constant-size review write path; correct rating/count update |
| Cart/wishlist | Added stock and quantity validation, transactional cart updates, upsert/delete-many wishlist operations | Existing writes allowed invalid quantities, used extra read-then-write calls, and could race | Fewer writes and stronger correctness under concurrent users |
| Checkout | Validates all items, recalculates prices from DB, reserves stock transactionally, rounds Stellar amounts to stroops, times out Horizon calls, and makes Stellar tx hashes unique | The old endpoint allowed invalid/negative quantities, silently skipped missing products, had unbounded network waits and allowed payment replay | Prevents oversell/replay classes; bounded serverless execution time |
| Authentication | Added production-only `JWT_SECRET` requirement, Google email verification, password/input validation, rate limiting, secure headers, and signed, one-time Stellar wallet challenges | Stellar login previously trusted any submitted public key; random JWT secrets break serverless sessions | Closes account impersonation, signature replay and brute-force paths |
| OAuth | Exact redirect validation remains; added length validation, constant-time legacy secret comparison and atomic authorization-code consumption | A code could be raced and secret comparison was not constant time | One-time code behavior is now race-safe |
| Database | Added foreign-key/query indexes, trigram search indexes, a partial unique active-cart index and order payment hash | Hot paths had no non-unique indexes and `contains` search would degrade as catalog grows | Predictable catalog/cart/order lookup performance |
| Deployment | Let Vercel serve hashed `/assets` via its filesystem/CDN before SPA fallback and mark them immutable | The broad function route could otherwise put static assets through the function | Lower TTFB/function invocations and effective browser caching |
| Dependencies | Removed unused direct dependencies: `@google/genai`, D3, Motion, Recharts, YAML and unused type packages | They increased install/audit surface without being imported | Smaller dependency tree and fewer future patch obligations |

## Database migration applied

`20260717193000_production_performance_indexes` and `20260717195000_wallet_login_challenge_replay_protection` are applied to Supabase. They added:

- `pg_trgm` plus GIN trigram indexes for product `name` and `description` search.
- Compound catalog indexes for category/newest, price, rating and stock filters.
- Relation indexes for images, specs, carts, cart items, orders, order items, reviews, wishlists and OAuth codes.
- A partial unique index allowing one `ACTIVE` cart per user. A duplicate-cart safety check passed before deployment.
- Nullable unique `Order.stellarTxHash` replay protection.
- A short-lived `WalletLoginChallenge` table; a verified wallet signature atomically consumes its challenge, including across Vercel instances.

The database had no Prisma migration history, so `20260717000000_baseline` records the exact pre-existing schema. It is marked applied on the existing database and creates that schema on a new database.

## Prioritized remaining risks

### Critical

1. The production dependency audit still reports one critical and six high vulnerabilities, all in transitive dependencies of `@creit.tech/stellar-wallets-kit` (notably the Trezor/protobuf chain). The audit's suggested package change is a breaking major/downgrade and was not applied automatically because it could break wallet support. Before handling real funds, replace or upgrade this wallet integration after compatibility testing. Dynamic loading reduces exposure during ordinary browsing but does not remediate the vulnerability.

2. Prices and order totals are `Float` columns. The endpoint now rounds Stellar payment verification to stroops, but a real-money system should migrate `mrp`, `price`, `total` and `priceAtPurchase` to `Decimal(20,7)` (or integer stroops) before production payments.

### High

1. OAuth client secrets are still stored in plaintext in `OAuthClient`. The comparison is now constant time, but at-rest protection requires a separate migration to a bcrypt/argon2 hash and a controlled client-secret rotation.

2. OAuth access tokens are broad, 30-day JWTs with no scopes, revocation, rotation, audience restriction or token introspection. Keep the OAuth provider disabled from public use until scope and lifecycle controls are added.

3. This project uses Prisma directly against Supabase Postgres; it does not use Supabase Auth, Storage or RLS-enforced client access. Keep `DATABASE_URL`, `DIRECT_URL` and any service credentials server-only. If Supabase APIs are later exposed to the browser, design RLS policies first rather than assuming Prisma protections carry over.

4. The in-process cache and rate limiter are per Vercel function instance. They substantially reduce warm-instance work but are not a distributed abuse-control system. Add a managed shared limiter/cache (for example Upstash) before traffic or abuse exceeds the stated target.

### Medium

1. Product/search pagination still uses offset plus `count`, preserving the existing API shape. At a much larger catalog, introduce cursor pagination and make totals opt-in.

2. Images remain third-party URL assets. Move product images to Supabase Storage or an image CDN with responsive variants and immutable object URLs when the catalog is finalized.

3. Existing address data is still intentionally simplified by the checkout API. Normalize the address payload into its individual schema fields before enabling real shipping.

4. The local normal Prisma engine generation cannot replace `query_engine-windows.dll.node` while another Node process holds it open. A clean CI/Vercel build will run the normal generator. Locally, stop the process that owns the file before running `npm run build`.

### Low

1. Page-level product cards are small enough not to need virtualization. Add it only if catalog pages move beyond the current capped 48 items or a virtualized infinite-scrolling UI is introduced.

2. The authenticated order list is capped at 20 by default to protect the free tier. Add a visible “load more” control with cursor pagination when historic order volume requires it.

## Supabase Free Tier capacity guidance

For approximately 50 concurrent active users browsing a normal catalog, this design should be comfortable if the Vercel CDN honors the public cache headers and catalog changes are infrequent:

- Catalog pages perform a cold `count + select`, then are cached for 20 seconds in the function and 60–120 seconds in the CDN depending on the endpoint.
- Product details, batch lookups and categories are similarly cached; review, cart, wishlist and order data remain private and uncached for correctness.
- Search, batch and review responses are capped, so a single request cannot create an unbounded result set.
- The pooler connection URL should keep `pgbouncer=true`, `connection_limit=1`, and a small pool timeout. `DIRECT_URL` should be the actual non-pooler migration URL; verify that the current environment's port-5432 host is your intended direct connection.

The capacity estimate assumes low write frequency (a few cart/wishlist actions per user per minute, not 50 simultaneous checkouts) and a small-to-medium catalog. 50 concurrent payment submissions can still be limited by Horizon indexing and the Supabase free-tier connection/CPU budget. The payment endpoint deliberately bounds Horizon retries, but payment reconciliation should be moved to a durable job/webhook workflow before real-money scale.

## Monitoring and stress test plan

1. Instrument Vercel: function p50/p95/p99 duration, cold starts, invocation count, error rate, cache status and 429 rate.
2. Monitor Supabase: database CPU, active connections, slow query log, `pg_stat_statements`, cache hit ratio, index scans and table growth. Alert on connection saturation, p95 query time above 100 ms, or error rate above 1%.
3. Add structured JSON logs with request ID, route, status, duration and safe user/order identifiers. Never log JWTs, credentials, wallet signatures or addresses in full.
4. Capture field Core Web Vitals using Vercel Analytics, Sentry Performance, or `web-vitals`: target LCP <2.5 s, INP <200 ms and CLS <0.1 at p75 mobile.
5. Run k6 from a non-production dataset: ramp from 0 to 50 virtual users over two minutes; hold for ten minutes; use 80% cached catalog/detail reads, 15% cart/wishlist writes and 5% order reads. Run checkout/Horizon flows separately with a test wallet. Pass only if API p95 stays below 500 ms for cached catalog reads, private DB reads below 750 ms, error rate below 1%, and Supabase connections remain below the free-tier safe ceiling.

## Deployment checklist

1. Set a unique `JWT_SECRET` in Vercel production environment variables. Do not rely on the local development fallback.
2. Use the pooler URL for `DATABASE_URL` and the verified direct URL only for `DIRECT_URL` migrations.
3. In clean CI/Vercel, run `prisma generate`, `prisma migrate deploy`, `npm run lint`, and `npm run build`.
4. Test Google sign-in, a supported signed-message Stellar wallet, product detail/reviews, cart, checkout, OAuth authorization, and logout on the deployed HTTPS origin.
5. Resolve the wallet SDK audit findings and migrate monetary floats before enabling real financial transactions.
