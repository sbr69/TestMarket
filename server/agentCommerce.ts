import { catalogSearchScore, deriveCatalogTaxonomy } from './catalogTaxonomy';

export type AgentCatalogProductInput = {
  id: string;
  slug?: string | null;
  name: string;
  brand?: string | null;
  description?: string | null;
  price: number;
  stock: number;
  rating?: number | null;
  reviewCount?: number | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  sellerName?: string | null;
  specs?: Array<{ key: string; value: string }>;
  imageUrl?: string | null;
};

const unique = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];

function normalizedAttributes(product: AgentCatalogProductInput) {
  return unique((product.specs || [])
    .filter((spec) => spec?.key && spec?.value)
    .map((spec) => `${String(spec.key).trim()}: ${String(spec.value).trim()}`)).sort((left, right) => left.localeCompare(right));
}

function agentDescription(product: AgentCatalogProductInput, attributes: string[], taxonomy: ReturnType<typeof deriveCatalogTaxonomy>) {
  const original = String(product.description || '').trim();
  // Seed/demo catalogues often contain the same marketing sentence on every
  // row. Do not let that boilerplate dominate semantic retrieval or the card.
  if (original && !/^enjoy this high-quality\b/i.test(original)) return original;
  const identity = product.brand ? `${product.name} by ${product.brand}.` : `${product.name}.`;
  const classification = product.categoryName || product.categorySlug
    ? `Category: ${product.categoryName || product.categorySlug}.`
    : '';
  const productType = taxonomy.productType ? `Product type: ${taxonomy.productType}.` : '';
  const browsePath = taxonomy.taxonomyPath.length > 1 ? `Browse path: ${taxonomy.taxonomyPath.join(' › ')}.` : '';
  const details = attributes.length ? `Key details: ${attributes.slice(0, 6).join('; ')}.` : '';
  return [identity, classification, productType, browsePath, details].filter(Boolean).join(' ');
}

/** TestMarket settles every agent-commerce order in Stellar testnet XLM. */
export function toAgentCatalogProduct(product: AgentCatalogProductInput, issuer: string) {
  const attributes = normalizedAttributes(product);
  const category = product.categorySlug || null;
  const categoryName = product.categoryName || category || null;
  const taxonomy = deriveCatalogTaxonomy(product);
  const tags = unique([
    category || '',
    categoryName || '',
    ...taxonomy.tags,
    ...attributes.flatMap((attribute) => attribute.split(':').map((value) => value.trim())),
  ]);
  const priceStroops = Math.round((Number(product.price) + Number.EPSILON) * 10_000_000);
  return {
    product_id: product.id,
    name: product.name,
    brand: product.brand || null,
    seller: product.sellerName || null,
    description: agentDescription(product, attributes, taxonomy),
    price: product.price,
    price_xlm: Number(product.price).toFixed(7),
    price_stroops: String(priceStroops),
    currency: 'XLM' as const,
    stock: product.stock,
    availability: product.stock > 0 ? 'in_stock' : 'out_of_stock',
    rating: product.rating ?? null,
    review_count: product.reviewCount ?? null,
    category,
    category_name: categoryName,
    product_type: taxonomy.productType,
    taxonomy_path: taxonomy.taxonomyPath,
    search_aliases: taxonomy.searchAliases,
    tags,
    attributes,
    image_url: product.imageUrl || null,
    url: `${issuer}/product/${encodeURIComponent(product.slug || product.id)}`,
  };
}

/**
 * Deterministic merchant relevance for catalogue discovery. The taxonomy is
 * owned by TestMarket and is returned to every caller; an agent may combine
 * this score with its own intent-aware ranking but must not substitute an
 * unrelated product when this returns zero.
 */
export function agentCatalogMatchScore(product: AgentCatalogProductInput, query: string) {
  return catalogSearchScore(product, query);
}
