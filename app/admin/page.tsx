"use client";

import { useState } from "react";
import AdminSidebar from "@/components/Adminsidebar";
import Link from "next/link";

import {
  FileText,
  Trash2,
  Upload,
  Users,
  HardDrive,
  MessageSquare,
  CheckCircle,
  Clock,
} from "lucide-react";

import {
  MOCK_ANALYTICS,
  MOCK_DOCUMENTS,
  AdminDocument,
  deleteDocument,
  uploadDocument,
} from "@/lib/admin";

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("overview");
  const [documents, setDocuments] = useState<AdminDocument[]>(MOCK_DOCUMENTS);
  const [dragOver, setDragOver] = useState(false);
  const analytics = MOCK_ANALYTICS;

  async function handleDelete(id: number) {
    await deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const newDoc = await uploadDocument(file);
    setDocuments((prev) => [...prev, newDoc]);
  }

  async function handleBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc = await uploadDocument(file);
    setDocuments((prev) => [...prev, newDoc]);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeKey={activeNav}
        onSelectNav={setActiveNav}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              Admin
            </p>
            <h1 className="text-sm font-semibold text-slate-900 capitalize">
              {activeNav}
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors hidden sm:block"
          >
            Home
          </Link>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* ── Overview ── */}
          {activeNav === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Users */}
                  <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-slate-500">
                        Total Users
                      </p>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Users size={15} className="text-blue-500" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                      {analytics.totalUsers}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Session hires onboarded
                    </p>
                  </div>

                  {/* Avg Questions */}
                  <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-slate-500">
                        Avg Users / Day
                      </p>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <MessageSquare size={15} className="text-blue-500" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                      {analytics.avgUsersPerDay}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Across all users
                    </p>
                  </div>

                  {/* Storage */}
                  <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-slate-500">
                        Storage Used
                      </p>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <HardDrive size={15} className="text-blue-500" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                      {analytics.storageUsed}
                    </p>
                    <div className="mt-2">
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div
                          className="h-1.5 bg-blue-500 rounded-full"
                          style={{ width: `${analytics.storagePercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {analytics.storagePercent}% of {analytics.storageTotal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Documents ── */}
          {(activeNav === "overview" || activeNav === "documents") && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Document Management
              </h2>

              {/* Upload area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl px-6 py-8 text-center mb-4 transition-colors ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <Upload size={18} className="text-blue-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Drag and drop a document
                </p>
                <p className="text-xs text-slate-400 mb-3">
                  Supported formats: PDF, DOCX
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer">
                  <Upload size={13} />
                  Browse files
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={handleBrowse}
                  />
                </label>
              </div>

              {/* Document table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Document
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                        Format
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                        Size
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                        Uploaded
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Status
                      </th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, i) => (
                      <tr
                        key={doc.id}
                        className={`${
                          i !== documents.length - 1
                            ? "border-b border-slate-100"
                            : ""
                        } hover:bg-slate-50 transition-colors`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <FileText size={14} className="text-blue-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-800 truncate">
                              {doc.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {doc.format}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 hidden sm:table-cell">
                          {doc.size}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 hidden md:table-cell">
                          {doc.uploadedAt}
                        </td>
                        <td className="px-5 py-3.5">
                          {doc.status === "active" ? (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                              <CheckCircle size={12} /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-500">
                              <Clock size={12} /> Processing
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
                            aria-label="Delete document"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Users (placeholder) ── */}
          {activeNav === "users" && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Users size={22} className="text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                User management
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                User list and individual usage stats will appear here once
                authentication is connected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
