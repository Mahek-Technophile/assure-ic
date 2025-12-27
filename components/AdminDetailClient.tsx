"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../app/providers";

export default function AdminDetailClient({ requestId }: { requestId: string }) {
  const [decision, setDecision] = useState<"" | "approve" | "reject">("");
  const [request, setRequest] = useState<any>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchDetail = async () => {
      const functionsBase = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
      try {
        const resp = await fetch(`${functionsBase}/api/admin/kyc/${requestId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) throw new Error("Failed to fetch request");
        const json = await resp.json();
        setRequest(json.request ? { ...json.request, extraction: json.extraction } : json);
      } catch (e) {
        console.warn(e);
      }
    };
    if (token) fetchDetail();
  }, [token, requestId]);

  if (!request) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-zinc-200">
          <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Assure · Admin</h1>
            <Link href="/admin" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">Back to Dashboard</Link>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-12">Loading...</div>
      </div>
    );
  }
      {/* Header */}
      <div className="border-b border-zinc-200">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Assure · Admin</h1>
          <Link href="/admin" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Request Header */}
        <div className="mb-8 pb-8 border-b border-zinc-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold">{request.name}</h2>
              <p className="text-zinc-600 mt-1">{request.id}</p>
            </div>
            <div
              className={`text-right px-4 py-2 rounded-lg font-semibold ${
                request.riskLevel === "high"
                  ? "bg-red-100 text-red-700"
                  : request.riskLevel === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {request.riskLevel.toUpperCase()} RISK
            </div>
          </div>
          <p className="text-zinc-600">{request.email}</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Request Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <section>
              <h3 className="text-lg font-bold mb-4">Personal Information</h3>
              <div className="border border-zinc-200 rounded-lg p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-zinc-600">First Name</p>
                    <p className="font-medium">{request.personalInfo.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600">Last Name</p>
                    <p className="font-medium">{request.personalInfo.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600">Date of Birth</p>
                    <p className="font-medium">{request.personalInfo.dob}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600">Country</p>
                    <p className="font-medium">{request.personalInfo.country}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Verification Scores */}
            <section>
              <h3 className="text-lg font-bold mb-4">Verification Scores</h3>
              <div className="space-y-4">
                <div className="border border-zinc-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Document Verification</span>
                    <span className="text-2xl font-bold text-green-600">{request.documentScore}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: `${request.documentScore}%` }}></div>
                  </div>
                  <p className="text-xs text-zinc-600 mt-2">Government ID successfully verified using Azure AI</p>
                </div>

                <div className="border border-zinc-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Biometric Verification</span>
                    <span className="text-2xl font-bold text-orange-600">{request.biometricScore}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full" style={{ width: `${request.biometricScore}%` }}></div>
                  </div>
                  <p className="text-xs text-zinc-600 mt-2">Face capture matched with government ID photo</p>
                </div>
              </div>
            </section>

            {/* Risk Signals */}
            <section>
              <h3 className="text-lg font-bold mb-4">Risk Signals & Explanations</h3>
              <div className="space-y-3">
                {request.riskSignals.map((signal, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      signal.severity === "high" ? "bg-red-50 border-red-200" :
                      signal.severity === "medium" ? "bg-yellow-50 border-yellow-200" :
                      "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          signal.severity === "high" ? "bg-red-500" :
                          signal.severity === "medium" ? "bg-yellow-500" :
                          "bg-blue-500"
                        }`}
                      >
                        !
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{signal.signal}</h4>
                        <p className="text-sm mt-1 text-zinc-700">{signal.explanation}</p>
                        <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded ${
                          signal.severity === "high" ? "bg-red-100 text-red-700" :
                          signal.severity === "medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {signal.severity.toUpperCase()} SEVERITY
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Decision Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 border border-zinc-200 rounded-lg p-6">
              <h3 className="font-bold mb-6">Compliance Decision</h3>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setDecision("approve")}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition border-2 ${
                    decision === "approve"
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "border-green-200 text-green-700 hover:bg-green-50"
                  }`}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => setDecision("reject")}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition border-2 ${
                    decision === "reject"
                      ? "bg-red-50 border-red-500 text-red-700"
                      : "border-red-200 text-red-700 hover:bg-red-50"
                  }`}
                >
                  ✗ Reject
                </button>
              </div>

              {decision && (
                <div className="mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                  <label className="block text-sm font-medium mb-2">
                    {decision === "approve" ? "Approval" : "Rejection"} Notes
                  </label>
                  <textarea
                    placeholder="Add optional notes for the user..."
                    className="w-full px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    rows={4}
                  />
                </div>
              )}

              <button
                disabled={!decision}
                className="w-full px-4 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 transition"
              >
                Submit Decision
              </button>

              <button
                onClick={async () => {
                  if (!decision) return;
                  const functionsBase = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
                  const body: any = { decision: decision === "approve" ? "APPROVE" : "REJECT", note: null };
                  try {
                    const resp = await fetch(`${functionsBase}/api/admin/kyc/${request.id}/decision`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                      body: JSON.stringify(body)
                    });
                    if (!resp.ok) throw new Error("Decision failed");
                    alert("Decision submitted");
                  } catch (e) {
                    console.error(e);
                    alert("Failed to submit decision");
                  }
                }}
                className="w-full mt-3 px-4 py-2 border border-zinc-300 text-zinc-900 rounded-lg font-medium hover:bg-zinc-50 transition"
              >
                Submit Decision Now
              </button>

              <button className="w-full mt-3 px-4 py-2 border border-zinc-300 text-zinc-900 rounded-lg font-medium hover:bg-zinc-50 transition">
                Request More Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
