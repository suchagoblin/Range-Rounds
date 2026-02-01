import { useState } from 'react';
import { Lock, User, UserPlus, KeyRound, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateUsername, validateName, validatePin } from '../utils/validation';
import { supabase } from '../lib/supabase';

type AuthMode = 'login' | 'signup' | 'recovery' | 'recovery-question' | 'recovery-newpin';

export function AuthScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Recovery state
  const [recoveryQuestion, setRecoveryQuestion] = useState<{ id: string; text: string } | null>(null);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');

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

    if (mode === 'signup') {
      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        setError(nameValidation.error || 'Invalid name');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const result = mode === 'signup'
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

  const handleStartRecovery = async () => {
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.error || 'Please enter your username');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if user has security question set up
      const { data: hasQuestions } = await supabase
        .rpc('has_security_questions', { p_username: username });

      if (!hasQuestions) {
        setError('No security question set up for this account. Please contact support or create a new account.');
        setIsLoading(false);
        return;
      }

      // Get the security question
      const { data: questionData, error: questionError } = await supabase
        .rpc('get_security_question_for_user', { p_username: username });

      if (questionError || !questionData || questionData.length === 0) {
        setError('Could not retrieve security question. Please try again.');
        setIsLoading(false);
        return;
      }

      setRecoveryQuestion({
        id: questionData[0].question_id,
        text: questionData[0].question_text
      });
      setMode('recovery-question');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Recovery error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAnswer = async () => {
    if (!recoveryAnswer.trim()) {
      setError('Please enter your answer');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: isCorrect } = await supabase
        .rpc('verify_security_answer', {
          p_username: username,
          p_question_id: recoveryQuestion?.id,
          p_answer: recoveryAnswer
        });

      if (!isCorrect) {
        setError('Incorrect answer. Please try again.');
        setIsLoading(false);
        return;
      }

      // Answer is correct, proceed to new PIN
      setMode('recovery-newpin');
      setPin('');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Verify answer error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPin = async () => {
    const pinValidation = validatePin(pin);
    if (!pinValidation.valid) {
      setError(pinValidation.error || 'Invalid PIN');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: resetError } = await supabase
        .rpc('reset_pin_with_security', {
          p_username: username,
          p_question_id: recoveryQuestion?.id,
          p_answer: recoveryAnswer,
          p_new_pin: pin
        });

      if (resetError || !data || !data[0]?.success) {
        setError(data?.[0]?.error_message || 'Failed to reset PIN. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success! Go back to login
      setSuccessMessage('PIN reset successfully! Please sign in with your new PIN.');
      resetState();
      setMode('login');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Reset PIN error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setUsername('');
    setName('');
    setPin('');
    setError('');
    setRecoveryQuestion(null);
    setRecoveryAnswer('');
  };

  const goBack = () => {
    if (mode === 'recovery-newpin') {
      setMode('recovery-question');
      setPin('');
    } else if (mode === 'recovery-question') {
      setMode('recovery');
      setRecoveryAnswer('');
    } else {
      setMode('login');
      resetState();
    }
    setError('');
  };

  const toggleMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
    resetState();
    setSuccessMessage('');
  };

  // Recovery: Enter Username
  if (mode === 'recovery') {
    return (
      <div className="min-h-screen bg-topo flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 w-full max-w-md">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-slate-400 hover:text-white mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </button>

          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-violet-500/20 rounded-full mb-4 border border-violet-500/30">
              <KeyRound className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Forgot Your PIN?</h1>
            <p className="text-slate-400">
              Enter your username to recover your account
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
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleStartRecovery}
              disabled={isLoading || !username}
              className="w-full py-3 bg-gradient-to-br from-violet-500 to-violet-600 hover:shadow-lg text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-violet-400"
            >
              {isLoading ? 'Checking...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Recovery: Answer Security Question
  if (mode === 'recovery-question') {
    return (
      <div className="min-h-screen bg-topo flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 w-full max-w-md">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-slate-400 hover:text-white mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-violet-500/20 rounded-full mb-4 border border-violet-500/30">
              <Shield className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Security Question</h1>
            <p className="text-slate-400">
              Answer your security question to continue
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <p className="text-white font-medium">{recoveryQuestion?.text}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Answer
              </label>
              <input
                type="text"
                value={recoveryAnswer}
                onChange={(e) => {
                  setRecoveryAnswer(e.target.value);
                  setError('');
                }}
                placeholder="Enter your answer"
                className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-1">Answers are not case-sensitive</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleVerifyAnswer}
              disabled={isLoading || !recoveryAnswer.trim()}
              className="w-full py-3 bg-gradient-to-br from-violet-500 to-violet-600 hover:shadow-lg text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-violet-400"
            >
              {isLoading ? 'Verifying...' : 'Verify Answer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Recovery: Set New PIN
  if (mode === 'recovery-newpin') {
    return (
      <div className="min-h-screen bg-topo flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 w-full max-w-md">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-slate-400 hover:text-white mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-emerald-500/20 rounded-full mb-4 border border-emerald-500/30">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Set New PIN</h1>
            <p className="text-slate-400">
              Choose a new 4-6 digit PIN for your account
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New PIN (4-6 digits)
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
                  onClick={handleResetPin}
                  disabled={isLoading || pin.length < 4}
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
          </div>
        </div>
      </div>
    );
  }

  // Login / Signup
  return (
    <div className="min-h-screen bg-topo flex items-center justify-center p-4">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-emerald-500/20 rounded-full mb-4 border border-emerald-500/30">
            {mode === 'signup' ? (
              <UserPlus className="w-8 h-8 text-emerald-400" />
            ) : (
              <User className="w-8 h-8 text-emerald-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400">
            {mode === 'signup' ? 'Sign up to start tracking your golf game' : 'Sign in to continue'}
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
            <p className="text-sm text-emerald-400 text-center">{successMessage}</p>
          </div>
        )}

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
                setSuccessMessage('');
              }}
              placeholder="Enter username"
              className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          {mode === 'signup' && (
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
                disabled={isLoading || pin.length < 4 || !username || (mode === 'signup' && !name)}
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

          <div className="pt-4 text-center space-y-2">
            <button
              onClick={toggleMode}
              disabled={isLoading}
              className="text-emerald-400 hover:text-emerald-300 font-medium text-sm"
            >
              {mode === 'signup'
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>

            {mode === 'login' && (
              <div>
                <button
                  onClick={() => {
                    setMode('recovery');
                    setError('');
                    setSuccessMessage('');
                  }}
                  disabled={isLoading}
                  className="text-violet-400 hover:text-violet-300 font-medium text-sm"
                >
                  Forgot your PIN?
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
