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
  imageUrl?: string | null;
};

/** TestMarket settles every agent-commerce order in Stellar testnet XLM. */
export function toAgentCatalogProduct(product: AgentCatalogProductInput, issuer: string) {
  return {
    product_id: product.id,
    name: product.name,
    brand: product.brand || null,
    description: product.description || '',
    price: product.price,
    currency: 'XLM' as const,
    stock: product.stock,
    rating: product.rating ?? null,
    review_count: product.reviewCount ?? null,
    category: product.categorySlug || null,
    image_url: product.imageUrl || null,
    url: `${issuer}/product/${product.id}`,
  };
}
