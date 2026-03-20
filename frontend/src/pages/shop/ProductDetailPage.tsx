import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct } from '../../api/products';
import type { Product } from '../../types';
import { AddToCartButton } from '../../components/AddToCartButton';
import { Spinner } from '../../components/ui';

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProduct(Number(id))
        .then(setProduct)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="empty-state">
            <svg className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Product not found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The product you're looking for doesn't exist</p>
          </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="mt-8 lg:mt-0">
          {product.category && (
            <span className="badge badge-default">{product.category}</span>
          )}
          
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {product.name}
          </h1>
          
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${(product.price / 100).toFixed(2)}
            </span>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div className="text-base text-gray-600 dark:text-gray-300 space-y-3">
              {product.description ? (
                product.description.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))
              ) : (
                <p className="italic">No description available</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {product.stock > 0 ? (
                  <span className="badge badge-success">In Stock</span>
                ) : (
                  <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Out of Stock</span>
                )}
              </div>
              {product.stock > 0 && product.stock <= 10 && (
                <span className="text-sm text-orange-600 dark:text-orange-400">
                  Only {product.stock} left
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
            <AddToCartButton product={product} />
          </div>

          {product.sku && (
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">SKU:</span> {product.sku}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}