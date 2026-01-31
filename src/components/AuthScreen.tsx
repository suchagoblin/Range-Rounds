import { useState } from 'react';
import { Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateUsername, validateName, validatePin } from '../utils/validation';

export function AuthScreen() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      setPin(pin + digit);
      setError('');
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleSubmit = async () => {
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.error || 'Invalid username');
      return;
    }

    const pinValidation = validatePin(pin);
    if (!pinValidation.valid) {
      setError(pinValidation.error || 'Invalid PIN');
      return;
    }

    if (isSignup) {
      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        setError(nameValidation.error || 'Invalid name');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const result = isSignup
        ? await signup(username, name, pin)
        : await login(username, pin);

      if (!result.success) {
        setError(result.error || 'Authentication failed');
        setPin('');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setPin('');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setUsername('');
    setName('');
    setPin('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-topo flex items-center justify-center p-4">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-emerald-500/20 rounded-full mb-4 border border-emerald-500/30">
            {isSignup ? (
              <UserPlus className="w-8 h-8 text-emerald-400" />
            ) : (
              <User className="w-8 h-8 text-emerald-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400">
            {isSignup ? 'Sign up to start tracking your golf game' : 'Sign in to continue'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter username"
              className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              PIN (4-6 digits)
            </label>
            <div className="flex gap-2 mb-4 justify-center">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center transition-colors ${
                    pin[i]
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : i < 4
                      ? 'border-slate-600 bg-slate-800'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {pin[i] && (
                    <Lock className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handlePinInput(digit.toString())}
                  disabled={isLoading || pin.length >= 6}
                  className="h-14 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={handlePinDelete}
                disabled={isLoading || pin.length === 0}
                className="h-14 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30"
              >
                ←
              </button>
              <button
                onClick={() => handlePinInput('0')}
                disabled={isLoading || pin.length >= 6}
                className="h-14 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
              >
                0
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || pin.length < 4 || !username || (isSignup && !name)}
                className="h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:shadow-lg text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400"
              >
                {isLoading ? '...' : '✓'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <div className="pt-4 text-center">
            <button
              onClick={toggleMode}
              disabled={isLoading}
              className="text-emerald-400 hover:text-emerald-300 font-medium text-sm"
            >
              {isSignup
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
