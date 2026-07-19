import { PrismaClient } from '@prisma/client';
import { deriveCatalogTaxonomy } from '../server/catalogTaxonomy';
import { indexOpenSearchDocuments, isOpenSearchConfigured } from '../server/searchProvider';

const prisma = new PrismaClient();

async function main() {
  if (!isOpenSearchConfigured()) {
    throw new Error('OpenSearch is not configured. Set OPENSEARCH_NODE and credentials in the environment.');
  }
  const catalogSource = process.env.CATALOG_SOURCE_URL?.replace(/\/$/, '');
  if (catalogSource) {
    const documents: any[] = [];
    let offset = 0;
    do {
      const response = await fetch(`${catalogSource}/catalog.json?limit=100&offset=${offset}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Catalog source returned ${response.status}`);
      const page: any = await response.json();
      for (const product of page.products || []) {
        documents.push({
          id: product.id, slug: product.slug, name: product.name, brand: product.brand || '', description: product.description || '',
          category_slug: product.category_slug || product.category?.slug || '', category_name: product.category_name || product.category?.name || '',
          product_type: product.product_type || '', taxonomy_path: product.taxonomy_path || [], search_aliases: product.search_aliases || [],
          tags: product.tags || [], attributes: product.attributes || [], price: Number(product.price || 0), rating: Number(product.rating || 0),
          review_count: Number(product.review_count || 0), stock: Number(product.stock || 0), availability: product.availability === 'in_stock' ? 'in_stock' : 'out_of_stock',
        });
      }
      offset = page.pagination?.next_offset;
    } while (offset !== null && offset !== undefined);
    const result = await indexOpenSearchDocuments(documents);
    console.log(`Indexed ${result.indexed} active TestMarket products from ${catalogSource}.`);
    return;
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true, slug: true, name: true, brand: true, description: true, price: true, rating: true, reviewCount: true, stock: true,
      category: { select: { slug: true, name: true } },
      specs: { select: { key: true, value: true }, take: 50 },
    },
  });
  const documents = products.map((product) => {
    const taxonomy = deriveCatalogTaxonomy({
      name: product.name, brand: product.brand, description: product.description,
      categorySlug: product.category.slug, categoryName: product.category.name, specs: product.specs,
    });
    return {
      id: product.id, slug: product.slug, name: product.name, brand: product.brand, description: product.description,
      category_slug: product.category.slug, category_name: product.category.name, product_type: taxonomy.productType,
      taxonomy_path: taxonomy.taxonomyPath, search_aliases: taxonomy.searchAliases, tags: taxonomy.tags,
      attributes: product.specs.flatMap((spec) => [spec.key, spec.value]), price: product.price, rating: product.rating,
      review_count: product.reviewCount, stock: product.stock, availability: product.stock > 0 ? 'in_stock' as const : 'out_of_stock' as const,
    };
  });
  const result = await indexOpenSearchDocuments(documents);
  console.log(`Indexed ${result.indexed} active TestMarket products.`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
