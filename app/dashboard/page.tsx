"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated || !user) {
    return null;
  }

  const verificationSteps = [
    { step: "Personal Info", status: "completed" },
    { step: "Documents", status: "completed" },
    { step: "Face Capture", status: "pending" },
    { step: "Review", status: "pending" }
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Assure</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold">Welcome, {user.name}</h2>
          <p className="mt-2 text-zinc-600">Manage your identity verification and account status.</p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-6 sm:grid-cols-3 mb-12">
          {/* Verification Status Card */}
          <div className="p-6 border border-zinc-200 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-600 uppercase">Verification Status</h3>
            <p className="mt-3 text-2xl font-bold">In Progress</p>
            <p className="mt-2 text-xs text-zinc-500">2 of 4 steps complete</p>
          </div>

          {/* Identity Confidence */}
          <div className="p-6 border border-zinc-200 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-600 uppercase">Identity Confidence</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-bold">78%</p>
              <p className="text-xs text-orange-600 font-medium">Good</p>
            </div>
            <div className="mt-3 w-full bg-zinc-200 rounded-full h-2">
              <div className="bg-zinc-900 h-2 rounded-full" style={{ width: "78%" }}></div>
            </div>
          </div>

          {/* Encryption Status */}
          <div className="p-6 border border-zinc-200 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-600 uppercase">Encryption Status</h3>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-lg font-semibold">Secured</p>
            </div>
            <p className="mt-2 text-xs text-zinc-500">Azure Managed Identity</p>
          </div>
        </div>

        {/* Verification Progress */}
        <div className="mb-12">
          <h3 className="text-lg font-bold mb-6">Verification Progress</h3>
          <div className="space-y-3">
            {verificationSteps.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    item.status === "completed" ? "bg-green-500" :
                    item.status === "in_progress" ? "bg-blue-500" :
                    "bg-zinc-300"
                  }`}>
                    {item.status === "completed" ? "✓" : idx + 1}
                  </div>
                  <span className="font-medium">{item.step}</span>
                </div>
                <span className="text-xs font-medium text-zinc-500 uppercase capitalize">
                  {item.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/kyc"
            className="px-6 py-3 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 text-center transition"
          >
            Continue KYC Verification
          </Link>
          <Link
            href="/status"
            className="px-6 py-3 border border-zinc-300 font-medium rounded-lg hover:bg-zinc-50 text-center transition"
          >
            View Detailed Progress
          </Link>
        </div>

        {/* Admin Link */}
        <div className="mt-12 pt-12 border-t border-zinc-200">
          <p className="text-sm text-zinc-600 mb-4">For compliance officers:</p>
          <Link
            href="/admin"
            className="px-6 py-3 border border-zinc-300 font-medium rounded-lg hover:bg-zinc-50 inline-block transition"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
