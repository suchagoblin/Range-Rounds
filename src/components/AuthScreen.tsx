import { useState } from 'react';
import { Lock, User, UserPlus, KeyRound, ArrowLeft, Shield, HelpCircle, Clock, Mail, Target, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateUsername, validatePin } from '../utils/validation';
import { supabase } from '../lib/supabase';

type AuthMode = 'landing' | 'login' | 'signup' | 'recovery-choice' | 'recovery-pin' | 'recovery-username' | 'recovery-question' | 'recovery-newpin' | 'recovery-show-username';

export function AuthScreen() {
  const { login, signup, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<AuthMode>('landing');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Recovery state
  const [recoveryQuestion, setRecoveryQuestion] = useState<{ id: string; text: string } | null>(null);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveredUsername, setRecoveredUsername] = useState('');

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

    setIsLoading(true);
    setError('');

    try {
      const result = mode === 'signup'
        ? await signup(username, pin)
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

  const handleStartPinRecovery = async () => {
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.error || 'Please enter your username');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: hasQuestions } = await supabase
        .rpc('has_security_questions', { p_username: username });

      if (!hasQuestions) {
        setError('No security question set up for this account. Please create a new account.');
        setIsLoading(false);
        return;
      }

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

  const handleFindUsernameByEmail = async () => {
    if (!recoveryEmail.trim() || !recoveryEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use RPC function that hashes the email and looks up the hash
      const { data: username, error: findError } = await supabase.rpc('find_username_by_email', {
        input_email: recoveryEmail.trim()
      });

      if (findError) {
        setError('An error occurred. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!username) {
        setError('No account found with that email. Make sure you added a recovery email in your profile settings.');
        setIsLoading(false);
        return;
      }

      setRecoveredUsername(username);
      setMode('recovery-show-username');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Find username error:', err);
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
    setPin('');
    setError('');
    setRecoveryQuestion(null);
    setRecoveryAnswer('');
    setRecoveryEmail('');
    setRecoveredUsername('');
  };

  const goBack = () => {
    setError('');
    if (mode === 'recovery-newpin') {
      setMode('recovery-question');
      setPin('');
    } else if (mode === 'recovery-question') {
      setMode('recovery-pin');
      setRecoveryAnswer('');
    } else if (mode === 'recovery-pin' || mode === 'recovery-username') {
      setMode('recovery-choice');
      setRecoveryAnswer('');
      setRecoveryEmail('');
    } else if (mode === 'recovery-show-username') {
      setMode('login');
      setUsername(recoveredUsername);
      resetState();
      setUsername(recoveredUsername);
    } else {
      setMode('login');
      resetState();
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
    resetState();
    setSuccessMessage('');
  };

  const handleBackToLanding = () => {
    setMode('landing');
    resetState();
    setError('');
  };

  // Recovery Choice Screen
  if (mode === 'recovery-choice') {
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
              <HelpCircle className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Account Recovery</h1>
            <p className="text-slate-400">
              What do you need help with?
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setMode('recovery-pin')}
              className="w-full p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-violet-400" />
                <div>
                  <div className="font-semibold text-white">I forgot my PIN</div>
                  <div className="text-sm text-slate-400">Reset using your security question</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('recovery-username')}
              className="w-full p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-violet-400" />
                <div>
                  <div className="font-semibold text-white">I forgot my username</div>
                  <div className="text-sm text-slate-400">Look up using your recovery email</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Recovery: Enter Username for PIN reset
  if (mode === 'recovery-pin') {
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
              <KeyRound className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Reset Your PIN</h1>
            <p className="text-slate-400">
              Enter your username to continue
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
              onClick={handleStartPinRecovery}
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

  // Recovery: Find username by email
  if (mode === 'recovery-username') {
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
              <Mail className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Find Your Username</h1>
            <p className="text-slate-400">
              Enter the recovery email you added to your profile
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recovery Email
              </label>
              <input
                type="email"
                value={recoveryEmail}
                onChange={(e) => {
                  setRecoveryEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email"
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
              onClick={handleFindUsernameByEmail}
              disabled={isLoading || !recoveryEmail.trim()}
              className="w-full py-3 bg-gradient-to-br from-violet-500 to-violet-600 hover:shadow-lg text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-violet-400"
            >
              {isLoading ? 'Searching...' : 'Find My Username'}
            </button>

            <p className="text-xs text-slate-500 text-center">
              Don't have a recovery email set up? You'll need to create a new account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Recovery: Show recovered username
  if (mode === 'recovery-show-username') {
    return (
      <div className="min-h-screen bg-topo flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-emerald-500/20 rounded-full mb-4 border border-emerald-500/30">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Username Found!</h1>
            <p className="text-slate-400">
              Your username is:
            </p>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-6">
            <p className="text-2xl font-bold text-emerald-400 text-center">@{recoveredUsername}</p>
          </div>

          <button
            onClick={goBack}
            className="w-full py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:shadow-lg text-white rounded-lg font-semibold transition-all border border-emerald-400"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  // Recovery: Answer Security Question for PIN reset
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
                    className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center transition-colors ${pin[i]
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
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 w-full max-w-md relative">
        <button
          onClick={handleBackToLanding}
          className="absolute top-6 left-6 p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center mb-8 pt-4">
          <h1 className="text-3xl font-bold text-emerald-400 mb-1">Range Rounds</h1>
          <div className="inline-block p-3 bg-emerald-500/20 rounded-full my-4 border border-emerald-500/30">
            {mode === 'signup' ? (
              <UserPlus className="w-8 h-8 text-emerald-400" />
            ) : (
              <User className="w-8 h-8 text-emerald-400" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
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

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              PIN (4-6 digits)
            </label>
            <div className="flex gap-2 mb-4 justify-center">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center transition-colors ${pin[i]
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
                disabled={isLoading || pin.length < 4 || !username}
                className="h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:shadow-lg text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400"
              >
                {isLoading ? '...' : '✓'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 text-center">{error}</p>
              {mode === 'login' && error.toLowerCase().includes('invalid') && (
                <button
                  onClick={() => {
                    setMode('recovery-choice');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="w-full mt-2 text-violet-400 hover:text-violet-300 font-medium text-sm underline"
                >
                  Need help signing in?
                </button>
              )}
            </div>
          )}

          {mode === 'login' && (
            <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
              <button
                onClick={() => {
                  setMode('recovery-choice');
                  setError('');
                  setSuccessMessage('');
                }}
                disabled={isLoading}
                className="w-full text-violet-400 hover:text-violet-300 font-medium text-sm flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Forgot username or PIN?
              </button>
            </div>
          )}

          <div className="pt-4 text-center">
            <button
              onClick={toggleMode}
              disabled={isLoading}
              className="text-emerald-400 hover:text-emerald-300 font-medium text-sm"
            >
              {mode === 'signup'
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
          </div>
        </div>
      </div>
    </div>
  );
}
