import { PrismaClient } from '@prisma/client';
import { deriveCatalogTaxonomy } from '../server/catalogTaxonomy';
import { indexOpenSearchDocuments, isOpenSearchConfigured } from '../server/searchProvider';

const prisma = new PrismaClient();

async function main() {
  if (!isOpenSearchConfigured()) {
    throw new Error('OpenSearch is not configured. Set OPENSEARCH_NODE and credentials in the environment.');
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
