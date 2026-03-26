"use client";

import { useState } from "react";

interface ProjectReportButtonProps {
  projectId: string;
  projectName: string;
}

export function ProjectReportButton({ projectId, projectName }: ProjectReportButtonProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function generate() {
    setLoading(true);
    setOpen(true);
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-60 transition-colors"
      >
        <SparklesIcon />
        {loading ? "Generating…" : "Generate Report"}
      </button>

      {open && (
        <ReportPanel
          projectName={projectName}
          report={report}
          loading={loading}
          onClose={() => setOpen(false)}
          onRegenerate={generate}
        />
      )}
    </>
  );
}

// ─── Report panel ─────────────────────────────────────────────────────────────

interface ReportPanelProps {
  projectName: string;
  report: string | null;
  loading: boolean;
  onClose: () => void;
  onRegenerate: () => void;
}

function ReportPanel({ projectName, report, loading, onClose, onRegenerate }: ReportPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="text-indigo-500" />
            <div>
              <h2 className="font-semibold text-gray-900">AI Project Report</h2>
              <p className="text-xs text-gray-500">{projectName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              disabled={loading}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
            >
              Regenerate
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <p className="text-sm text-gray-500">
                Claude is analyzing <span className="font-medium">{projectName}</span>…
              </p>
            </div>
          ) : report ? (
            <ReportContent text={report} />
          ) : null}
        </div>

        {/* Footer timestamp */}
        {report && !loading && (
          <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
            Generated {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            {" · "}Powered by Claude
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Markdown-lite renderer ────────────────────────────────────────────────────

function ReportContent({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-gray-700">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // H1
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={i} className="text-lg font-bold text-gray-900">
              {trimmed.slice(2)}
            </h2>
          );
        }

        // H2 / H3
        if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
          const level = trimmed.startsWith("### ") ? 4 : 3;
          const content = trimmed.replace(/^#{2,3} /, "");
          return (
            <h3 key={i} className={`font-semibold text-gray-900 ${level === 3 ? "text-base" : "text-sm"}`}>
              {content}
            </h3>
          );
        }

        // Bullet list
        const lines = trimmed.split("\n");
        if (lines.length > 0 && lines.every((l) => /^[-*•]\s/.test(l))) {
          return (
            <ul key={i} className="space-y-1.5 pl-4">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                  <span>{l.replace(/^[-*•]\s/, "").replace(/\*\*(.*?)\*\*/g, "$1")}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Mixed block (some bullet, some text)
        if (lines.some((l) => /^[-*•]\s/.test(l))) {
          return (
            <div key={i} className="space-y-1">
              {lines.map((l, j) => {
                if (/^[-*•]\s/.test(l)) {
                  return (
                    <div key={j} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                      <span>{l.replace(/^[-*•]\s/, "").replace(/\*\*(.*?)\*\*/g, "$1")}</span>
                    </div>
                  );
                }
                return <p key={j}>{l.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
              })}
            </div>
          );
        }

        // Regular paragraph — strip bold markers for clean display
        return (
          <p key={i} className="text-gray-700">
            {trimmed.replace(/\*\*(.*?)\*\*/g, "$1")}
          </p>
        );
      })}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SparklesIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
