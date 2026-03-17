import { useCart } from '../hooks/useCart';
import type { Product } from '../types';
import { Button } from './ui/Button';

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart, loading } = useCart();

  const handleAdd = () => {
    addToCart(product.id, 1);
  };

  if (product.stock === 0) {
    return (
      <button disabled className="btn bg-gray-100 text-gray-400 cursor-not-allowed w-full">
        Out of Stock
      </button>
    );
  }

  return (
    <Button onClick={handleAdd} loading={loading} className="w-full">
      Add to Cart
    </Button>
  );
}