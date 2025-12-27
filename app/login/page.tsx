"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // TODO: Replace with actual Azure AD authentication
    // Simulating login delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Extract name from email for demo
    const name = email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
    
    // Call auth context
    login(email, name);
    
    // Redirect to dashboard
    router.push("/dashboard");
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-zinc-900"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-zinc-600">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-4 py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
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
