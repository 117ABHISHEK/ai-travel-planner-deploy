'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/utils/api';

const passwordStrength = (pwd: string): { label: string; color: string; width: string } => {
  if (pwd.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
  if (pwd.length < 10) return { label: 'Fair', color: 'bg-ochre', width: 'w-2/4' };
  if (pwd.length < 14 || !/\d/.test(pwd)) return { label: 'Good', color: 'bg-sage', width: 'w-3/4' };
  return { label: 'Strong', color: 'bg-terracotta', width: 'w-full' };
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  const { login } = useAuth();
  const router = useRouter();

  const strength = passwordStrength(password);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Must be at least 8 characters';
    if (!confirmPassword) newErrors.confirm = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirm = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authApi.register(email, password);
      login(res.data.token, res.data.user);
      toast.success('Journal created! Welcome aboard 🎉');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-parchment text-journal-dark">
      <div className="orb w-96 h-96 top-0 right-0" />
      <div className="orb w-80 h-80 bottom-0 left-0" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-journal-sm transition-transform group-hover:scale-105">
              <Compass className="w-5.5 h-5.5 text-white animate-spin-compass" />
            </div>
            <span className="text-2xl font-serif font-black tracking-tight text-journal-dark">
              wander<span className="text-terracotta">logue</span>
            </span>
          </Link>
          <h1 className="text-3xl font-serif font-black text-journal-dark mb-2">Create your journal</h1>
          <p className="text-journal-dark/60 font-medium">Start planning custom travel diaries today</p>
        </div>

        {/* Card */}
        <div className="card p-8 border-[#DECFC0] shadow-journal relative">
          <div className="washi-tape" style={{ top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(2deg)', width: '80px' }} />

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#DECFC0]" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  className={`input pl-11 ${errors.email ? 'border-red-400 focus:ring-red-200' : ''}`}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#DECFC0]" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  className={`input pl-11 pr-11 ${errors.password ? 'border-red-400 focus:ring-red-200' : ''}`}
                  placeholder="Min. 8 characters"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-journal-dark transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="h-1 rounded-full bg-journal-dark/10 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-journal-dark/50 mt-1 font-semibold">{strength.label} password</p>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="label">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#DECFC0]" />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })); }}
                  className={`input pl-11 pr-11 ${errors.confirm ? 'border-red-400 focus:ring-red-200' : ''}`}
                  placeholder="Re-enter password"
                  disabled={isLoading}
                />
                {confirmPassword && confirmPassword === password && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                )}
              </div>
              {errors.confirm && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.confirm}</p>}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="btn-adventure w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Journal…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm font-semibold text-journal-dark/60">
            Already have an account?{' '}
            <Link href="/login" className="text-terracotta hover:text-terracotta-hover transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-journal-dark/40 mt-8 flex items-center justify-center gap-1 font-semibold">
          wanderlogue — crafted for travel logs <Heart className="w-3 h-3 text-red-500 fill-red-500" />
        </p>
      </div>
    </div>
  );
}
