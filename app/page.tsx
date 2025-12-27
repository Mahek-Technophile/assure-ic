export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Assure
        </h1>
        <p className="mt-6 text-lg text-zinc-600 max-w-2xl mx-auto">
          Enterprise-grade, AI-powered KYC & compliance platform built on
          Azure with zero-secret security and human-in-the-loop decisioning.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <a
            href="/login"
            className="rounded-md bg-black px-6 py-3 text-white text-sm font-medium"
          >
            Get Started
          </a>
          <a
            href="#features"
            className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-6xl px-6 py-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[
          {
            title: "Document Intelligence",
            desc: "Automatically extract structured identity data from messy, real-world documents using Azure AI Document Intelligence."
          },
          {
            title: "Risk-Based Verification",
            desc: "Adaptive verification workflows that auto-approve low-risk users and escalate high-risk cases."
          },
          {
            title: "Explainable AI Decisions",
            desc: "Every AI-driven risk signal is accompanied by a clear, human-readable explanation."
          },
          {
            title: "Biometric Consistency Checks",
            desc: "Face capture and document-photo consistency checks to reduce identity fraud."
          },
          {
            title: "Human-in-the-Loop Compliance",
            desc: "AI assists — compliance officers decide. Manual review flows are built-in by design."
          },
          {
            title: "Zero-Secret Security",
            desc: "Built on Azure Managed Identity and RBAC. No API keys. No leaked credentials."
          }
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-zinc-200 bg-white p-6"
          >
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-3 text-sm text-zinc-600">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
        Built for Microsoft Imagine Cup · Powered by Azure · Responsible AI by design
      </footer>
    </main>
  );
}
