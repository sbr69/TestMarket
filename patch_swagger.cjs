const fs = require('fs');
let swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

// 4. Add Logout endpoint
swagger.paths['/auth/logout'] = {
  post: {
    summary: "Logout user",
    security: [{ bearerAuth: [] }],
    responses: {
      "200": {
        description: "Logged out successfully"
      }
    }
  }
};

// 5. Add Wishlist endpoints
swagger.paths['/wishlist'] = {
  get: {
    summary: "Get user wishlist",
    security: [{ bearerAuth: [] }],
    responses: {
      "200": {
        description: "List of wishlisted products"
      }
    }
  }
};

swagger.paths['/wishlist/{product_id}'] = {
  post: {
    summary: "Add product to wishlist",
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: "product_id", in: "path", required: true, schema: { type: "string" } }
    ],
    responses: {
      "200": {
        description: "Product added to wishlist"
      }
    }
  },
  delete: {
    summary: "Remove product from wishlist",
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: "product_id", in: "path", required: true, schema: { type: "string" } }
    ],
    responses: {
      "200": {
        description: "Product removed from wishlist"
      }
    }
  }
};

fs.writeFileSync('swagger.json', JSON.stringify(swagger, null, 2), 'utf8');
console.log('Successfully patched swagger.json');
