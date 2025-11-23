"use client";

import { useState, useMemo, useEffect } from "react";
import { Role, ReportStatus, type Report } from "@/lib/types";
import { mockReports } from "@/lib/mockReports";
import { ObsidianNetwork, ReportList, MethodPill } from "@/components/forum";
import { AppShell } from "@/components/app";

const METHODS = ["vLayer zkTLS", "Filecoin", "EVVM anchor", "Aztec (planned)"];

export default function ForumPage() {
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [latestReport, setLatestReport] = useState<Report | null>(null);

  // Pull the latest report saved by the dashboard (local-only bridge)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("sigilo.latestReport");
      if (stored) {
        const parsed = JSON.parse(stored) as Report;
        setLatestReport(parsed);
      }
    } catch (error) {
      console.warn("Could not load latest report for forum:", error);
    }
  }, []);

  const filteredReports = useMemo(() => {
    const combined = latestReport
      ? [latestReport, ...mockReports.filter((r) => r.id !== latestReport.id)]
      : mockReports;

    return combined.filter((report) => {
      // Role filter
      if (roleFilter !== "All" && report.role !== roleFilter) return false;

      // Status filter
      if (statusFilter !== "All" && report.status !== statusFilter) return false;

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesDescription = report.description.toLowerCase().includes(searchLower);
        const matchesLocation = report.location?.toLowerCase().includes(searchLower);
        if (!matchesDescription && !matchesLocation) return false;
      }

      return true;
    });
  }, [roleFilter, statusFilter, search, latestReport]);

  const roles: (Role | "All")[] = ["All", "Journalist", "Public official", "Citizen"];
  const statuses: (ReportStatus | "All")[] = ["All", "Pending", "Stored", "Verified"];

  return (
    <AppShell title="Signal Forum">
      <main className="min-h-screen bg-sigilo-bg">
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-sigilo-text-primary">
            Encrypted Signal Forum
          </h1>
          <p className="text-sigilo-text-secondary max-w-2xl mx-auto">
            Anonymized reports anchored through Sigilo&apos;s privacy stack. Identities are
            removed; the network of signals remains.
          </p>

          {/* Method badges */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {METHODS.map((method) => (
              <MethodPill key={method} method={method} />
            ))}
          </div>
        </header>

        {/* Filters toolbar */}
        <div className="bg-sigilo-surface/50 rounded-xl border border-sigilo-border/30 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Role filter */}
            <div className="flex-1">
              <label className="text-xs text-sigilo-text-muted mb-2 block">Role</label>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${
                        roleFilter === role
                          ? "bg-sigilo-teal/20 text-sigilo-teal border border-sigilo-teal/50"
                          : "bg-sigilo-border/30 text-sigilo-text-secondary hover:bg-sigilo-border/50 border border-transparent"
                      }
                    `}
                  >
                    {role === "All" ? "All Roles" : role}
                  </button>
                ))}
              </div>
            </div>

            {/* Status filter */}
            <div className="w-full lg:w-48">
              <label className="text-xs text-sigilo-text-muted mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "All")}
                className="w-full bg-sigilo-surface border border-sigilo-border rounded-lg px-3 py-2 text-sm text-sigilo-text-primary focus:outline-none focus:border-sigilo-teal/50"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All Statuses" : status}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="w-full lg:w-64">
              <label className="text-xs text-sigilo-text-muted mb-2 block">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search description or location..."
                  className="w-full bg-sigilo-surface border border-sigilo-border rounded-lg px-3 py-2 pl-9 text-sm text-sigilo-text-primary placeholder-sigilo-text-muted focus:outline-none focus:border-sigilo-teal/50"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sigilo-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-sigilo-border/30 flex items-center justify-between">
            <span className="text-sm text-sigilo-text-muted">
              {filteredReports.length} signal{filteredReports.length !== 1 ? "s" : ""} found
            </span>
            {selectedId && (
              <button
                onClick={() => setSelectedId(null)}
                className="text-sm text-sigilo-teal hover:text-sigilo-teal-light transition-colors"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network visualization */}
          <div>
            <h2 className="text-sm font-medium text-sigilo-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              Signal Network
            </h2>
            <ObsidianNetwork
              reports={filteredReports}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Report list */}
          <div>
            <h2 className="text-sm font-medium text-sigilo-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Encrypted Signals
            </h2>
            <ReportList
              reports={filteredReports}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center pt-8 border-t border-sigilo-border/30">
          <p className="text-xs text-sigilo-text-muted max-w-xl mx-auto">
            All signals displayed are anonymized and encrypted. No personally identifiable
            information is stored or transmitted. The network visualization represents
            encrypted metadata only.
          </p>
        </div>
      </div>
      </main>
    </AppShell>
  );
}
