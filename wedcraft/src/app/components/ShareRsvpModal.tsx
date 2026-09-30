"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { showToast } from "./Toast";

interface ShareRsvpModalProps {
  onClose: () => void;
  slug: string;
  partner1?: string;
  partner2?: string;
}

export default function ShareRsvpModal({
  onClose,
  slug,
  partner1 = "Partner 1",
  partner2 = "Partner 2",
}: ShareRsvpModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/site/${slug}#rsvp`;

  useEffect(() => {
    QRCode.toDataURL(
      publicUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: "#1A1035",
          light: "#FFFFFF",
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [publicUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast("RSVP link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = `We're getting married! 💕 ${partner1} & ${partner2} warmly invite you to celebrate with us. Please view event details and RSVP here:\n\n${publicUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmail = () => {
    const subject = `Wedding Invitation: ${partner1} & ${partner2}`;
    const body = `Hi,\n\nWe are overjoyed to invite you to celebrate our wedding!\n\nYou can view all the schedule details, location, and RSVP directly at our wedding website:\n${publicUrl}\n\nWith love,\n${partner1} & ${partner2}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `Wedding_RSVP_QR_${slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("QR code downloaded!", "success");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">💌 Share Wedding & RSVP Link</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Link Box */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Your Shareable RSVP Link</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                className="form-input"
                readOnly
                value={publicUrl}
                style={{ background: "var(--color-background)", fontWeight: "500" }}
              />
              <button
                className={`btn ${copied ? "btn-primary" : "btn-secondary"}`}
                onClick={handleCopy}
                style={{ minWidth: "90px" }}
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <button
              className="btn btn-secondary"
              onClick={handleWhatsApp}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                borderColor: "#25D366",
                color: "#128C7E",
              }}
            >
              <span style={{ fontSize: "18px" }}>💬</span> Share on WhatsApp
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleEmail}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px" }}>✉️</span> Send via Email
            </button>
          </div>

          {/* QR Code Card */}
          <div
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px",
              background: "var(--color-surface)",
              textAlign: "center",
            }}
          >
            <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>
              🖨️ Printable Invitation QR Code
            </h4>
            <p className="text-xs text-muted" style={{ marginBottom: "14px" }}>
              Include this QR code on your printed physical wedding invitation cards!
            </p>

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Wedding RSVP QR Code"
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border-light)",
                  padding: "8px",
                  background: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              />
            ) : (
              <div style={{ width: "180px", height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Generating QR...
              </div>
            )}

            <button
              className="btn btn-tertiary"
              onClick={downloadQrCode}
              style={{ marginTop: "14px", fontSize: "13px" }}
              disabled={!qrDataUrl}
            >
              📥 Download High-Res QR Code (PNG)
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: "24px" }}>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: "none" }}
          >
            🔗 View Public Website
          </a>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
