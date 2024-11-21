export default function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>404 - 页面不存在</h1>
      <p>我们无法找到您请求的页面。</p>
      <a href="/" style={{ color: "blue", textDecoration: "underline" }}>返回首页</a>
    </div>
  );
}
