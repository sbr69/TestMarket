type SeoProduct = {
  name: string;
  description: string;
  brand?: string | null;
  canonical_url: string;
  image_url?: string | null;
  images?: Array<{ url: string }>;
  price_xlm: string;
  currency: string;
  availability: 'in_stock' | 'out_of_stock';
  rating?: number | null;
  review_count?: number | null;
  seller?: string | null;
  category?: { name: string; slug: string } | null;
  taxonomy_path?: string[];
  specifications?: Array<{ key: string; value: string }>;
  shipping?: { cost_xlm: string };
};

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const jsonForHtml = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

export function productJsonLd(product: SeoProduct) {
  const images = (product.images || []).map((image) => image.url).filter(Boolean);
  if (!images.length && product.image_url) images.push(product.image_url);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images,
    url: product.canonical_url,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category?.name || product.taxonomy_path?.join(' > ') || undefined,
    additionalProperty: (product.specifications || []).map((spec) => ({ '@type': 'PropertyValue', name: spec.key, value: spec.value })),
    offers: {
      '@type': 'Offer',
      url: product.canonical_url,
      price: product.price_xlm,
      priceCurrency: product.currency,
      availability: product.availability === 'in_stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: product.seller ? { '@type': 'Organization', name: product.seller } : undefined,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: product.shipping?.cost_xlm || '0.0000000', currency: product.currency },
      },
    },
    aggregateRating: product.rating && product.review_count
      ? { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.review_count }
      : undefined,
  };
}

export function breadcrumbJsonLd(product: SeoProduct) {
  const trail = ['Home', ...(product.taxonomy_path || product.category?.name ? (product.taxonomy_path || [product.category?.name || '']) : []), product.name]
    .filter(Boolean);
  const origin = new URL(product.canonical_url).origin;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((name, index) => ({
      '@type': 'ListItem', position: index + 1, name,
      item: index === trail.length - 1 ? product.canonical_url : index === 0 ? `${origin}/` : `${origin}/?category=${encodeURIComponent(product.category?.slug || '')}`,
    })),
  };
}

export function renderProductMeta(html: string, product: SeoProduct, issuer: string) {
  const title = `${product.name} | TestMarket`;
  const description = product.description.slice(0, 300);
  const image = product.image_url || `${issuer}/og-default.png`;
  const meta = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(product.canonical_url)}" />`,
    `<meta property="og:type" content="product" />`,
    `<meta property="og:site_name" content="TestMarket" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(product.canonical_url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="product:price:amount" content="${escapeHtml(product.price_xlm)}" />`,
    `<meta property="product:price:currency" content="${escapeHtml(product.currency)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<script type="application/ld+json">${jsonForHtml(productJsonLd(product))}</script>`,
    `<script type="application/ld+json">${jsonForHtml(breadcrumbJsonLd(product))}</script>`,
  ].join('');
  const withoutDefaultTitle = html.replace(/<title>[^<]*<\/title>/i, '').replace(/<meta name="description"[^>]*>/i, '');
  return withoutDefaultTitle.replace('</head>', `${meta}</head>`);
}

export function productHtmlFallback(product: SeoProduct) {
  const breadcrumbs = ['Home', ...(product.taxonomy_path || product.category?.name ? (product.taxonomy_path || [product.category?.name || '']) : []), product.name]
    .filter(Boolean)
    .map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const specs = (product.specifications || []).map((spec) => `<dt>${escapeHtml(spec.key)}</dt><dd>${escapeHtml(spec.value)}</dd>`).join('');
  const image = product.image_url ? `<img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" width="800" height="800" loading="eager" />` : '';
  return `<main data-seo-product="true"><nav aria-label="Breadcrumb"><ol>${breadcrumbs}</ol></nav><article><h1>${escapeHtml(product.name)}</h1>${image}<p>${escapeHtml(product.description)}</p><p>Brand: ${escapeHtml(product.brand || 'TestMarket')}</p><p>Price: ${escapeHtml(product.price_xlm)} ${escapeHtml(product.currency)}</p><p>Availability: ${escapeHtml(product.availability.replace('_', ' '))}</p><p>Seller: ${escapeHtml(product.seller || 'TestMarket Retail')}</p><p>Rating: ${escapeHtml(product.rating || 'Not rated')} (${escapeHtml(product.review_count || 0)} reviews)</p><dl>${specs}</dl></article></main>`;
}
