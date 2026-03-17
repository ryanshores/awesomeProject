import { useCart } from '../hooks/useCart';
import type { Product } from '../types';

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart, loading } = useCart();

  const handleAdd = () => {
    addToCart(product.id, 1);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading || product.stock === 0}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
    </button>
  );
}