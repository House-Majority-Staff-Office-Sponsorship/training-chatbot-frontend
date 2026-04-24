"use client";

import { useState } from "react";
import AdminSidebar from "@/components/Adminsidebar";
import AdminConversations from "@/components/AdminConversations";

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("conversations");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar
        activeKey={activeNav}
        onSelectNav={setActiveNav}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeNav === "conversations" && <AdminConversations />}
        </div>
      </div>
    </div>
  );
}
