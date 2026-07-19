import { toAgentCatalogProduct, type AgentCatalogProductInput } from './agentCommerce';

type ProductImage = { id?: string; url: string };
type ProductSpec = { key: string; value: string };

export type PublicCatalogProductInput = AgentCatalogProductInput & {
  mrp?: number | null;
  categoryId?: string | null;
  category?: { id?: string; slug: string; name: string } | null;
  images?: ProductImage[];
  specs?: ProductSpec[];
  createdAt?: Date | string | null;
};

const finite = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const xlm = (value: unknown) => finite(value).toFixed(7);
const stroops = (value: unknown) => String(Math.round((finite(value) + Number.EPSILON) * 10_000_000));

/**
 * The public product representation is intentionally API-first: the same
 * stable ID, canonical URL, price and discovery metadata are consumed by the
 * storefront, search engines and external shopping assistants.
 */
export function serializePublicProduct(product: PublicCatalogProductInput, issuer: string) {
  const category = product.category || (product.categorySlug || product.categoryName ? {
    id: product.categoryId || undefined,
    slug: product.categorySlug || String(product.categoryName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: product.categoryName || product.categorySlug || 'General Merchandise',
  } : null);
  const images = (product.images || []).filter((image) => image?.url).map((image, index) => ({
    id: image.id || `${product.id}-image-${index + 1}`,
    url: image.url,
  }));
  const specs = (product.specs || []).filter((spec) => spec?.key && spec?.value).map((spec, index) => ({
    id: `${product.id}-spec-${index + 1}`,
    key: spec.key,
    value: spec.value,
  }));
  const discovery = toAgentCatalogProduct({
    ...product,
    categorySlug: category?.slug || product.categorySlug || null,
    categoryName: category?.name || product.categoryName || null,
    specs,
    imageUrl: images[0]?.url || product.imageUrl || null,
  }, issuer);
  const price = finite(product.price);
  const mrp = finite(product.mrp, price);
  const shippingCost = price >= 499 ? 0 : 50;
  const canonicalUrl = discovery.url;

  return {
    id: product.id,
    product_id: product.id,
    slug: product.slug || product.id,
    title: product.name,
    name: product.name,
    description: discovery.description,
    brand: product.brand || null,
    seller: product.sellerName || null,
    seller_name: product.sellerName || null,
    sellerName: product.sellerName || null,
    category: category ? { id: category.id || product.categoryId || null, slug: category.slug, name: category.name } : null,
    category_slug: discovery.category,
    category_name: discovery.category_name,
    product_type: discovery.product_type,
    taxonomy_path: discovery.taxonomy_path,
    tags: discovery.tags,
    search_aliases: discovery.search_aliases,
    attributes: discovery.attributes,
    specifications: specs,
    price,
    price_xlm: xlm(price),
    price_stroops: stroops(price),
    mrp,
    mrp_xlm: xlm(mrp),
    discount_percent: mrp > 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0,
    currency: 'XLM' as const,
    stock: finite(product.stock),
    availability: finite(product.stock) > 0 ? 'in_stock' as const : 'out_of_stock' as const,
    rating: product.rating ?? null,
    review_count: product.reviewCount ?? null,
    // Legacy storefront aliases remain during the URL/API migration.
    reviewCount: product.reviewCount ?? null,
    image_url: images[0]?.url || null,
    images,
    specs,
    url: canonicalUrl,
    product_url: canonicalUrl,
    canonical_url: canonicalUrl,
    shipping: {
      estimated_delivery_days: { min: 3, max: 5 },
      cost_xlm: xlm(shippingCost),
      cost_stroops: stroops(shippingCost),
      policy: 'Shipping is calculated from the order subtotal; it is free for subtotals above 499 XLM.',
    },
    estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: product.createdAt ? new Date(product.createdAt).toISOString() : null,
  };
}

export function publicProductSummary(product: ReturnType<typeof serializePublicProduct>) {
  const { specifications: _specifications, shipping: _shipping, ...summary } = product;
  return summary;
}
