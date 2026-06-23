'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const router = useRouter();

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      login(res.data.token, res.data.user);
      toast.success('Welcome back to your travel logs!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-parchment text-journal-dark">
      <div className="orb w-96 h-96 top-0 left-0" />
      <div className="orb w-80 h-80 bottom-0 right-0" />

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
          <h1 className="text-3xl font-serif font-black text-journal-dark mb-2">Welcome back</h1>
          <p className="text-journal-dark/60 font-medium">Open your personal travel journal</p>
        </div>

        {/* Card */}
        <div className="card p-8 border-[#DECFC0] shadow-journal relative">
          <div className="washi-tape" style={{ top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(-2deg)', width: '80px' }} />
          
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#DECFC0]" />
                <input
                  id="email"
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
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#DECFC0]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  className={`input pl-11 pr-11 ${errors.password ? 'border-red-400 focus:ring-red-200' : ''}`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-journal-dark transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="btn-adventure w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opening Journal…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm font-semibold text-journal-dark/60">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-terracotta hover:text-terracotta-hover transition-colors">
              Create one free
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
