"use client";

import Link from "next/link";

export default function StatusPage() {
  const timeline = [
    {
      step: "Application Submitted",
      date: "Dec 20, 2024",
      status: "completed",
      description: "Your KYC application has been received"
    },
    {
      step: "Document Review",
      date: "Dec 21, 2024",
      status: "completed",
      description: "Government ID documents verified using Azure AI"
    },
    {
      step: "Biometric Verification",
      date: "Dec 22, 2024",
      status: "completed",
      description: "Face capture matched with government ID"
    },
    {
      step: "Risk Assessment",
      date: "In Progress",
      status: "in_progress",
      description: "AI analyzing risk signals and flagging compliance concerns"
    },
    {
      step: "Manual Review",
      date: "Pending",
      status: "pending",
      description: "Compliance officer reviewing case for final approval"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-zinc-200">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            Assure
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Verification Progress</h1>
          <p className="text-zinc-600">Track your KYC verification status in real-time</p>
        </div>

        {/* Current Status */}
        <div className="mb-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-blue-900">Currently: Risk Assessment</h3>
          </div>
          <p className="text-sm text-blue-800">Your application is being reviewed by our AI systems. You'll be notified when manual review begins.</p>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {timeline.map((item, idx) => (
            <div key={idx} className="flex gap-6">
              {/* Timeline Marker */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  item.status === "completed" ? "bg-green-500" :
                  item.status === "in_progress" ? "bg-blue-500" :
                  "bg-zinc-300"
                }`}>
                  {item.status === "completed" ? "✓" : idx + 1}
                </div>
                {idx < timeline.length - 1 && (
                  <div className={`w-1 h-20 my-2 ${
                    item.status === "completed" ? "bg-green-500" : "bg-zinc-200"
                  }`}></div>
                )}
              </div>

              {/* Timeline Content */}
              <div className="pb-6 flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{item.step}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.status === "completed" ? "bg-green-100 text-green-700" :
                    item.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                    "bg-zinc-100 text-zinc-700"
                  }`}>
                    {item.status === "completed" ? "Done" :
                     item.status === "in_progress" ? "In Progress" :
                     "Pending"}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mb-2">{item.date}</p>
                <p className="text-sm text-zinc-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 border border-zinc-200 rounded-lg bg-zinc-50">
          <h3 className="font-semibold mb-3">What Happens Next?</h3>
          <ul className="space-y-2 text-sm text-zinc-700">
            <li>• <strong>Automatic Decision:</strong> Low-risk applications are instantly approved</li>
            <li>• <strong>Escalation:</strong> High-risk cases go to manual review by compliance officers</li>
            <li>• <strong>Transparency:</strong> You'll receive clear explanations for any decisions</li>
            <li>• <strong>Timeline:</strong> Most verifications complete within 24-48 hours</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition"
          >
            Back to Dashboard
          </Link>
          <button className="px-6 py-2 border border-zinc-300 font-medium rounded-lg hover:bg-zinc-50 transition">
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}
