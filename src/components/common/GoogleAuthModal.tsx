import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, UserPlus, Check } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DemoGoogleAccount {
  name: string;
  email: string;
  avatar: string;
}

const DEMO_GOOGLE_ACCOUNTS: DemoGoogleAccount[] = [
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

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = (account: DemoGoogleAccount) => {
    setSelectedEmail(account.email);
    setTimeout(() => {
      loginWithGoogle(account);
      onClose();
    }, 450);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const name = customName.trim() || customEmail.split('@')[0];
    loginWithGoogle({
      name,
      email: customEmail.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden font-sans">
        
        {/* Google Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Authentic Google "G" SVG */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <div>
              <h3 className="text-base font-semibold text-neutral-800 leading-tight">
                Sign in with Google
              </h3>
              <p className="text-xs text-neutral-500">to continue to RAYLUX</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Direct Firebase Google OAuth Trigger */}
          <button
            type="button"
            onClick={async () => {
              try {
                await loginWithGoogle();
                onClose();
              } catch (err) {
                console.error(err);
              }
            }}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span>Launch Official Google Sign-In Popup</span>
          </button>

          <div className="relative flex items-center justify-center py-0.5">
            <div className="border-t border-neutral-200 w-full"></div>
            <span className="bg-white px-2.5 font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-widest absolute">
              or instant demo profile
            </span>
          </div>

          <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
            {DEMO_GOOGLE_ACCOUNTS.map((acc) => {
              const isSelected = selectedEmail === acc.email;
              return (
                <button
                  key={acc.email}
                  onClick={() => handleSelectAccount(acc)}
                  className={`w-full p-3.5 flex items-center justify-between text-left transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 leading-tight">
                        {acc.name}
                      </p>
                      <p className="text-xs text-neutral-500">{acc.email}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Use Another Account Button */}
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full p-3.5 flex items-center gap-3 text-left text-neutral-700 hover:bg-neutral-50 transition-colors font-medium text-xs"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                  <UserPlus size={16} />
                </div>
                <span>Use another account...</span>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="p-4 bg-neutral-50 space-y-3">
                <span className="text-xs font-semibold text-neutral-700 block">
                  Enter Custom Google Account
                </span>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 bg-white"
                />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 bg-white"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-3 py-1.5 text-xs text-neutral-600 hover:text-black font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="text-[11px] text-neutral-400 leading-relaxed pt-1">
            To continue, Google will share your name, email address, language preference, and profile picture with RAYLUX. See RAYLUX's Privacy Policy.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
          <span>English (United States)</span>
          <div className="flex gap-3">
            <span className="hover:underline cursor-pointer">Help</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
          </div>
        </div>

      </div>
    </div>
  );
};
