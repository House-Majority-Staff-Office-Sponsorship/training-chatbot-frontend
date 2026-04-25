"use client";

import { MessageSquare, GraduationCap } from "lucide-react";
import Link from "next/link";
import { ADMIN_NAV_ITEMS } from "@/lib/admin";

interface AdminSidebarProps {
  activeKey: string;
  onSelectNav: (key: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const NAV_ICONS: Record<string, React.ReactNode> = {
  conversations: <MessageSquare size={15} />,
  quizzes: <GraduationCap size={15} />,
};

export default function AdminSidebar({
  activeKey,
  onSelectNav,
  isOpen,
  onToggle,
}: AdminSidebarProps) {
  return (
    <>
      {/* Backdrop (mobile only, when expanded) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          flex flex-col bg-[#1a2332] text-slate-300
          transition-all duration-200 ease-in-out
          ${isOpen ? "w-72" : "w-0 md:w-14 overflow-hidden md:overflow-visible"}
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {isOpen ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
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
              <button
                onClick={onToggle}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded shrink-0"
                aria-label="Collapse sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-2 pt-4 overflow-y-auto">
              <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Admin
              </p>
              <ul className="space-y-0.5">
                {ADMIN_NAV_ITEMS.map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() => onSelectNav(item.key)}
                      className={`
                        w-full text-left px-3 py-2.5 rounded-md transition-colors
                        flex items-center gap-2.5 text-sm font-medium
                        ${
                          activeKey === item.key
                            ? "bg-white/10 text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        }
                      `}
                    >
                      {NAV_ICONS[item.key]}
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer: back to home */}
            <div className="border-t border-white/10 shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to home
              </Link>
            </div>
          </>
        ) : (
          /* Collapsed icon rail (desktop only) */
          <div className="hidden md:flex flex-col items-center h-full py-3 gap-1">
            {/* Expand button */}
            <button
              onClick={onToggle}
              className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors mb-1"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Nav icons */}
            <div className="w-6 border-t border-white/10 my-1" />
            <div className="flex-1 flex flex-col items-center gap-1 w-full px-2.5">
              {ADMIN_NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => onSelectNav(item.key)}
                  title={item.label}
                  aria-label={item.label}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                    activeKey === item.key
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  {NAV_ICONS[item.key]}
                </button>
              ))}
            </div>

            {/* Back to home (collapsed) */}
            <Link
              href="/"
              title="Back to home"
              aria-label="Back to home"
              className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
