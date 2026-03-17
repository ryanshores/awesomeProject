import { useCart } from '../../hooks/useCart';
import { createCheckoutSession } from '../../api/subscriptions';

export function CartPage() {
  const { items, removeItem, updateItem, total, clear } = useCart();

  const handleCheckout = async () => {
    const session = await createCheckoutSession(
      window.location.origin + '/dashboard?success=true',
      window.location.origin + '/cart'
    );
    window.location.href = session.url;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center bg-white p-4 rounded-lg shadow">
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} className="w-20 h-20 object-cover rounded" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                    No Image
                  </div>
                )}
                <div className="flex-1 ml-4">
                  <h2 className="font-semibold">{item.product.name}</h2>
                  <p className="text-gray-600">${(item.product.price / 100).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, Number(e.target.value))}
                    className="w-16 px-2 py-1 border rounded"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="ml-4 font-semibold">
                  ${((item.product.price * item.quantity) / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <button onClick={clear} className="text-red-600 hover:text-red-800">
              Clear Cart
            </button>
            <div className="text-xl font-bold">
              Total: ${(total / 100).toFixed(2)}
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}