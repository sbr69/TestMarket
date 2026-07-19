export type CatalogTaxonomyInput = {
  name: string;
  brand?: string | null;
  description?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  specs?: Array<{ key: string; value: string }>;
};

export type CatalogSearchInput = CatalogTaxonomyInput & {
  id?: string;
  price?: number;
  rating?: number | null;
};

type TaxonomyRule = {
  pattern: RegExp;
  productType: string;
  path: string[];
  aliases: string[];
};

/**
 * This is TestMarket's merchant-owned browse taxonomy. It is deliberately
 * independent of any shopping agent: every client receives the same stable
 * product type, hierarchy and retrieval aliases from the catalogue API.
 *
 * The rules are a data-quality bridge for the existing demo catalogue, whose
 * historic descriptions are mostly boilerplate. In a larger merchant system,
 * these fields would be authored in the PIM and indexed by the search service.
 */
const rules: TaxonomyRule[] = [
  { pattern: /\b(earbuds?|earphones?)\b/i, productType: 'earbuds', path: ['Electronics', 'Audio', 'Headphones & Earbuds'], aliases: ['audio', 'earbuds', 'earphones', 'headphones', 'wireless audio', 'bluetooth', 'music', 'listening'] },
  { pattern: /\b(headphones?|headset)\b/i, productType: 'headphones', path: ['Electronics', 'Audio', 'Headphones & Earbuds'], aliases: ['audio', 'headphones', 'headset', 'wireless audio', 'bluetooth', 'music', 'listening'] },
  { pattern: /\b(speaker|soundbar)\b/i, productType: 'speaker', path: ['Electronics', 'Audio', 'Speakers'], aliases: ['audio', 'speaker', 'sound', 'wireless audio', 'bluetooth', 'music'] },
  { pattern: /\b(laptop|notebook|macbook)\b/i, productType: 'laptop', path: ['Electronics', 'Computers', 'Laptops'], aliases: ['computer', 'laptop', 'notebook', 'work', 'study'] },
  { pattern: /\b(tablet|ipad)\b/i, productType: 'tablet', path: ['Electronics', 'Computers & Tablets', 'Tablets'], aliases: ['tablet', 'portable computer', 'work', 'study'] },
  { pattern: /\b(phone|smartphone|galaxy)\b/i, productType: 'smartphone', path: ['Electronics', 'Mobile Phones'], aliases: ['phone', 'smartphone', 'mobile'] },
  { pattern: /\b(tv|television|oled)\b/i, productType: 'television', path: ['Electronics', 'TV & Video', 'Televisions'], aliases: ['television', 'tv', 'home entertainment', 'movie'] },
  { pattern: /\b(camera|gopro)\b/i, productType: 'camera', path: ['Electronics', 'Cameras'], aliases: ['camera', 'photography', 'video'] },
  { pattern: /\b(mouse|keyboard)\b/i, productType: 'computer accessory', path: ['Electronics', 'Computers', 'Accessories'], aliases: ['computer accessory', 'desk accessory', 'desk accessories', 'mouse', 'keyboard', 'workspace', 'office setup', 'productivity'] },
  { pattern: /\b(game console|nintendo|playstation|xbox|switch)\b/i, productType: 'gaming console', path: ['Electronics', 'Gaming'], aliases: ['gaming', 'game console', 'video game', 'entertainment'] },
  { pattern: /\b(vacuum|air purifier|mattress|duvet|cookware|skillet|kettle|coffee maker|cutting board|wine glass)\b/i, productType: 'home essential', path: ['Home & Kitchen'], aliases: ['home', 'kitchen', 'household', 'home essential'] },
  { pattern: /\b(bag|tote|backpack|luggage)\b/i, productType: 'bag', path: ['Fashion', 'Bags & Luggage'], aliases: ['bag', 'carry', 'travel accessory', 'laptop bag'] },
  { pattern: /\b(shoes?|sneakers?|boots?)\b/i, productType: 'footwear', path: ['Fashion', 'Footwear'], aliases: ['shoes', 'footwear', 'sneakers', 'running'] },
  { pattern: /\b(jacket|shirt|sweater|pants|skirt|watch|sunglasses)\b/i, productType: 'fashion accessory', path: ['Fashion'], aliases: ['fashion', 'clothing', 'apparel', 'style'] },
  { pattern: /\b(serum|moisturizer|sunscreen|mask|lipstick|mascara|toner|scrub|oil treatment)\b/i, productType: 'beauty product', path: ['Beauty & Personal Care'], aliases: ['beauty', 'skincare', 'personal care', 'self care'] },
  { pattern: /\b(blocks?|dollhouse|train set|toy|teddy|puzzle|action figure|science kit|water gun|board game|remote control car)\b/i, productType: 'toy', path: ['Toys & Games'], aliases: ['toy', 'gift', 'gift for kids', 'kid', 'kids', 'child', 'children', 'play', 'educational'] },
  { pattern: /\b(book|novel|paperback|hardcover)\b/i, productType: 'book', path: ['Books'], aliases: ['book', 'reading', 'novel'] },
  { pattern: /\b(yoga|dumbbell|racket|basketball|helmet|tent|resistance band|foam roller|jump rope)\b/i, productType: 'sports equipment', path: ['Sports & Outdoors'], aliases: ['sports', 'fitness', 'outdoor', 'exercise'] },
  { pattern: /\b(coffee|honey|olive oil|quinoa|butter|food|grocery|oats|tea|mango|salt|syrup)\b/i, productType: 'grocery item', path: ['Grocery'], aliases: ['grocery', 'food', 'pantry', 'kitchen'] },
];

const normalize = (value: unknown) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const unique = (values: Array<string | null | undefined>) => [...new Set(values.map((value) => normalize(value)).filter(Boolean))];

const singular = (token: string) => {
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('ses') && token.length > 4) return token.slice(0, -2);
  if (token.endsWith('s') && token.length > 3 && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
};

const canonicalTokens = (value: unknown) => [...new Set(normalize(value).split(' ').filter((token) => token.length >= 2).map(singular))];

function attributesFor(product: CatalogTaxonomyInput) {
  return (product.specs || [])
    .filter((spec) => spec?.key && spec?.value)
    .flatMap((spec) => [String(spec.key), String(spec.value)]);
}

function sourceFor(product: CatalogTaxonomyInput) {
  return [
    product.name,
    product.brand,
    product.description,
    product.categorySlug,
    product.categoryName,
    ...attributesFor(product),
  ].filter(Boolean).join(' ');
}

function ruleMatchesQuery(rule: TaxonomyRule, query: string) {
  if (rule.pattern.test(query)) return true;
  const queryTokens = canonicalTokens(query);
  if (!queryTokens.length) return false;
  return rule.aliases.some((alias) => {
    const aliasText = normalize(alias);
    const aliasTokens = canonicalTokens(alias);
    return normalize(query).includes(aliasText)
      || aliasText.includes(normalize(query))
      || (aliasTokens.length > 0 && aliasTokens.every((token) => queryTokens.includes(token)));
  });
}

/** Return a stable, merchant-authored-shaped taxonomy payload for a product. */
export function deriveCatalogTaxonomy(product: CatalogTaxonomyInput) {
  const source = sourceFor(product);
  const matched = rules.find((rule) => rule.pattern.test(source));
  const categoryName = product.categoryName || product.categorySlug || 'General Merchandise';
  const attributes = attributesFor(product);
  const path = matched?.path || [categoryName];
  const aliases = unique([
    ...(matched?.aliases || []),
    matched?.productType || '',
    product.categorySlug || '',
    categoryName,
  ]);

  return {
    productType: matched?.productType || normalize(categoryName),
    taxonomyPath: path,
    tags: unique([
      product.categorySlug || '',
      categoryName,
      ...path,
      ...aliases,
      ...attributes,
    ]),
    searchAliases: aliases,
  };
}

/**
 * Expand a natural-language storefront query into merchant taxonomy terms
 * before SQL candidate retrieval. This keeps the API useful to any agent
 * without knowing who the caller is or requiring its own hard-coded aliases.
 */
export function expandCatalogSearchTerms(query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];
  const expanded = [normalizedQuery, ...canonicalTokens(normalizedQuery)];
  for (const rule of rules) {
    if (!ruleMatchesQuery(rule, normalizedQuery)) continue;
    expanded.push(rule.productType, ...rule.path, ...rule.aliases);
  }
  return unique(expanded).slice(0, 32);
}

function tokenMatches(text: string, term: string) {
  const textTokens = canonicalTokens(text);
  return canonicalTokens(term).every((token) => textTokens.includes(token));
}

/**
 * Deterministic merchant relevance used after SQL candidate retrieval. It is
 * intentionally transparent: product identity and taxonomy outweigh generic
 * boilerplate, while unrelated catalogue rows receive a score of zero.
 */
export function catalogSearchScore(product: CatalogTaxonomyInput, query: string) {
  const phrase = normalize(query);
  if (!phrase) return 0;
  const terms = canonicalTokens(phrase);
  const taxonomy = deriveCatalogTaxonomy(product);
  const fields: Array<[string, number]> = [
    [normalize(product.name), 52],
    [normalize(product.brand), 16],
    [normalize(taxonomy.productType), 38],
    [normalize(taxonomy.taxonomyPath.join(' ')), 24],
    [normalize(taxonomy.searchAliases.join(' ')), 34],
    [normalize(taxonomy.tags.join(' ')), 15],
    [normalize(attributesFor(product).join(' ')), 18],
    [normalize(product.description), 8],
    [normalize(`${product.categoryName || ''} ${product.categorySlug || ''}`), 18],
  ];
  return fields.reduce((total, [text, weight]) => {
    if (!text) return total;
    const phraseBonus = text.includes(phrase) ? weight * 3 : 0;
    const termScore = terms.reduce((score, term) => score + (tokenMatches(text, term) ? weight : 0), 0);
    return total + phraseBonus + termScore;
  }, 0);
}

export function rankCatalogMatches<T extends CatalogSearchInput>(products: T[], query: string) {
  return products
    .map((product) => ({ product, relevance: catalogSearchScore(product, query) }))
    .filter((match) => match.relevance > 0)
    .sort((left, right) => right.relevance - left.relevance
      || Number(right.product.rating || 0) - Number(left.product.rating || 0)
      || String(left.product.id || left.product.name).localeCompare(String(right.product.id || right.product.name)));
}

export function buildCatalogFacets(products: CatalogSearchInput[]) {
  const counts = (values: Array<{ value: string; label: string }>) => {
    const result = new Map<string, { value: string; label: string; count: number }>();
    for (const entry of values) {
      const value = normalize(entry.value);
      if (!value) continue;
      const existing = result.get(value);
      result.set(value, { value, label: entry.label, count: (existing?.count || 0) + 1 });
    }
    return [...result.values()].sort((left, right) => right.count - left.count || left.label.localeCompare(right.label)).slice(0, 20);
  };
  const prices = products.map((product) => Number(product.price)).filter(Number.isFinite);
  const taxonomies = products.map((product) => deriveCatalogTaxonomy(product));
  return {
    categories: counts(products.map((product) => ({ value: product.categorySlug || product.categoryName || '', label: product.categoryName || product.categorySlug || '' }))),
    brands: counts(products.map((product) => ({ value: product.brand || '', label: product.brand || '' }))),
    product_types: counts(taxonomies.map((taxonomy) => ({ value: taxonomy.productType, label: taxonomy.productType }))),
    price_xlm: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
  };
}
