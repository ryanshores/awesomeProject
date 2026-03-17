import { useState } from 'react';
import { login as apiLogin } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../components/ui';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await apiLogin(email, password);
      login(token, user);
      window.location.href = '/';
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="card-body">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="mt-2 text-gray-600">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button type="submit" className="w-full" loading={loading}>
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}