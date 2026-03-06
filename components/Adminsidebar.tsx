"use client";

import { TrendingUp, FileText, Users } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/admin";

interface AdminSidebarProps {
  activeKey: string;
  onSelectNav: (key: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const currentUser = {
  name: "Admin User",
  role: "House Majority Staff Office",
  initials: "AU",
};

const NAV_ICONS: Record<string, React.ReactNode> = {
  overview: <TrendingUp size={15} />,
  documents: <FileText size={15} />,
  users: <Users size={15} />,
};

export default function AdminSidebar({
  activeKey,
  onSelectNav,
  isOpen,
  onClose,
}: AdminSidebarProps) {
  return (
    <>
      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          flex flex-col w-64 bg-[#1a2332] text-slate-300
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isOpen ? "md:flex" : "md:hidden"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img
              src="https://portal.ehawaii.gov/assets/webp/elements/sliver/seal.webp"
              alt="Hawaii State Seal"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="text-med font-semibold text-white tracking-tight">
              House Training Assistant
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded"
            aria-label="Close sidebar"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Nav links — pulled from lib/admin.ts */}
        <nav className="flex-1 px-2 pt-4">
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

        {/* User footer */}
        <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {currentUser.initials}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-white">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500">{currentUser.role}</p>
            </div>
          </div>
          <button className="text-slate-500 hover:text-white text-[10px] transition-colors">
            Sign out
          </button>
        </div>

        {/* Internal use label */}
        <div className="px-4 pt-2 pb-3 text-center">
          <p className="text-xs text-slate-500">Internal use only</p>
        </div>
      </aside>
    </>
  );
}
