import Image from "next/image";
import Link from "next/link";
import {
  MessageCircleMore,
  ShieldCheck,
  FileSpreadsheet,
  History,
} from "lucide-react";
import { MOCK_DOCUMENTS } from "@/lib/admin";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col bg-white"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-zinc-950/80">
        <div className="flex items-center gap-2.5">
          <img
            src="https://portal.ehawaii.gov/assets/webp/elements/sliver/seal.webp"
            alt="Hawaii State Seal"
            width={60}
            height={60}
            className="rounded"
          />
          <span className="text-lg font-semibold text-white tracking-tight">
            House Training Assistant
          </span>
        </div>
        <Link
          href="/chat"
          className="inline-flex items-center justify-center px-7 py-3 bg-zinc-600 hover:bg-zinc-500 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
        >
          Open Chat
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center px-6 pt-20 pb-5">
        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-12">
          {/* Left Column */}
          <div className="flex-1">
            <p className="text-med font-semibold uppercase tracking-widest text-blue-800 mb-5">
              House Majority Staff Office
            </p>
            <h1
              className="text-5xl font-bold text-slate-900 leading-tight mb-6"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Your AI-powered
              <br />
              training companion
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-xl">
              Get instant answers to policy questions, navigate procedures, and
              access training resources — all in one place, available whenever
              you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center px-7 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
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

          {/* Right Column — Capitol Image */}
          <div className="flex items-center justify-center">
            <Image
              src="/capitol.png"
              alt="U.S. Capitol"
              width={500}
              height={300}
              className="rounded-xl object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features: Test Slant Section */}
      <section
        id="features"
        className="flex flex-col items-center justify-center text-center px-6 pb-20 bg-blue-100 relative overflow-hidden"
        style={{ clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)" }}
      >
        <div className="max-w-4xl mx-auto pt-40">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl font-semibold text-center text-slate-900"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Built for House Staff
            </h2>
            <p className="text-med text-center font-semibold uppercase tracking-widest text-zinc-500 mb-10">
              Your onboarding companion
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-white rounded-lg border border-slate-200 p-6"
                >
                  <div className="pb-3">
                    <div className="inline-flex items-center justify-center px-7 py-3 text-blue-500 text-sm bg-blue-500/20 font-medium rounded-md transition-colors shadow-sm">
                      <f.icon size={25} />
                    </div>
                  </div>
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
        </div>
      </section>

      {/* Library */}
      <section className="bg-slate-50 border-t border-slate-200 py-15 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          {/* Left Column — Text */}
          <div className="flex-1">
            <h2
              className="text-3xl font-semibold text-slate-900 mb-4"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Training Library
            </h2>
            <p className="text-med font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Popular resources
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Browse official House training materials to help you navigate
              procedures, policies, and your role as a session hire.
            </p>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              View all documents →
            </p>
          </div>
          {/* Right Column — Stacked Cards */}
          <div className="flex flex-col gap-4 flex-1">
            {documents.map((d) => (
              <div
                key={d.title}
                className="bg-white rounded-lg border border-slate-200 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={20} className="text-blue-500" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    {d.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started: Test Slant Section */}
      <section
        id="features"
        className="flex flex-col items-center justify-center text-center px-6 py-15 bg-blue-100 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl font-semibold text-center text-slate-900 mb-6"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Your Training Starts Here
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed mb-5 max-w-xl mx-auto">
              Ask questions, review procedures, and test your knowledge — all
              backed by official House training materials and available whenever
              you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center px-7 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
              >
                Start a conversation
              </Link>
              <a
                href="/quiz"
                className="inline-flex items-center justify-center px-15 py-3 border border-slate-200 text-slate-700 text-sm font-medium rounded-md bg-white hover:bg-blue-500 hover:text-white transition-colors"
              >
                Take a quiz
              </a>
            </div>
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
    title: "Instant & Trusted Answers",
    icon: MessageCircleMore,
    description:
      "Ask questions in plain language and receive answers grounded in official House training materials, with source citations included.",
  },
  {
    title: "Session history",
    icon: History,
    description:
      "Every conversation is saved so you can pick up where you left off or revisit past exchanges.",
  },
  {
    title: "Test Your Knowledge",
    icon: ShieldCheck,
    description:
      "Reinforce what you've learned with quizzes and study content generated directly from your official training materials.",
  },
];

const documents = MOCK_DOCUMENTS.slice(0, 4);
