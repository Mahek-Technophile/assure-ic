import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Navigation */}
      <nav className="border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Assure</h1>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm text-zinc-600 hover:text-zinc-900">
              Login
            </Link>
            <Link href="/signup" className="text-sm font-medium text-zinc-900 hover:text-zinc-700">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-5xl font-bold tracking-tight">
          Enterprise KYC Built on Trust
        </h2>
        <p className="mt-6 text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          AI-powered identity verification with zero-secret security. Azure managed identity ensures your data stays safe. Human compliance officers always have the final say.
        </p>

        <div className="mt-12 flex justify-center gap-4">
          <Link
            href="/signup"
            className="px-8 py-3 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition"
          >
            Start Verification
          </Link>
          <Link
            href="#features"
            className="px-8 py-3 border border-zinc-300 font-medium rounded-lg hover:bg-zinc-50 transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h3 className="text-center text-3xl font-bold mb-16">
          Why Assure
        </h3>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Document Intelligence",
              desc: "Automatically extracts structured data from identity documents using Azure AI."
            },
            {
              title: "Risk-Based Workflow",
              desc: "Adaptive verification that approves low-risk users instantly and escalates high-risk cases."
            },
            {
              title: "Explainable AI",
              desc: "Every decision is accompanied by clear, human-readable explanations."
            },
            {
              title: "Biometric Verification",
              desc: "Face capture and document-photo consistency checks to prevent fraud."
            },
            {
              title: "Human-in-the-Loop",
              desc: "AI assists — compliance officers decide. Built for regulatory compliance."
            },
            {
              title: "Zero-Secret Security",
              desc: "Azure Managed Identity and RBAC. No API keys. No exposed credentials."
            }
          ].map((f) => (
            <div key={f.title} className="p-6 border border-zinc-200 rounded-lg hover:border-zinc-400 transition">
              <h4 className="font-semibold text-lg">{f.title}</h4>
              <p className="mt-3 text-zinc-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 mt-20 py-8 text-center text-sm text-zinc-500">
        <p>Built for Microsoft Imagine Cup · Powered by Azure · Responsible AI by design</p>
      </footer>
    </div>
  );
}
