import assert from 'node:assert/strict';
import test from 'node:test';
import { toAgentCatalogProduct } from '../server/agentCommerce';

test('agent catalogue publishes the exact XLM product amount used for settlement', () => {
  const product = toAgentCatalogProduct({
    id: 'sony-xm5', name: 'Sony WH-1000XM5 Wireless Headphones', brand: 'Sony',
    description: 'Wireless headphones', price: 299, stock: 4, rating: 4.5,
    reviewCount: 120, categorySlug: 'electronics', imageUrl: 'https://cdn.example/sony.png',
  }, 'https://test-market.example');
  assert.equal(product.currency, 'XLM');
  assert.equal(product.price, 299);
  assert.equal(product.url, 'https://test-market.example/product/sony-xm5');
  assert.notEqual(product.currency, 'USD');
});
