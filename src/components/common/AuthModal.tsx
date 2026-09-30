import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Eye, EyeOff, Check, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

interface QuickGoogleAccount {
  name: string;
  email: string;
  avatar: string;
}

const QUICK_GOOGLE_ACCOUNTS: QuickGoogleAccount[] = [
  {
    name: 'Alex Morgan',
    email: 'alex.morgan.tech@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@design.de',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Kenji Takahashi',
    email: 'kenji.t@tokyo-lab.jp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    signup,
    loginWithGoogle,
  } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  if (!isAuthModalOpen) return null;

  // Handle direct Google Sign In
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        // Reveal quick Google chooser if popup was closed or domain not whitelisted
        setShowGoogleChooser(true);
      }
    } catch {
      setShowGoogleChooser(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (account: QuickGoogleAccount) => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle(account);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    setGoogleLoading(true);
    try {
      const parsedName = customGoogleEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      await loginWithGoogle({
        name: parsedName || 'Google User',
        email: customGoogleEmail.trim().toLowerCase(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setErrorMsg(result.error || 'Unable to sign in. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please accept the Terms of Service to join.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signup(name, email, password);
      if (!result.success) {
        setErrorMsg(result.error || 'Account creation failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your registered email.');
      return;
    }
    setSuccessMsg(`A password reset link has been dispatched to ${email}. Check your inbox.`);
    setTimeout(() => {
      setSuccessMsg('');
      openAuthModal('signin');
    }, 3500);
  };

  const handleQuickFill = (role: 'marcus' | 'elena') => {
    if (role === 'marcus') {
      setEmail('marcus.vance@studio.com');
      setPassword('password123');
    } else {
      setEmail('elena.rostova@design.de');
      setPassword('password123');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden relative">
        
        {/* Top Header Bar */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="font-nike text-2xl font-black tracking-tight text-black">
              RAYLUXX
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-full">
              MEMBER ACCESS
            </span>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50/90 text-xs">
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              openAuthModal('signin');
            }}
            className={`flex-1 py-3 font-bold uppercase tracking-wider transition-all border-b-2 ${
              authModalMode === 'signin'
                ? 'border-black text-black bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              openAuthModal('signup');
            }}
            className={`flex-1 py-3 font-bold uppercase tracking-wider transition-all border-b-2 ${
              authModalMode === 'signup'
                ? 'border-black text-black bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            Join Us (Sign Up)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[85vh] overflow-y-auto">
          
          {/* Header Text */}
          <div className="space-y-1">
            <h2 className="font-nike text-2xl sm:text-3xl font-black uppercase text-black leading-tight tracking-tight">
              {authModalMode === 'signin'
                ? 'YOUR ACCOUNT FOR EVERYTHING RAYLUXX'
                : authModalMode === 'signup'
                ? 'BECOME A RAYLUXX MEMBER'
                : 'RESET YOUR PASSWORD'}
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans">
              {authModalMode === 'signin'
                ? 'Sign in to access your bag across devices, order tracking, and exclusive drops.'
                : authModalMode === 'signup'
                ? 'Join to receive priority allocation notices, complimentary shipping, and member perks.'
                : 'Enter your email address and we will dispatch recovery instructions.'}
            </p>
          </div>

          {/* "CONTINUE WITH GOOGLE" BUTTON */}
          {authModalMode !== 'forgot' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-50 border border-neutral-300 hover:border-neutral-400 rounded-full font-sans text-xs font-bold text-neutral-800 uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {googleLoading ? (
                  <Loader2 size={18} className="animate-spin text-neutral-600" />
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {/* In-Modal Quick Google Profile Chooser */}
              {showGoogleChooser && (
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                      Choose Google Account
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGoogleChooser(false)}
                      className="text-[10px] text-neutral-400 hover:text-black"
                    >
                      Hide
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {QUICK_GOOGLE_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleSelectGoogleAccount(acc)}
                        className="w-full p-2 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-between text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={acc.avatar} alt={acc.name} className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <p className="text-xs font-bold text-black leading-tight">{acc.name}</p>
                            <p className="text-[10px] text-neutral-500">{acc.email}</p>
                          </div>
                        </div>
                        <Check size={14} className="text-neutral-400" />
                      </button>
                    ))}
                  </div>

                  {/* Or Custom Google Email */}
                  <form onSubmit={handleCustomGoogleSubmit} className="pt-1 flex gap-1.5">
                    <input
                      type="email"
                      required
                      placeholder="Or enter your @gmail.com..."
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="flex-1 bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-black text-white rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </form>
                </div>
              )}

              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-neutral-200 w-full"></div>
                <span className="bg-white px-3 font-sans text-[11px] font-semibold text-neutral-400 uppercase tracking-wider absolute">
                  or continue with email
                </span>
              </div>
            </div>
          )}

          {/* Error & Success Feedback */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700 animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700 animate-fadeIn">
              {successMsg}
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {authModalMode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-neutral-300 px-3.5 py-3 pl-10 text-sm focus:outline-none focus:border-black rounded-xl transition-colors text-black"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold uppercase text-neutral-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-[11px] text-neutral-500 hover:text-black underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-neutral-300 px-3.5 py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-black rounded-xl transition-colors text-black"
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black accent-black"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Quick Fill Demo Helper */}
              <div className="pt-2 text-center text-[11px] text-neutral-400">
                <span>Quick Fill Demo: </span>
                <button
                  type="button"
                  onClick={() => handleQuickFill('marcus')}
                  className="font-bold text-black underline hover:text-neutral-700 ml-1 cursor-pointer"
                >
                  Marcus Vance
                </button>
                <span className="mx-1.5">•</span>
                <button
                  type="button"
                  onClick={() => handleQuickFill('elena')}
                  className="font-bold text-black underline hover:text-neutral-700 cursor-pointer"
                >
                  Elena Rostova
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {authModalMode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Hayes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-neutral-300 px-3.5 py-3 pl-10 text-sm focus:outline-none focus:border-black rounded-xl transition-colors text-black"
                  />
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-neutral-300 px-3.5 py-3 pl-10 text-sm focus:outline-none focus:border-black rounded-xl transition-colors text-black"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-neutral-300 px-3.5 py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-black rounded-xl transition-colors text-black"
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-neutral-300 px-3.5 py-3 pl-10 text-sm focus:outline-none focus:border-black rounded-xl transition-colors text-black"
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-neutral-600">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-black focus:ring-black accent-black"
                  />
                  <span className="text-[11px] leading-tight">
                    By creating an account, you agree to RAYLUXX's{' '}
                    <span className="underline font-semibold text-black">Privacy Policy</span> and{' '}
                    <span className="underline font-semibold text-black">Terms of Sale</span>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>JOIN US</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {authModalMode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-neutral-300 px-3.5 py-3 pl-10 text-sm focus:outline-none focus:border-black rounded-xl transition-colors text-black"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer"
              >
                <span>SEND RESET LINK</span>
                <ArrowRight size={16} />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="text-xs text-neutral-600 hover:text-black font-semibold underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Bottom Footer Info */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>256-Bit Encrypted Member Security</span>
          </div>
          <div className="flex gap-3">
            <span className="hover:underline cursor-pointer">Help</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
        </div>

      </div>
    </div>
  );
};
