import { Client } from '@opensearch-project/opensearch';

/**
 * Optional hosted search adapter. TestMarket continues to serve a complete,
 * taxonomy-aware PostgreSQL search result when no OpenSearch cluster is
 * configured, so storefront discovery never depends on a second service.
 */
const node = process.env.OPENSEARCH_NODE?.trim();
const username = process.env.OPENSEARCH_USERNAME?.trim();
const password = process.env.OPENSEARCH_PASSWORD?.trim();
export const OPENSEARCH_INDEX = process.env.OPENSEARCH_INDEX?.trim() || 'testmarket-products';

const client = node
  ? new Client({ node, ...(username && password ? { auth: { username, password } } : {}) })
  : null;

export const isOpenSearchConfigured = () => Boolean(client);

export type OpenSearchFilters = {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
};

export type IndexedProductDocument = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  category_slug: string;
  category_name: string;
  product_type: string;
  taxonomy_path: string[];
  search_aliases: string[];
  tags: string[];
  attributes: string[];
  price: number;
  rating: number;
  review_count: number;
  stock: number;
  availability: 'in_stock' | 'out_of_stock';
};

export async function searchOpenSearch(query: string, filters: OpenSearchFilters, page: number, limit: number) {
  if (!client || !query.trim()) return null;
  const filter: unknown[] = [
    { term: { availability: 'in_stock' } },
  ];
  if (filters.category) filter.push({ term: { category_slug: filters.category } });
  if (filters.brand) filter.push({ term: { 'brand.keyword': filters.brand } });
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filter.push({ range: { price: { ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}), ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}) } } });
  }
  if (filters.rating !== undefined) filter.push({ range: { rating: { gte: filters.rating } } });
  if (!filters.inStock) filter.shift();

  try {
    const response = await client.search({
      index: OPENSEARCH_INDEX,
      timeout: '700ms',
      track_total_hits: true,
      body: {
        from: (page - 1) * limit,
        size: limit,
        query: {
          bool: {
            must: [{
              multi_match: {
                query,
                fields: [
                  'name^10', 'brand^7', 'product_type^7', 'search_aliases^6',
                  'taxonomy_path^5', 'tags^4', 'attributes^3', 'category_name^3', 'description',
                ],
                type: 'best_fields',
                operator: 'and',
                minimum_should_match: '60%',
                fuzziness: 'AUTO',
                prefix_length: 1,
              },
            }],
            filter,
          },
        },
        aggs: {
          brands: { terms: { field: 'brand.keyword', size: 30 } },
          categories: { terms: { field: 'category_slug', size: 30 } },
          product_types: { terms: { field: 'product_type.keyword', size: 30 } },
          price_xlm: { stats: { field: 'price' } },
        },
      },
    } as any);
    const body: any = response.body || response;
    const hits = body.hits?.hits || [];
    const total = typeof body.hits?.total === 'number' ? body.hits.total : (body.hits?.total?.value || 0);
    return {
      ids: hits.map((hit: any) => String(hit._source?.id || hit._id)).filter(Boolean),
      total,
      facets: body.aggregations || null,
      scores: new Map(hits.map((hit: any) => [String(hit._source?.id || hit._id), Number(hit._score || 0)])),
    };
  } catch (error) {
    // Search remains available through the database adapter during cluster
    // maintenance or an invalid optional configuration.
    console.warn('OpenSearch query failed; using PostgreSQL fallback', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function suggestOpenSearch(query: string, limit: number) {
  if (!client || !query.trim()) return null;
  try {
    const response = await client.search({
      index: OPENSEARCH_INDEX,
      _source: ['name', 'slug', 'brand', 'product_type', 'category_name'],
      body: {
        size: Math.min(limit, 10),
        query: {
          multi_match: {
            query,
            type: 'bool_prefix',
            fields: ['name^10', 'name._2gram^5', 'name._3gram^3', 'brand^4', 'search_aliases^4'],
            fuzziness: 'AUTO',
          },
        },
      },
    } as any);
    const body: any = response.body || response;
    return (body.hits?.hits || []).map((hit: any) => hit._source).filter(Boolean);
  } catch (error) {
    console.warn('OpenSearch suggestions failed; using PostgreSQL fallback', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function indexOpenSearchDocuments(documents: IndexedProductDocument[]) {
  if (!client) throw new Error('OpenSearch is not configured. Set OPENSEARCH_NODE and credentials before indexing.');
  const existsResponse = await client.indices.exists({ index: OPENSEARCH_INDEX });
  const exists = Boolean((existsResponse as any).body ?? existsResponse);
  if (!exists) {
    await client.indices.create({
      index: OPENSEARCH_INDEX,
      body: {
        settings: {
          analysis: {
            analyzer: {
              catalog_text: { type: 'custom', tokenizer: 'standard', filter: ['lowercase', 'asciifolding', 'catalog_synonyms'] },
              autocomplete_index: { type: 'custom', tokenizer: 'standard', filter: ['lowercase', 'asciifolding', 'edge_ngram_filter'] },
              autocomplete_search: { type: 'custom', tokenizer: 'standard', filter: ['lowercase', 'asciifolding'] },
            },
            filter: {
              edge_ngram_filter: { type: 'edge_ngram', min_gram: 2, max_gram: 20 },
              catalog_synonyms: { type: 'synonym_graph', synonyms: ['earbuds, earphones, headphones, wireless audio', 'kids, children, child, toddler', 'desk accessory, desk accessories, workspace, office setup'] },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' }, slug: { type: 'keyword' }, name: { type: 'text', analyzer: 'catalog_text', fields: { keyword: { type: 'keyword' }, _2gram: { type: 'text', analyzer: 'autocomplete_index', search_analyzer: 'autocomplete_search' }, _3gram: { type: 'text', analyzer: 'autocomplete_index', search_analyzer: 'autocomplete_search' } } },
            brand: { type: 'text', analyzer: 'catalog_text', fields: { keyword: { type: 'keyword' } } }, description: { type: 'text', analyzer: 'catalog_text' }, category_slug: { type: 'keyword' }, category_name: { type: 'text', analyzer: 'catalog_text' }, product_type: { type: 'text', analyzer: 'catalog_text', fields: { keyword: { type: 'keyword' } } }, taxonomy_path: { type: 'text', analyzer: 'catalog_text' }, search_aliases: { type: 'text', analyzer: 'catalog_text' }, tags: { type: 'text', analyzer: 'catalog_text' }, attributes: { type: 'text', analyzer: 'catalog_text' }, price: { type: 'float' }, rating: { type: 'float' }, review_count: { type: 'integer' }, stock: { type: 'integer' }, availability: { type: 'keyword' },
          },
        },
      },
    } as any);
  }
  if (!documents.length) return { indexed: 0 };
  const body = documents.flatMap((document) => [{ index: { _index: OPENSEARCH_INDEX, _id: document.id } }, document]);
  const response = await client.bulk({ refresh: true, body } as any);
  const result: any = response.body || response;
  if (result.errors) throw new Error('OpenSearch rejected one or more catalogue documents');
  return { indexed: documents.length };
}
