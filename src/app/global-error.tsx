"use client";

/** Last-resort boundary when the root layout itself fails. Keeps dependencies minimal. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#03060b", color: "#f3f7fa" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", color: "#52d4dc" }}>Jarz Digital</p>
          <h1 style={{ fontSize: 40, margin: "16px 0 8px" }}>Something went wrong.</h1>
          <p style={{ color: "#9fb0c1", maxWidth: 480 }}>Please try again. Reference: {error.digest ?? "N/A"}</p>
          <button onClick={reset} style={{ marginTop: 24, padding: "12px 22px", borderRadius: 999, border: 0, background: "#1ec1ca", color: "#03060b", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
