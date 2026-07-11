const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const updated = content
  .replace("import HomePage from './pages/HomePage';", "import HomePage from './pages/HomePage';\nimport ProductDetailPage from './pages/ProductDetailPage';")
  .replace('<Route path="/" element={<HomePage />} />', '<Route path="/" element={<HomePage />} />\n            <Route path="/product/:id" element={<ProductDetailPage />} />');

fs.writeFileSync('src/App.tsx', updated);
console.log('App.tsx patched!');
