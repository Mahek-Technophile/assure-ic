"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../../providers";

export default function AdminDashboard() {
  const [filter, setFilter] = useState("all");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPending = async () => {
      if (!token) return;
      setLoading(true);
      const functionsBase = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
      try {
        const resp = await fetch(`${functionsBase}/api/admin/kyc/pending`, { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) throw new Error("Failed to fetch pending requests");
        const json = await resp.json();
        setRequests(json.items || []);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, [token]);

  const filteredRequests = filter === "all" ? requests : requests.filter(r => r.status === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "PENDING_REVIEW" || r.status === "pending").length,
    approved: requests.filter(r => r.status === "APPROVED" || r.status === "approved").length,
    rejected: requests.filter(r => r.status === "REJECTED" || r.status === "rejected").length
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Assure · Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">Compliance Officer</span>
            <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">KYC Review Dashboard</h2>
          <p className="mt-2 text-zinc-600">Manage and review identity verification requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-4 mb-12">
          <div className="p-6 border border-zinc-200 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-600 uppercase">Total Requests</h3>
            <p className="mt-3 text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="p-6 border border-zinc-200 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-600 uppercase">Pending Review</h3>
            <p className="mt-3 text-3xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="p-6 border border-zinc-200 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-600 uppercase">Approved</h3>
            <p className="mt-3 text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="p-6 border border-zinc-200 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-600 uppercase">Rejected</h3>
            <p className="mt-3 text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Request ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Risk Level</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Scores</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req, idx) => (
                <tr key={idx} className="border-t border-zinc-200 hover:bg-zinc-50 transition">
                  <td className="px-6 py-4 text-sm font-medium">{req.id}</td>
                  <td className="px-6 py-4 text-sm">{req.name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      req.status === "pending" ? "bg-orange-100 text-orange-700" :
                      req.status === "approved" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      req.riskLevel === "low" ? "bg-green-100 text-green-700" :
                      req.riskLevel === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {req.riskLevel.charAt(0).toUpperCase() + req.riskLevel.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <span title="Document Score">{req.documentScore}%</span>
                      <span className="text-zinc-400">/</span>
                      <span title="Biometric Score">{req.biometricScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{req.date}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/${req.id}`}
                      className="text-sm font-medium text-zinc-900 hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
