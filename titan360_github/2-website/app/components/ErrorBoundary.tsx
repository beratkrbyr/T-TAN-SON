"use client";
import React from "react";

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] caught:", error, info);
    // Clear stale localStorage data that may have caused the crash
    try {
      localStorage.removeItem("titan360_content");
      localStorage.removeItem("titan360_services");
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif"
        }}>
          <div style={{
            background: "white",
            borderRadius: "1.5rem",
            padding: "3rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            maxWidth: "480px",
            width: "100%"
          }}>
            <div style={{
              width: "64px", height: "64px",
              background: "#f0f9ff",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem"
            }}>
              <svg width="32" height="32" fill="none" stroke="#0284c7" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.75rem" }}>
              Sayfa Yenileniyor
            </h1>
            <p style={{ color: "#64748b", marginBottom: "2rem", lineHeight: 1.6 }}>
              Geçici bir sorun oluştu. Önbellek temizlendi, lütfen sayfayı yenileyin.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(135deg, #059669, #0284c7)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.875rem 2rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
                marginBottom: "0.75rem"
              }}
            >
              Sayfayı Yenile
            </button>
            <a
              href="/"
              style={{
                display: "block",
                color: "#0284c7",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 600
              }}
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
