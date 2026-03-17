import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center font-bold text-xl">
              Shop
            </Link>
            <div className="hidden sm:flex sm:ml-6 sm:space-x-4">
              <Link to="/products" className="px-3 py-2 text-gray-700 hover:text-gray-900">
                Products
              </Link>
              <Link to="/subscriptions" className="px-3 py-2 text-gray-700 hover:text-gray-900">
                Subscriptions
              </Link>
              {user?.is_admin && (
                <Link to="/admin" className="px-3 py-2 text-gray-700 hover:text-gray-900">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/cart" className="px-3 py-2 text-gray-700 hover:text-gray-900">
                  Cart
                </Link>
                <Link to="/dashboard" className="px-3 py-2 text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-gray-700 hover:text-gray-900">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}