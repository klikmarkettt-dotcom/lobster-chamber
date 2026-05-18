export default function Home() {
  return (
    <main style={{
      padding: "60px",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "40px" }}>🦞 Lobster Chamber</h1>
      <p style={{ marginTop: "10px", fontSize: "18px" }}>
        Ultra clean production-ready Next.js app
      </p>

      <button style={{
        marginTop: "30px",
        padding: "12px 24px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        background: "black",
        color: "white"
      }}>
        Support / Donate
      </button>
    </main>
  );
}
