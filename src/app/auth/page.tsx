'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import Logo from '@/components/Logo';
import {
  Mail,
  Lock,
  Phone,
  User,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
  ArrowLeft,
  KeyRound,
  X,
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('en');
  const [isRegister, setIsRegister] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useMobile, setUseMobile] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Flow
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(30);

  // Forgot Password Modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Status/Error states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync language preferences
  useEffect(() => {
    const savedLang = localStorage.getItem('nyaya_lang') || 'en';
    setSelectedLang(savedLang);
  }, []);

  // OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpScreen && otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showOtpScreen, otpCountdown]);

  // Prefill remembered user details
  useEffect(() => {
    const remUser = localStorage.getItem('nyaya_remembered_user');
    const remType = localStorage.getItem('nyaya_remembered_type');
    if (remUser && remType) {
      if (remType === 'mobile') {
        setMobile(remUser);
        setUseMobile(true);
      } else {
        setEmail(remUser);
        setUseMobile(false);
      }
    }
  }, []);

  // Reset errors when toggling auth type or tab
  const handleTabToggle = (registerTab: boolean) => {
    setIsRegister(registerTab);
    setErrorMessage('');
    setSuccessMessage('');
    setErrors({});
    setPassword('');
  };

  const handleTypeToggle = (byMobile: boolean) => {
    setUseMobile(byMobile);
    setErrorMessage('');
    setSuccessMessage('');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (isRegister && !name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (useMobile) {
      const cleanMobile = mobile.replace(/\D/g, '');
      if (!cleanMobile) {
        newErrors.mobile = 'Mobile number is required.';
      } else if (cleanMobile.length !== 10) {
        newErrors.mobile = 'Indian mobile number must be exactly 10 digits.';
      } else if (!/^[6-9]/.test(cleanMobile)) {
        newErrors.mobile = 'Mobile number must start with a valid carrier code (6-9).';
      }
    } else {
      if (!email.trim()) {
        newErrors.email = 'Email address is required.';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveSession = (data: any) => {
    const user = data.user || data;
    const token = data.access_token || data.token;
    
    localStorage.setItem('nyaya_user', JSON.stringify(user));
    if (token) {
      localStorage.setItem('nyaya_token', token);
      document.cookie = `nyaya_token=${token}; path=/; max-age=604800; samesite=lax`;
    }
    
    if (user.language_preference) {
      localStorage.setItem('nyaya_lang', user.language_preference);
      window.dispatchEvent(new Event('nyaya_lang_changed'));
    }
    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = searchParams.get('redirect') || '/';
    router.push(redirectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setLoading(true);
    const cleanEmail = email.trim();
    const cleanMobile = mobile.replace(/\D/g, '');
    const url = isRegister ? '/api/v1/user/register' : '/api/v1/user/login';
    const payload = isRegister
      ? {
          name: name.trim(),
          email: useMobile ? null : cleanEmail,
          mobile: useMobile ? cleanMobile : null,
          password,
        }
      : {
          username: useMobile ? cleanMobile : cleanEmail,
          password,
        };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Authentication failed');
      }
      
      if (rememberMe) {
        localStorage.setItem('nyaya_remembered_user', useMobile ? cleanMobile : cleanEmail);
        localStorage.setItem('nyaya_remembered_type', useMobile ? 'mobile' : 'email');
      } else {
        localStorage.removeItem('nyaya_remembered_user');
        localStorage.removeItem('nyaya_remembered_type');
      }

      if (isRegister && useMobile) {
        // Simulated OTP flow for mobile registrations
        setSuccessMessage('Simulated Verification OTP code "123456" sent to your mobile.');
        setShowOtpScreen(true);
        setOtpCountdown(30);
      } else {
        saveSession(data.data || data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setLoading(true);

    try {
      if (otpCode !== '123456') {
        throw new Error('OTP validation failed. Enter code 123456.');
      }
      
      // With FastAPI, the token should be in localStorage already if they had registered without mobile verification.
      // But for OTP simulation, let's just create a dummy session or attempt a mock fetch.
      const savedUserStr = localStorage.getItem('nyaya_remembered_user');
      const dummyUser = {
         id: "usr-" + Date.now(),
         name: name || "Verified User",
         mobile: mobile,
      };
      saveSession({ user: dummyUser, access_token: "dummy-mobile-token-for-dev" });
    } catch (err: any) {
      setOtpError(err.message || 'OTP validation failed. Enter code 123456.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setOtpError('');
    try {
      // Simulated resend
      await new Promise(r => setTimeout(r, 500));
      setOtpCountdown(30);
      setOtpError('Simulated verification code resent! Enter "123456".');
    } catch (e) {
      setOtpError('Failed to resend OTP.');
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess(false);

    if (!forgotEmail.trim()) {
      setForgotError('Please enter a username, email, or mobile.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setForgotSent(true);
      setLoading(false);
      setForgotError('Simulated recovery OTP code "123456" sent to your inbox.');
    }, 800);
  };

  const handleResetPasswordVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (forgotCode !== '123456') {
      setForgotError('Invalid verification code. Enter code 123456.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setForgotSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setForgotOpen(false);
        setForgotSent(false);
        setForgotSuccess(false);
        setForgotEmail('');
        setForgotCode('');
        setForgotNewPassword('');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background gradients */}
      <div className="absolute w-[600px] h-[600px] rounded-full opacity-5 blur-[160px] bg-gradient-to-tr from-[#138808] via-transparent to-[#FF9933] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[120px] bg-blue-500 bottom-0 right-0 pointer-events-none" />

      <div className="w-full max-w-md premium-card p-8 relative z-10 space-y-6">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <Logo size={48} animated={false} />
          <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)] mt-4">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {isRegister
              ? 'Join the multilingual Indian legal operating system'
              : 'Log in to access legal tools, cases, and notices'}
          </p>
        </div>

        {/* Tab Selector */}
        {!showOtpScreen && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[var(--card)] border border-[var(--border)] rounded-2xl">
            <button
              onClick={() => handleTabToggle(false)}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${ !isRegister ? 'bg-[#0F172A] dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-[var(--text-muted)] hover:text-slate-950 dark:hover:text-white' }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabToggle(true)}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${ isRegister ? 'bg-[#0F172A] dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-[var(--text-muted)] hover:text-slate-950 dark:hover:text-white' }`}
            >
              Register
            </button>
          </div>
        )}

        {/* OTP Verification Panel */}
        {showOtpScreen ? (
          <form onSubmit={handleOtpVerify} className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-subtle)]0/10 border border-indigo-500/25 flex items-center justify-center mx-auto text-indigo-500 dark:text-[var(--primary)]">
                <KeyRound size={22} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Verify Your Identity</h3>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
                A verification code has been dispatched to your mobile. Enter the simulated code <strong>123456</strong> below.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-[var(--text-muted)] uppercase tracking-wider">Verification OTP Code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit verification code (e.g. 123456)"
                className="w-full h-11 px-4 bg-slate-50 dark:bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] rounded-xl text-center text-sm font-bold tracking-widest focus:outline-none text-[var(--text-primary)]"
              />
              {otpError && <p className="text-[10px] text-[var(--danger)] font-semibold">{otpError}</p>}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 dark:text-[var(--text-muted)]">Resend code available in:</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpCountdown > 0}
                className={`font-bold hover:underline ${ otpCountdown > 0 ? 'text-slate-350 dark:text-slate-600 cursor-not-allowed' : 'text-[#FF9933]' }`}
              >
                {otpCountdown > 0 ? `${otpCountdown}s` : 'Resend Code'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={() => setShowOtpScreen(false)}
              className="w-full text-center text-xs text-[var(--text-muted)] hover:text-slate-950 dark:hover:text-white font-bold flex items-center justify-center gap-1 pt-2"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </form>
        ) : (
          /* Normal Login/Register Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error & Success banner notifications */}
            {errorMessage && (
              <div className="p-3 bg-[var(--danger-subtle)] border border-[var(--danger-subtle)] text-red-650 dark:text-[var(--danger)] rounded-xl text-xs flex items-start gap-2.5 font-semibold">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 text-emerald-650 dark:text-[var(--success)] rounded-xl text-xs flex items-start gap-2.5 font-semibold">
                <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Input field for full name (Register only) */}
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] rounded-xl text-xs font-semibold focus:outline-none text-[var(--text-primary)]"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)] w-4 h-4" />
                </div>
                {errors.name && <p className="text-[10px] text-[var(--danger)] font-semibold">{errors.name}</p>}
              </div>
            )}

            {/* Selector: Mobile vs. Email */}
            <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-muted)] border-b border-[var(--border)] pb-2 select-none">
              <span className="text-[10px] text-slate-400 dark:text-[var(--text-muted)] uppercase tracking-wider">Auth Method:</span>
              <button
                type="button"
                onClick={() => handleTypeToggle(false)}
                className={`transition-colors pb-1.5 ${!useMobile ? 'text-[var(--text-primary)] border-b-2 border-indigo-600 dark:border-indigo-500' : 'text-slate-400 dark:text-[var(--text-muted)] hover:text-slate-950 dark:hover:text-white'}`}
              >
                Email ID
              </button>
              <button
                type="button"
                onClick={() => handleTypeToggle(true)}
                className={`transition-colors pb-1.5 ${useMobile ? 'text-[var(--text-primary)] border-b-2 border-indigo-600 dark:border-indigo-500' : 'text-slate-400 dark:text-[var(--text-muted)] hover:text-slate-950 dark:hover:text-white'}`}
              >
                Mobile Number
              </button>
            </div>

            {/* Auth Credential Field */}
            {useMobile ? (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Indian Mobile Number</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit number (e.g. 9876543210)"
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] rounded-xl text-xs font-semibold focus:outline-none text-[var(--text-primary)]"
                  />
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)] w-4 h-4" />
                </div>
                {errors.mobile && <p className="text-[10px] text-[var(--danger)] font-semibold">{errors.mobile}</p>}
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email ID"
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] rounded-xl text-xs font-semibold focus:outline-none text-[var(--text-primary)]"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)] w-4 h-4" />
                </div>
                {errors.email && <p className="text-[10px] text-[var(--danger)] font-semibold">{errors.email}</p>}
              </div>
            )}

            {/* Password input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-[10px] text-[var(--primary)] hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-11 pl-10 pr-10 bg-slate-50 dark:bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] rounded-xl text-xs font-semibold focus:outline-none text-[var(--text-primary)]"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)] w-4 h-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)] hover:text-slate-700 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-[var(--danger)] font-semibold">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 select-none py-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[var(--border)] bg-[var(--card)] text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-[var(--text-muted)] cursor-pointer font-semibold">
                Remember details on this device
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/10 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Forgot Password Modal Dial */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="premium-card p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Reset Account Password</h3>
              <button
                onClick={() => setForgotOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--card-elevated)] text-slate-450 dark:text-[var(--text-muted)] hover:text-slate-950 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Password Reset Successful</h4>
                <p className="text-xs text-slate-550 dark:text-[var(--text-muted)]">Your account credentials have been successfully updated.</p>
              </div>
            ) : forgotSent ? (
              <form onSubmit={handleResetPasswordVerify} className="space-y-4">
                <div className="p-3 bg-[var(--primary-subtle)]0/10 border border-indigo-500/20 text-[var(--primary)] dark:text-[var(--primary)] rounded-xl text-xs leading-relaxed font-semibold">
                  📧 Simulated recovery code sent! Check your notifications and enter code <strong>123456</strong> below.
                </div>

                {forgotError && (
                  <div className="p-3 bg-[var(--danger-subtle)] border border-[var(--danger-subtle)] text-red-650 dark:text-[var(--danger)] rounded-xl text-xs font-semibold">
                    {forgotError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Simulated OTP Code</label>
                  <input
                    type="text"
                    required
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.trim())}
                    placeholder="Enter code 123456"
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs focus:outline-none text-[var(--text-primary)] font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">New Password</label>
                  <input
                    type="password"
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs focus:outline-none text-[var(--text-primary)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded-xl text-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Reset Password'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Provide your email address or mobile number. We will dispatch a recovery OTP to authorize your reset request.
                </p>

                {forgotError && (
                  <div className="p-3 bg-[var(--danger-subtle)] border border-[var(--danger-subtle)] text-red-650 dark:text-[var(--danger)] rounded-xl text-xs font-semibold">
                    {forgotError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Username / Email / Mobile</label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter email or mobile"
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs focus:outline-none font-semibold text-[var(--text-primary)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded-xl text-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Recovery OTP'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
