import assert from 'node:assert/strict';
import test from 'node:test';
import { agentCatalogMatchScore, toAgentCatalogProduct } from '../server/agentCommerce';
import { buildCatalogFacets, expandCatalogSearchTerms, rankCatalogMatches } from '../server/catalogTaxonomy';

test('agent catalogue publishes the exact XLM product amount used for settlement', () => {
  const product = toAgentCatalogProduct({
    id: 'sony-xm5', name: 'Sony WH-1000XM5 Wireless Headphones', brand: 'Sony',
    description: 'Enjoy this high-quality Sony WH-1000XM5 Wireless Headphones from Sony. Perfect for your daily needs with excellent value and top-notch performance.', price: 299, stock: 4, rating: 4.5,
    reviewCount: 120, categorySlug: 'electronics', categoryName: 'Electronics', sellerName: 'TestMarket Retail',
    specs: [{ key: 'Connectivity', value: 'Wireless Bluetooth' }, { key: 'Battery', value: '30 hours' }],
    imageUrl: 'https://cdn.example/sony.png',
  }, 'https://test-market.example');
  assert.equal(product.currency, 'XLM');
  assert.equal(product.price, 299);
  assert.equal(product.price_xlm, '299.0000000');
  assert.equal(product.price_stroops, '2990000000');
  assert.equal(product.availability, 'in_stock');
  assert.equal(product.category_name, 'Electronics');
  assert.equal(product.product_type, 'headphones');
  assert.deepEqual(product.taxonomy_path, ['Electronics', 'Audio', 'Headphones & Earbuds']);
  assert.ok(product.search_aliases.includes('wireless audio'));
  assert.deepEqual(product.attributes, ['Battery: 30 hours', 'Connectivity: Wireless Bluetooth']);
  assert.ok(product.tags.includes('electronics'));
  assert.match(product.description, /Category: Electronics/);
  assert.equal(product.url, 'https://test-market.example/product/sony-xm5');
  assert.notEqual(product.currency, 'USD');
});

test('merchant lexical retrieval weights product identity and structured attributes above boilerplate', () => {
  const headphones = {
    id: 'sony-xm5', name: 'Sony WH-1000XM5 Wireless Headphones', brand: 'Sony', description: 'Premium listening device', price: 299, stock: 4,
    categorySlug: 'electronics', categoryName: 'Electronics', specs: [{ key: 'Connectivity', value: 'Wireless Bluetooth' }],
  };
  const vacuum = {
    id: 'vacuum', name: 'Robot Vacuum Cleaner', brand: 'iRobot', description: 'Premium home appliance', price: 299, stock: 4,
    categorySlug: 'home-kitchen', categoryName: 'Home & Kitchen', specs: [{ key: 'Connectivity', value: 'Wi-Fi' }],
  };
  assert.ok(agentCatalogMatchScore(headphones, 'wireless headphones') > agentCatalogMatchScore(vacuum, 'wireless headphones'));
  assert.ok(agentCatalogMatchScore(headphones, 'bluetooth') > 0);
});

test('merchant taxonomy resolves wireless audio to audio products and never falls back to unrelated catalog rows', () => {
  const bose = {
    id: 'bose-qc-ii', name: 'Bose QuietComfort Earbuds II', brand: 'Bose', description: 'Legacy product description', price: 249, stock: 4,
    categorySlug: 'electronics', categoryName: 'Electronics', rating: 4.1,
  };
  const sony = {
    id: 'sony-xm5', name: 'Sony WH-1000XM5 Wireless Headphones', brand: 'Sony', description: 'Legacy product description', price: 348, stock: 4,
    categorySlug: 'electronics', categoryName: 'Electronics', rating: 4.4,
  };
  const vacuum = {
    id: 'vacuum', name: 'Robot Vacuum Cleaner', brand: 'iRobot', description: 'Legacy product description', price: 299, stock: 4,
    categorySlug: 'home-kitchen', categoryName: 'Home & Kitchen', rating: 4.4,
  };
  const quinoa = {
    id: 'quinoa', name: 'Organic Quinoa 2lbs', brand: 'HealthyGrains', description: 'Legacy product description', price: 9.99, stock: 4,
    categorySlug: 'grocery', categoryName: 'Grocery', rating: 4.4,
  };
  const matches = rankCatalogMatches([bose, sony, vacuum, quinoa], 'wireless audio');
  assert.deepEqual(new Set(matches.map((match) => match.product.id)), new Set(['bose-qc-ii', 'sony-xm5']));
  const underThreeHundred = rankCatalogMatches([bose, sony, vacuum, quinoa].filter((product) => product.price <= 300), 'wireless audio');
  assert.deepEqual(underThreeHundred.map((match) => match.product.id), ['bose-qc-ii']);
  assert.equal(agentCatalogMatchScore(vacuum, 'wireless audio'), 0);
  assert.equal(agentCatalogMatchScore(quinoa, 'wireless audio'), 0);
  assert.ok(expandCatalogSearchTerms('wireless audio').includes('earbuds'));
  assert.ok(expandCatalogSearchTerms('desk accessories').includes('mouse'));
});

test('merchant discovery facets expose only the taxonomy represented by the matched set', () => {
  const audio = { id: 'bose', name: 'Bose QuietComfort Earbuds II', brand: 'Bose', price: 249, categorySlug: 'electronics', categoryName: 'Electronics' };
  const secondAudio = { id: 'sony', name: 'Sony WH-1000XM5 Wireless Headphones', brand: 'Sony', price: 348, categorySlug: 'electronics', categoryName: 'Electronics' };
  const facets = buildCatalogFacets([audio, secondAudio]);
  assert.deepEqual(facets.categories, [{ value: 'electronics', label: 'Electronics', count: 2 }]);
  assert.deepEqual(facets.product_types.map((entry) => entry.value), ['earbuds', 'headphones']);
  assert.deepEqual(facets.price_xlm, { min: 249, max: 348 });
});
