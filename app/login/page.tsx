"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Legacy password flow kept for compatibility but we now use OTP.
    setError("");
    if (!otpSent) {
      setError("Please request an OTP first");
      setIsLoading(false);
      return;
    }

    // verify OTP stored in sessionStorage (mock)
    try {
      const key = `mock_otp_${email}`;
      const expected = sessionStorage.getItem(key);
      if (!expected) throw new Error("No OTP found for this email. Please request a new OTP.");
      if (expected !== otp) throw new Error("Invalid OTP");

      // OTP verified — perform login (mocked in provider)
      await login(email, "otp");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email to receive an OTP");
      return;
    }

    // generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `mock_otp_${email}`;
    sessionStorage.setItem(key, code);
    setGeneratedOtp(code);
    setOtpSent(true);
    // In a real integration we'd call the backend to send the OTP via SMS/email.
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-zinc-200 py-4">
        <div className="mx-auto max-w-md px-6">
          <Link href="/" className="text-xl font-semibold">
            Assure
          </Link>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center px-6 py-12 sm:py-20">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-zinc-600 text-sm">Secure, encrypted access to your account.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-900">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                required
              />
            </div>

            {!otpSent && (
              <div>
                <p className="text-sm text-zinc-600 mb-2">We'll send a one-time code to your email for verification.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={handleSendOtp} className="px-4 py-2 bg-zinc-900 text-white rounded-lg">Send OTP</button>
                </div>
              </div>
            )}

            {otpSent && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-zinc-900">Enter OTP</label>
                <input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" className="mt-2 w-full px-4 py-2 border border-zinc-300 rounded-lg" />
                <div className="mt-3 flex gap-2">
                  <button type="submit" disabled={isLoading} className="px-4 py-2 bg-zinc-900 text-white rounded-lg">{isLoading ? 'Verifying...' : 'Verify & Login'}</button>
                  <button type="button" onClick={handleSendOtp} className="px-4 py-2 border rounded-lg">Resend OTP</button>
                </div>
                {generatedOtp && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded">
                    Test OTP (visible only in testing): {generatedOtp}
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-zinc-600">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-zinc-900 hover:underline">
              Sign up
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-medium text-blue-900 mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-800">Email: demo@example.com</p>
            <p className="text-xs text-blue-800">Password: any password</p>
          </div>
        </div>
      </div>
    </div>
  );
}
