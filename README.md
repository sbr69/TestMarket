# TestMarket

TestMarket is a standalone Stellar testnet XLM commerce storefront. It exposes
the same product catalogue to people, search engines, and authorized shopping
assistants without coupling the merchant to any one agent.

## Catalogue discovery

- Permanent canonical product documents: `/product/:slug`
- Server-rendered product content, canonical URLs, Open Graph/Twitter cards,
  `Product` and `BreadcrumbList` JSON-LD
- Crawl controls: `/robots.txt`, `/sitemap.xml`, `/sitemap-pages.xml`, and
  paginated `/sitemap-products-:page.xml`
- Full merchant catalogue document: `/catalog.json`

All monetary fields from the discovery APIs are denominated in testnet `XLM`.
The product APIs return a stable ID, slug, canonical product URL, images,
availability, stock, price in XLM/stroops, category, brand, seller,
specifications, taxonomy tags, rating and review count.

## Public APIs

| Endpoint | Purpose |
| --- | --- |
| `GET /api/products` | Browse/filter/sort products. Supports `q`, `page`, `limit`, `category`, `brand`, `min_price`, `max_price`, `rating`, `in_stock`, and `sort=price_asc|price_desc|rating`. |
| `GET /api/products/:id-or-slug` | Complete product document. |
| `GET /api/categories` | Merchant categories. |
| `GET /api/brands` | Active catalogue brands. |
| `GET /api/search` | Alias of product search. |
| `GET /api/search/suggest?q=` | Autocomplete suggestions. |
| `GET /api/recommendations` | Related products; accepts `product_id` or `category`. |
| `GET /api/deals` | Discounted products. |
| `GET /api/trending` | Products ranked by merchant review activity and rating. |
| `GET /api/reviews` | Public reviews; accepts `product_id` or `slug`. |
| `GET /api/products/:id-or-slug/reviews` | Reviews for one product. |

The existing OAuth-protected `/api/agent/commerce/v1/*` API remains the
checkout path for agents. The public API is read-only discovery data.

## Search architecture

TestMarket always has a PostgreSQL-backed, merchant-owned taxonomy search
fallback, so catalog discovery works with no extra service. It understands
product types and aliases such as wireless audio, children’s gifts, and desk
accessories and returns structured relevance/facets.

For production-scale catalogues, configure OpenSearch to enable the hosted
search adapter: typo tolerance, synonym matching, field-weighted ranking,
autocomplete, and aggregation-based facets. Set these encrypted deployment
variables, then run the reindex command after catalogue imports:

```bash
OPENSEARCH_NODE=https://your-cluster.example
OPENSEARCH_USERNAME=...
OPENSEARCH_PASSWORD=...
OPENSEARCH_INDEX=testmarket-products
npm run search:reindex
```

If the local database is intentionally unavailable, index the live canonical
merchant feed instead:

```bash
CATALOG_SOURCE_URL=https://your-testmarket-domain.example npm run search:reindex
```

When the optional cluster is unavailable, the API safely falls back to
PostgreSQL rather than failing search requests.

## Development

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

Copy `.env.example` to `.env` and configure the database and authentication
variables before starting the server. Never commit credentials.
