import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../api/products';
import type { Product } from '../../types';
import { AddToCartButton } from '../../components/AddToCartButton';
import { Spinner } from '../../components/ui';

export function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    getProducts(1, 50, category).then((data) => {
      setProducts(data.products || []);
      setLoading(false);
    });
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto text-blue-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-description">Browse our collection of products</p>
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-input w-full sm:w-48"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="other">Other</option>
        </select>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <svg className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No products found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check back later for new products</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <article
              key={product.id}
              className="card group overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <Link to={`/products/${product.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                {product.category && (
                  <span className="badge badge-default mb-2">{product.category}</span>
                )}
                <Link to={`/products/${product.id}`}>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h2>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ${(product.price / 100).toFixed(2)}
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">In Stock</span>
                  ) : (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">Out of Stock</span>
                  )}
                </div>
                <div className="mt-3">
                  <AddToCartButton product={product} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}