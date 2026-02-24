import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-200">
        <span className="text-lg font-semibold text-slate-900 tracking-tight">
          House Training Assistant
        </span>
        <Link
          href="/chat"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Open Chat
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-5">
            House Majority Staff Office
          </p>
          <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
            Your AI-powered
            <br />
            training companion
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-xl mx-auto">
            Get instant answers to policy questions, navigate procedures, and
            access training resources — all in one place, available whenever
            you need it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
            >
              Start a conversation
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-7 py-3 border border-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="bg-slate-50 border-t border-slate-200 py-16 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center text-slate-900 mb-10">
            Built for House staff
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-lg border border-slate-200 p-6"
              >
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-8 py-5 text-center text-xs text-slate-400">
        House Majority Staff Office &mdash; Training Chatbot &mdash; For
        internal use only
      </footer>
    </main>
  );
}

const features = [
  {
    title: "Instant answers",
    description:
      "Ask questions in plain language and receive clear, accurate answers drawn from official training materials.",
  },
  {
    title: "Session history",
    description:
      "Every conversation is saved so you can pick up where you left off or revisit past exchanges.",
  },
  {
    title: "Secure by design",
    description:
      "All data stays within the House network. No information is shared with third-party services.",
  },
];
