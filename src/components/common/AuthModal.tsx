import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthModal } from './GoogleAuthModal';
import { X, Lock, Mail, User as UserIcon, Eye, EyeOff, Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    signup,
  } = useAuth();

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

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

  if (!isAuthModalOpen) return null;

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
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden relative">
          
          {/* Top Bar with Brand and Close */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="font-nike text-2xl font-black tracking-tight text-black">
                RAYLUXX
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-full">
                MEMBERSHIP
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
          <div className="flex border-b border-neutral-200 bg-neutral-50/80">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                openAuthModal('signin');
              }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                authModalMode === 'signin'
                  ? 'border-black text-black bg-white'
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
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                authModalMode === 'signup'
                  ? 'border-black text-black bg-white'
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
              <h2 className="font-nike text-2xl sm:text-3xl font-black uppercase text-black leading-tight">
                {authModalMode === 'signin'
                  ? 'WELCOME BACK TO THE ARCHIVE'
                  : authModalMode === 'signup'
                  ? 'BECOME A RAYLUXX MEMBER'
                  : 'RESET YOUR PASSWORD'}
              </h2>
              <p className="text-xs text-neutral-500">
                {authModalMode === 'signin'
                  ? 'Sign in to access saved favorites, order tracking, and exclusive drops.'
                  : authModalMode === 'signup'
                  ? 'Enjoy complimentary shipping over $150, early access to GORE-TEX editions, and member perks.'
                  : 'Enter your email address and we will dispatch recovery instructions.'}
              </p>
            </div>

            {/* "CONTINUE WITH GOOGLE" BUTTON */}
            {authModalMode !== 'forgot' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-white hover:bg-neutral-50 border border-neutral-300 hover:border-neutral-400 rounded-full font-sans text-xs font-bold text-neutral-800 uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.99]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </button>

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
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-700 animate-fadeIn">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-700 animate-fadeIn">
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
                      className="w-full border border-neutral-300 px-3.5 py-3 pl-10 text-sm focus:outline-none focus:border-black rounded-lg transition-colors"
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
                      className="text-[11px] text-neutral-500 hover:text-black underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-neutral-300 px-3.5 py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-black rounded-lg transition-colors"
                    />
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Quick Demo Fill Pills */}
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400 font-semibold uppercase">Demo:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('marcus')}
                    className="text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium px-2 py-0.5 rounded-full transition-colors flex items-center gap-1"
                  >
                    <Sparkles size={11} />
                    <span>Marcus (Member)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('elena')}
                    className="text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium px-2 py-0.5 rounded-full transition-colors"
                  >
                    <span>Elena</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-50"
                >
                  <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                  {!isLoading && <ArrowRight size={14} />}
                </button>
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
                      placeholder="e.g. Liam Cross"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-neutral-300 px-3.5 py-3 pl-10 text-sm focus:outline-none focus:border-black rounded-lg transition-colors"
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
                      className="w-full border border-neutral-300 px-3.5 py-3 pl-10 text-sm focus:outline-none focus:border-black rounded-lg transition-colors"
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-neutral-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-neutral-300 px-3.5 py-3 text-sm focus:outline-none focus:border-black rounded-lg transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-neutral-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-neutral-300 px-3.5 py-3 text-sm focus:outline-none focus:border-black rounded-lg transition-colors"
                    />
                  </div>
                </div>

                {/* Member Benefits Checklist */}
                <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5 text-[11px] text-neutral-600">
                  <div className="flex items-center gap-2 font-bold text-neutral-800 uppercase tracking-wide">
                    <ShieldCheck size={14} className="text-black" />
                    <span>Included Member Privileges:</span>
                  </div>
                  <p className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-600" />
                    <span>Complimentary express delivery on orders $150+</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-600" />
                    <span>Priority 60-min notification before limited drops</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-600" />
                    <span>Real-time courier dispatch waybill tracking</span>
                  </p>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-black rounded"
                  />
                  <span className="text-[11px] text-neutral-600 leading-snug">
                    I agree to RAYLUXX's <strong className="text-black">Privacy Policy</strong> and <strong className="text-black">Terms of Sale</strong>.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-50"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Create Account & Join Us'}</span>
                  {!isLoading && <ArrowRight size={14} />}
                </button>
              </form>
            )}

            {/* 3. FORGOT PASSWORD FORM */}
            {authModalMode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-semibold uppercase text-neutral-700 mb-1">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-neutral-300 px-3.5 py-3 pl-10 text-sm focus:outline-none focus:border-black rounded-lg"
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-all shadow-lg"
                >
                  Send Reset Link
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => openAuthModal('signin')}
                    className="text-xs font-semibold text-neutral-500 hover:text-black transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Footer note */}
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 text-center text-[11px] text-neutral-500">
            {authModalMode === 'signin' ? (
              <p>
                Not a member yet?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="font-bold text-black underline hover:opacity-75"
                >
                  Join Us
                </button>
              </p>
            ) : authModalMode === 'signup' ? (
              <p>
                Already have a Rayluxx account?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="font-bold text-black underline hover:opacity-75"
                >
                  Sign In
                </button>
              </p>
            ) : null}
          </div>

        </div>
      </div>

      {/* Google Interactive Simulation Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />
    </>
  );
};
