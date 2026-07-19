import assert from 'node:assert/strict';
import test from 'node:test';
import { agentCatalogMatchScore, toAgentCatalogProduct } from '../server/agentCommerce';

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
