export interface AdminDocument {
  id: number;
  title: string;
  format: "PDF" | "DOCX";
  size: string;
  uploadedAt: string;
  status: "active" | "processing";
}

export interface AdminAnalytics {
  totalUsers: number;
  avgUsersPerDay: number;
  storageUsed: string;
  storageTotal: string;
  storagePercent: number;
}

export interface AdminNavItem {
  label: string;
  key: string;
}

export const MOCK_ANALYTICS: AdminAnalytics = {
  totalUsers: 24,
  avgUsersPerDay: 10,
  storageUsed: "142 MB",
  storageTotal: "500 MB",
  storagePercent: 28,
};

export const MOCK_DOCUMENTS: AdminDocument[] = [
  {
    id: 1,
    title: "House Ethics Manual",
    format: "PDF",
    size: "2.4 MB",
    uploadedAt: "Feb 10, 2026",
    status: "active",
  },
  {
    id: 2,
    title: "Legislative Process Guide",
    format: "PDF",
    size: "1.8 MB",
    uploadedAt: "Feb 10, 2026",
    status: "active",
  },
  {
    id: 3,
    title: "Staff Onboarding Checklist",
    format: "PDF",
    size: "0.6 MB",
    uploadedAt: "Feb 12, 2026",
    status: "active",
  },
  {
    id: 4,
    title: "House Organization Manual",
    format: "PDF",
    size: "3.1 MB",
    uploadedAt: "Feb 14, 2026",
    status: "active",
  },
  {
    id: 5,
    title: "Floor Procedures Overview",
    format: "DOCX",
    size: "1.2 MB",
    uploadedAt: "Feb 20, 2026",
    status: "processing",
  },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Overview", key: "overview" },
  { label: "Documents", key: "documents" },
  { label: "Users", key: "users" },
];

export async function fetchAnalytics(): Promise<AdminAnalytics> {
  return MOCK_ANALYTICS;
}

export async function fetchDocuments(): Promise<AdminDocument[]> {
  return MOCK_DOCUMENTS;
}

export async function deleteDocument(id: number): Promise<void> {
  console.log(`Deleted document ${id}`);
}

export async function uploadDocument(file: File): Promise<AdminDocument> {
  return {
    id: Date.now(),
    title: file.name.replace(/\.[^/.]+$/, ""),
    format: file.name.endsWith(".docx") ? "DOCX" : "PDF",
    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    uploadedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: "processing",
  };
}
