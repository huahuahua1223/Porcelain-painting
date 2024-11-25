"use client";
export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        // backgroundColor: "#f9f9f9",
        color: "#333",
        textAlign: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "6rem",
          fontWeight: "bold",
          // color: "#ff4757",
          marginBottom: "1rem",
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        页面不存在
      </h2>
      <p style={{ fontSize: "1rem", color: "#666", marginBottom: "2rem" }}>
        很抱歉，我们无法找到您请求的页面。您可以检查网址是否正确。
      </p>
      <a
        href="/"
        style={{
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          borderRadius: "5px",
          textDecoration: "none",
          fontWeight: "bold",
          transition: "background-color 0.3s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
      >
        返回首页
      </a>
    </div>
  );
}
