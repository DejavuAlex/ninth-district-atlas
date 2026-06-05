import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="site-nav" aria-label="主导航">
        <a className="brand-mark" href="#top" aria-label="返回首页">
          第九特区
        </a>
        <nav className="nav-links">
          <a href="#map">设定地图</a>
          <a href="#characters">人物关系</a>
          <a href="#timeline">故事时间线</a>
          <a href="#sources">资料索引</a>
        </nav>
      </header>
      {children}
    </div>
  );
}
