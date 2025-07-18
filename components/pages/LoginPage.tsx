
import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { APP_NAME, ICONS } from '../../constants';
import Button from '../ui/Button';

const LoginPage: React.FC = () => {
  const [keyValue, setKeyValue] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyValue.trim()) return;
    try {
      await login(keyValue);
      // Navigation will be handled by the App component
    } catch (err) {
      // Error is handled in the store, just need to catch to prevent unhandled promise rejection
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-2xl rounded-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-sky-600">{APP_NAME}</h1>
          <p className="mt-2 text-slate-500">Customer Support Center Login</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="key-value" className="sr-only">Access Key</label>
              <input
                id="key-value"
                name="key"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                placeholder="Enter your access key"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              leftIcon={ICONS.keys}
            >
              Login
            </Button>
          </div>
        </form>
      </div>
       <footer className="mt-8 text-center text-sm text-slate-500">
          <p>Don't have a key? Contact your administrator.</p>
          <p className="mt-1">
            Looking to chat? Use the direct link provided by our agents.
          </p>
        </footer>
    </div>
  );
};

export default LoginPage;
