import Image from "next/image";
import Link from "next/link";
import {
  MessageCircleMore,
  ShieldCheck,
  History,
  LayoutDashboard,
  Flag,
  Activity,
} from "lucide-react";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col bg-white"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 sm:px-8 py-2.5 border-b border-slate-200 bg-zinc-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="https://portal.ehawaii.gov/assets/webp/elements/sliver/seal.webp"
            alt="Hawaii State Seal"
            width={36}
            height={36}
            className="rounded shrink-0"
          />
          <span className="text-sm font-semibold text-white tracking-tight truncate">
            House Training Assistant
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <Link
            href="/quiz"
            className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-zinc-400 hover:text-white text-xs font-medium transition-colors"
          >
            Quiz
          </Link>
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-zinc-400 hover:text-white text-xs font-medium transition-colors"
          >
            Admin
          </Link>
          <a
            href="https://hmso-training.ics.hawaii.edu/backend"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center justify-center px-4 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-xs font-medium rounded-md transition-colors"
          >
            API Docs
          </a>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center px-3 sm:px-5 py-1.5 bg-zinc-600 hover:bg-zinc-500 text-white text-xs font-medium rounded-md transition-colors"
          >
            Open Chat
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center px-4 sm:px-6 pt-12 sm:pt-20 pb-5">
        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Left Column */}
          <div className="flex-[3] min-w-0">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-blue-800 mb-3 sm:mb-5">
              House Majority Staff Office
            </p>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4 sm:mb-6"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              AI chats and quizzes
              <br />
              for onboarding policy
              <br />
              and procedure.
            </h1>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-6 sm:mb-10 max-w-xl">
              Search House training documents, get grounded answers, and quiz yourself on what matters — all from one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center px-7 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
              >
                Start a conversation
              </Link>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
              >
                Take a quiz
              </Link>
            </div>
          </div>

          {/* Right Column — Stacked display */}
          <div className="relative flex-1 hidden md:block ml-6 overflow-visible" style={{ minHeight: 420 }}>
            {/* Capitol image — centered background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 380, maxWidth: "none" }}>
              <Image
                src="/capitol.png"
                alt="U.S. Capitol"
                width={380}
                height={228}
                className="rounded-xl object-cover opacity-90 w-full h-auto"
                priority
              />
            </div>

            {/* Mini chat preview — floating top-left */}
            <div className="absolute -top-2 left-4 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden transform -rotate-2 z-10">
              <div className="bg-[#1a2332] px-3 py-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="ml-2 text-[9px] text-slate-400">Chat</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[7px] font-bold text-white shrink-0">You</div>
                  <div className="bg-blue-600 text-white text-[9px] rounded-lg rounded-tr-sm px-2.5 py-1.5 max-w-[170px]">What are the ethics rules?</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[7px] font-bold text-slate-600 shrink-0">AI</div>
                  <div className="bg-slate-50 border border-slate-200 text-slate-600 text-[9px] rounded-lg rounded-tl-sm px-2.5 py-1.5 max-w-[170px]">
                    Staff must maintain decorum, wear IDs at all times...
                    <span className="block text-blue-500 text-[8px] mt-1">Source: House Ethics Manual</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini quiz preview — floating bottom-right */}
            <div className="absolute -bottom-2 -right-4 w-60 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden transform rotate-2 z-10">
              <div className="bg-[#1a2332] px-3 py-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="ml-2 text-[9px] text-slate-400">Quiz</span>
              </div>
              <div className="p-3">
                <div className="h-0.5 bg-slate-100 rounded-full mb-2">
                  <div className="h-0.5 bg-blue-500 rounded-full" style={{ width: "60%" }} />
                </div>
                <p className="text-[9px] font-semibold text-slate-800 mb-2 leading-snug">What should staff do if unsure about a gift?</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-slate-200 text-[8px] text-slate-500">
                    <span className="w-3 h-3 rounded-full border border-slate-300 flex items-center justify-center text-[6px] font-bold">A</span>
                    Accept it
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-green-400 bg-green-50 text-[8px] text-green-700 font-medium">
                    <span className="w-3 h-3 rounded-full border border-green-500 flex items-center justify-center text-[6px] font-bold">B</span>
                    Consult Ethics Committee
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-red-400 bg-red-50 text-[8px] text-red-600">
                    <span className="w-3 h-3 rounded-full border border-red-400 flex items-center justify-center text-[6px] font-bold">C</span>
                    Ask your supervisor
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features: Test Slant Section */}
      <section
        id="features"
        className="flex flex-col items-center justify-center text-center px-4 sm:px-6 pb-12 sm:pb-20 bg-blue-100 relative overflow-hidden"
        style={{ clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)" }}
      >
        <div className="max-w-4xl mx-auto pt-24 sm:pt-40">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl font-semibold text-center text-slate-900"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Built for House Staff
            </h2>
            <p className="text-xs sm:text-sm text-center font-semibold uppercase tracking-widest text-zinc-500 mb-6 sm:mb-10">
              Your onboarding companion
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
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

      {/* Feature Showcase: Chat */}
      <section className="bg-white py-12 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 order-2 md:order-1">
            {/* Placeholder: Chat UI */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-[#1a2332] px-4 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-slate-400">House Training Assistant</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">You</div>
                  <div className="bg-blue-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs">What are the ethics rules for staff?</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">AI</div>
                  <div className="bg-white border border-slate-200 text-slate-700 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                    <p className="font-medium mb-1.5">House staff are subject to several ethics rules:</p>
                    <p className="text-slate-500 text-xs leading-relaxed">Staff must maintain order and decorum, wear IDs at all times, and maintain confidentiality for conversations with representatives...</p>
                    <p className="text-blue-500 text-[10px] mt-2 font-medium">Source: House Ethics Manual, HSAA Operations Guide</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center pl-10">
                  <span className="text-[11px] text-slate-400">Did this help?</span>
                  <span className="text-[11px] text-slate-500 border border-slate-200 rounded-full px-2 py-0.5">Yes</span>
                  <span className="text-[11px] text-cyan-600 border border-cyan-200 rounded-full px-2 py-0.5">Search deeper</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex-1">Type a message...</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>Gemini 3.1 Flash-Lite</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 order-1 md:order-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-3">AI Chat Assistant</p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug mb-5"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Ask anything about
              <br />House policies
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Ask questions in plain language and get answers grounded in official House training documents. The AI searches your training corpus, cites its sources, and offers three levels of depth:
            </p>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span><strong className="text-slate-900">Quick Search</strong> — Fast answers using Gemini 3.1 Flash-Lite for everyday questions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                <span><strong className="text-slate-900">Extended Thinking</strong> — Deeper analysis with Gemini 3.1 Pro for complex topics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span><strong className="text-slate-900">Deep Research</strong> — Multi-agent pipeline that breaks your question into sub-topics and compiles a report</span>
              </li>
            </ul>
            <Link
              href="/chat"
              className="inline-flex items-center mt-8 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Try the chat &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Showcase: Quiz */}
      <section className="bg-slate-50 border-y border-slate-200 py-12 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-900 mb-3">AI-Generated Quizzes</p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug mb-5"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Test your knowledge
              <br />on any topic
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Describe what you want to be tested on and the AI will search official training documents, generate multiple-choice questions, and provide instant feedback with source citations after every answer.
            </p>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                <span><strong className="text-slate-900">Custom topics</strong> — Type any subject or pick from popular suggestions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                <span><strong className="text-slate-900">Grounded questions</strong> — Every question comes from real training documents with cited sources</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                <span><strong className="text-slate-900">Saved progress</strong> — Quizzes are saved to your session so you can revisit and retake them anytime</span>
              </li>
            </ul>
            <Link
              href="/quiz"
              className="inline-flex items-center mt-8 text-sm font-semibold text-slate-900 hover:text-slate-700 transition-colors"
            >
              Generate a quiz &rarr;
            </Link>
          </div>
          <div className="flex-1">
            {/* Placeholder: Quiz UI */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-[#1a2332] px-4 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-slate-400">Knowledge Quizzes</span>
              </div>
              <div className="p-6">
                <div className="flex justify-between text-[10px] text-slate-400 mb-2">
                  <span>Question 3 of 5</span>
                  <span>Ethics Rules</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full mb-5">
                  <div className="h-1 bg-blue-500 rounded-full" style={{ width: "40%" }} />
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-4 leading-snug">
                  What should staff do if unsure whether a gift is permissible?
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold">A</span>
                    Accept it and report later
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold">B</span>
                    Decline it to be safe
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-green-400 bg-green-50 text-xs text-green-800 font-medium">
                    <span className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center text-[9px] font-bold">C</span>
                    Consult the Committee on Ethics
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-red-400 bg-red-50 text-xs text-red-700">
                    <span className="w-4 h-4 rounded-full border border-red-400 flex items-center justify-center text-[9px] font-bold">D</span>
                    Ask your supervisor
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Source</p>
                  <p className="text-[10px] text-slate-500">House Ethics Manual, &sect;3.4</p>
                  <p className="text-[10px] text-green-600 mt-0.5">Correct &mdash; Great job!</p>
                </div>
                <div className="bg-[#1a2332] text-white text-xs font-medium py-2.5 rounded-lg text-center">
                  Next Question &rarr;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge source */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-4">
            Knowledge source
          </p>
          <h2
            className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-6"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            Powered by Vertex AI &amp; RAG Engine
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-3">
            All official House training documents are indexed in Google Cloud&apos;s
            Vertex AI RAG Engine, which the assistant queries to ground every
            answer in cited source material.
          </p>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Contact your admin to upload any missing sources, or if you&apos;d
            like to request access to additional materials.
          </p>
        </div>
      </section>

      {/* Admin Portal */}
      <section className="bg-slate-50 border-t border-slate-200 py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">
              For administrators
            </p>
            <h2
              className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-4"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              An admin portal to monitor every conversation
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Authorized staff can review every chat session stored in the
              system, audit how the assistant is being used, and follow up on
              responses users have flagged for attention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center mb-3">
                <LayoutDashboard size={16} className="text-blue-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Conversation review
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse every session with title, user ID, message count, and
                last activity. Drill into any conversation to read the full
                exchange.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="w-9 h-9 rounded-md bg-amber-50 flex items-center justify-center mb-3">
                <Flag size={16} className="text-amber-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Flagged responses
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Users can flag any AI answer that seems wrong or off. Filter
                the admin list to show only sessions that need review.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="w-9 h-9 rounded-md bg-green-50 flex items-center justify-center mb-3">
                <Activity size={16} className="text-green-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Agent telemetry
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                See per-session agent event logs, token usage, and deep
                research output for any conversation that ran the multi-agent
                pipeline.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md transition-colors"
            >
              Open admin portal &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Get Started: Test Slant Section */}
      <section
        id="features"
        className="flex flex-col items-center justify-center text-center px-4 sm:px-6 py-10 sm:py-15 bg-blue-100 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl font-semibold text-center text-slate-900 mb-6"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Your Training Starts Here
            </h2>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-5 max-w-xl mx-auto">
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
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-7 sm:px-15 py-3 border border-slate-200 text-slate-700 text-sm font-medium rounded-md bg-white hover:bg-blue-500 hover:text-white transition-colors"
              >
                Take a quiz
              </Link>
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
    title: "AI-Generated Quizzes",
    icon: ShieldCheck,
    description:
      "Describe any topic and get a custom quiz generated from official training documents — complete with source citations and instant feedback.",
  },
];

