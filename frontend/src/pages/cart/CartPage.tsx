import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { createCheckoutSession } from '../../api/subscriptions';
import { Spinner } from '../../components/ui';

export function CartPage() {
  const { items, removeItem, updateItem, total, clear } = useCart();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const session = await createCheckoutSession(
        window.location.origin + '/dashboard?success=true',
        window.location.origin + '/cart'
      );
      window.location.href = session.url;
    } catch {
      setCheckingOut(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    setUpdating(itemId);
    await updateItem(itemId, quantity);
    setUpdating(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="page-title">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="card mt-8">
          <div className="empty-state py-12">
            <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="empty-state-title">Your cart is empty</h3>
            <p className="empty-state-description">Start shopping to add items to your cart</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary mt-4">
              Browse Products
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card flex items-center p-4 gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">${(item.product.price / 100).toFixed(2)} each</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    disabled={updating === item.id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">
                    {updating === item.id ? <Spinner size="sm" className="inline" /> : item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={updating === item.id || item.quantity >= item.product.stock}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${((item.product.price * item.quantity) / 100).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card mt-6">
            <div className="card-body flex items-center justify-between">
              <button onClick={clear} className="text-red-600 hover:text-red-800 text-sm font-medium">
                Clear Cart
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="text-2xl font-bold text-gray-900">${(total / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="btn btn-primary btn-lg w-full mt-6"
          >
            {checkingOut ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              'Proceed to Checkout'
            )}
          </button>
        </div>
      )}
    </div>
  );
}