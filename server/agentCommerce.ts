export type AgentCatalogProductInput = {
  id: string;
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

const normalize = (value: unknown) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const unique = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];

function normalizedAttributes(product: AgentCatalogProductInput) {
  return unique((product.specs || [])
    .filter((spec) => spec?.key && spec?.value)
    .map((spec) => `${String(spec.key).trim()}: ${String(spec.value).trim()}`)).sort((left, right) => left.localeCompare(right));
}

function agentDescription(product: AgentCatalogProductInput, attributes: string[]) {
  const original = String(product.description || '').trim();
  // Seed/demo catalogues often contain the same marketing sentence on every
  // row. Do not let that boilerplate dominate semantic retrieval or the card.
  if (original && !/^enjoy this high-quality\b/i.test(original)) return original;
  const identity = product.brand ? `${product.name} by ${product.brand}.` : `${product.name}.`;
  const classification = product.categoryName || product.categorySlug
    ? `Category: ${product.categoryName || product.categorySlug}.`
    : '';
  const details = attributes.length ? `Key details: ${attributes.slice(0, 6).join('; ')}.` : '';
  return [identity, classification, details].filter(Boolean).join(' ');
}

/** TestMarket settles every agent-commerce order in Stellar testnet XLM. */
export function toAgentCatalogProduct(product: AgentCatalogProductInput, issuer: string) {
  const attributes = normalizedAttributes(product);
  const category = product.categorySlug || null;
  const categoryName = product.categoryName || category || null;
  const tags = unique([
    category || '',
    categoryName || '',
    ...attributes.flatMap((attribute) => attribute.split(':').map((value) => value.trim())),
  ]);
  const priceStroops = Math.round((Number(product.price) + Number.EPSILON) * 10_000_000);
  return {
    product_id: product.id,
    name: product.name,
    brand: product.brand || null,
    seller: product.sellerName || null,
    description: agentDescription(product, attributes),
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
    product_type: categoryName,
    tags,
    attributes,
    image_url: product.imageUrl || null,
    url: `${issuer}/product/${product.id}`,
  };
}

/**
 * Deterministic lexical ordering for a merchant search endpoint. Semantic
 * ranking stays the responsibility of the calling shopping agent; this gives
 * every agent predictable, field-weighted retrieval without hidden coupling.
 */
export function agentCatalogMatchScore(product: AgentCatalogProductInput, query: string) {
  const phrase = normalize(query);
  if (!phrase) return 0;
  const terms = [...new Set(phrase.split(' ').filter((term) => term.length >= 2))];
  const attributes = normalizedAttributes(product).join(' ');
  const fields: Array<[string, number]> = [
    [normalize(product.name), 40],
    [normalize(product.brand), 14],
    [normalize(product.categoryName || product.categorySlug), 12],
    [normalize(attributes), 10],
    [normalize(product.description), 6],
  ];
  return fields.reduce((total, [text, weight]) => {
    if (!text) return total;
    const phraseBonus = text.includes(phrase) ? weight * 3 : 0;
    const termScore = terms.reduce((score, term) => score + (text.includes(term) ? weight : 0), 0);
    return total + phraseBonus + termScore;
  }, 0);
}
