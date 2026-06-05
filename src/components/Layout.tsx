import type { ReactNode } from "react";

type PageId = "home" | "map" | "characters" | "timeline" | "sources";

const links: Array<{ page: PageId; label: string; href: string }> = [
  { page: "map", label: "设定地图", href: "/map" },
  { page: "characters", label: "人物关系", href: "/characters" },
  { page: "timeline", label: "故事时间线", href: "/timeline" },
  { page: "sources", label: "资料索引", href: "/sources" }
];

export function Layout({
  children,
  currentPage,
  onNavigate
}: {
  children: ReactNode;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}) {
  return (
    <div className="app-shell">
      <header className="site-nav" aria-label="主导航">
        <a
          className="brand-mark"
          href="/"
          aria-label="返回首页"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("home");
          }}
        >
          第九特区
        </a>
        <nav className="nav-links">
          {links.map((link) => (
            <a
              key={link.page}
              className={currentPage === link.page ? "is-active" : ""}
              href={link.href}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(link.page);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
