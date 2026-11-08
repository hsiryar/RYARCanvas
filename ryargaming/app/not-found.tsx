import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 34, letterSpacing: "-1px", marginBottom: 10 }}>404 — page not found</h1>
      <p style={{ color: "#5f6368", marginBottom: 26 }}>
        That story isn&apos;t in the archive.
      </p>
      <Link
        href="/"
        style={{ background: "#1a73e8", color: "#fff", padding: "12px 24px", borderRadius: 999, fontSize: 15 }}
      >
        Back to RYAR Gaming
      </Link>
    </div>
  );
}
