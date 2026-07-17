import assert from 'node:assert/strict';
import test from 'node:test';
import { useToastStore } from '../src/store/toastStore';
import { useWishlistStore } from '../src/store/wishlistStore';

test('restores the optimistic wishlist state and shows a visible error when the request fails', async () => {
  const originalFetch = globalThis.fetch;
  const originalSetTimeout = globalThis.setTimeout;
  globalThis.fetch = (async () => new Response('', { status: 500 })) as typeof fetch;
  globalThis.setTimeout = ((..._args: unknown[]) => 0) as typeof setTimeout;

  try {
    useWishlistStore.setState({
      items: [{ productId: 'product-1' }],
      loadedForUserId: 'user-1',
      pending: {},
    });
    useToastStore.setState({ toasts: [] });

    await useWishlistStore.getState().toggleWishlist('product-1');

    assert.deepEqual(useWishlistStore.getState().items, [{ productId: 'product-1' }]);
    assert.equal(useWishlistStore.getState().pending['product-1'], undefined);
    assert.equal(useToastStore.getState().toasts.at(-1)?.message, 'Wishlist update failed. Your previous selection was restored.');
    assert.equal(useToastStore.getState().toasts.at(-1)?.type, 'error');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.setTimeout = originalSetTimeout;
    useWishlistStore.setState({ items: [], loadedForUserId: null, pending: {} });
    useToastStore.setState({ toasts: [] });
  }
});
