"use client";

import React, { useState, useEffect } from "react";
import { checkSupabaseConnection, getSupabaseCredentials } from "@/lib/supabase";
import { getGitHubConfig } from "@/lib/github";
import { showToast } from "./Toast";

interface ConnectionModalProps {
  onClose: () => void;
  onSaved?: () => void;
}

export default function ConnectionModal({ onClose, onSaved }: ConnectionModalProps) {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("princeidrisi24-code/supportgeneiAi");

  const [testingSb, setTestingSb] = useState(false);
  const [sbStatus, setSbStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const [testingGh, setTestingGh] = useState(false);
  const [ghStatus, setGhStatus] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url.includes("placeholder") || creds.url.includes("tyzzgdrwotbexpnxknhm") ? "" : creds.url);
    setSupabaseKey(creds.key.includes("placeholder") ? "" : creds.key);

    const gh = getGitHubConfig();
    setGithubToken(gh.token);
    setGithubRepo(gh.repo || "princeidrisi24-code/supportgeneiAi");

    // Initial check
    checkSupabaseConnection().then(setSbStatus);
  }, []);

  const handleTestSupabase = async () => {
    if (!supabaseUrl.trim()) {
      setSbStatus({ ok: false, message: "Please enter a valid Supabase project URL." });
      return;
    }
    setTestingSb(true);
    try {
      const res = await fetch(`${supabaseUrl.trim()}/auth/v1/health`, {
        headers: { apikey: supabaseKey.trim() },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        setSbStatus({ ok: true, message: "Connected to Supabase project successfully!" });
        showToast("Supabase connection verified!", "success");
      } else {
        setSbStatus({ ok: false, message: `Supabase returned HTTP ${res.status}: ${res.statusText}` });
      }
    } catch (err: unknown) {
      setSbStatus({ ok: false, message: err instanceof Error ? err.message : "Failed to reach host" });
    } finally {
      setTestingSb(false);
    }
  };

  const handleTestGitHub = async () => {
    if (!githubToken.trim()) {
      setGhStatus({ ok: false, message: "Enter a GitHub Personal Access Token to test." });
      return;
    }
    setTestingGh(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${githubRepo.trim()}`, {
        headers: {
          Authorization: `Bearer ${githubToken.trim()}`,
          Accept: "application/vnd.github.v3+json",
        },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        setGhStatus({ ok: true, message: `Connected to ${data.full_name} (${data.private ? "Private" : "Public"})` });
        showToast("GitHub connection verified!", "success");
      } else {
        setGhStatus({ ok: false, message: `GitHub error: HTTP ${res.status}` });
      }
    } catch (err: unknown) {
      setGhStatus({ ok: false, message: err instanceof Error ? err.message : "Failed to reach GitHub" });
    } finally {
      setTestingGh(false);
    }
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      if (supabaseUrl.trim()) {
        localStorage.setItem("wedcraft_custom_supabase_url", supabaseUrl.trim());
      } else {
        localStorage.removeItem("wedcraft_custom_supabase_url");
      }

      if (supabaseKey.trim()) {
        localStorage.setItem("wedcraft_custom_supabase_key", supabaseKey.trim());
      } else {
        localStorage.removeItem("wedcraft_custom_supabase_key");
      }

      if (githubToken.trim()) {
        localStorage.setItem("wedcraft_github_token", githubToken.trim());
      } else {
        localStorage.removeItem("wedcraft_github_token");
      }

      localStorage.setItem("wedcraft_github_repo", githubRepo.trim());
    }

    showToast("Settings saved successfully!", "success");
    if (onSaved) onSaved();
    onClose();
  };

  const handleUseLocalMode = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wedcraft_custom_supabase_url");
      localStorage.removeItem("wedcraft_custom_supabase_key");
    }
    showToast("Switched to Local Offline Mode. Data is stored on your device!", "info");
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">🔗 Supabase &amp; GitHub Connections</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Supabase Section */}
          <div className="card" style={{ padding: "16px", background: "var(--color-background)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>⚡</span>
                <strong style={{ fontSize: "15px" }}>Supabase Database &amp; Auth</strong>
              </div>
              <span
                className="badge"
                style={{
                  background: sbStatus?.ok ? "var(--color-success-bg)" : "var(--color-warning-bg)",
                  color: sbStatus?.ok ? "var(--color-success)" : "var(--color-warning)",
                  fontSize: "11px",
                }}
              >
                {sbStatus?.ok ? "🟢 Cloud Connected" : "🟡 Local Storage Mode"}
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: "10px" }}>
              <label className="form-label" style={{ fontSize: "12px" }}>Supabase Project URL</label>
              <input
                className="form-input"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                style={{ fontSize: "13px" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "12px" }}>
              <label className="form-label" style={{ fontSize: "12px" }}>Supabase Anon / Public Key</label>
              <input
                className="form-input"
                type="password"
                placeholder="eyJhbGciOi..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                style={{ fontSize: "13px" }}
              />
            </div>

            {sbStatus && (
              <div
                style={{
                  fontSize: "12px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  background: sbStatus.ok ? "#ECFDF5" : "#FEF3C7",
                  color: sbStatus.ok ? "#065F46" : "#92400E",
                }}
              >
                {sbStatus.ok ? "✓ " : "ℹ️ "}
                {sbStatus.message}
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleTestSupabase}
                disabled={testingSb}
              >
                {testingSb ? "Testing..." : "🧪 Test Supabase Connection"}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleUseLocalMode}
              >
                💾 Use Local Storage Mode
              </button>
            </div>
          </div>

          {/* GitHub Section */}
          <div className="card" style={{ padding: "16px", background: "var(--color-background)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>🐙</span>
                <strong style={{ fontSize: "15px" }}>GitHub Integration</strong>
              </div>
              <span
                className="badge"
                style={{
                  background: ghStatus?.ok ? "var(--color-success-bg)" : "var(--color-divider)",
                  color: ghStatus?.ok ? "var(--color-success)" : "var(--color-text-secondary)",
                  fontSize: "11px",
                }}
              >
                {ghStatus?.ok ? "🟢 GitHub Ready" : "⚪ Optional"}
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: "10px" }}>
              <label className="form-label" style={{ fontSize: "12px" }}>GitHub Repository (owner/repo)</label>
              <input
                className="form-input"
                placeholder="princeidrisi24-code/supportgeneiAi"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                style={{ fontSize: "13px" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "12px" }}>
              <label className="form-label" style={{ fontSize: "12px" }}>
                Personal Access Token (with <code>repo</code> scope)
              </label>
              <input
                className="form-input"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx..."
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                style={{ fontSize: "13px" }}
              />
              <span className="form-helper" style={{ fontSize: "11px" }}>
                Needed to sync checklist tasks to GitHub issues. Generate in GitHub → Settings → Developer Settings → Personal Access Tokens.
              </span>
            </div>

            {ghStatus && (
              <div
                style={{
                  fontSize: "12px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  background: ghStatus.ok ? "#ECFDF5" : "#FEF3C7",
                  color: ghStatus.ok ? "#065F46" : "#92400E",
                }}
              >
                {ghStatus.ok ? "✓ " : "ℹ️ "}
                {ghStatus.message}
              </div>
            )}

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleTestGitHub}
              disabled={testingGh}
            >
              {testingGh ? "Testing..." : "🧪 Test GitHub Token"}
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: "24px" }}>
          <button className="btn btn-tertiary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save &amp; Apply
          </button>
        </div>
      </div>
    </div>
  );
}
