import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import type { ReactNode } from "react";

type PageId = "home" | "map" | "characters" | "timeline" | "highlights" | "themes" | "sources";

const links: Array<{ page: PageId; label: string; href: string }> = [
  { page: "map", label: "设定地图", href: "/map" },
  { page: "characters", label: "人物关系", href: "/characters" },
  { page: "timeline", label: "故事时间线", href: "/timeline" },
  { page: "highlights", label: "重点情节", href: "/highlights" },
  { page: "themes", label: "小说立意", href: "/themes" },
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
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (page: PageId) => {
    setMenuOpen(false);
    onNavigate(page);
  };

  return (
    <div className="app-shell">
      <header className="site-nav" aria-label="主导航">
        <a
          className="brand-mark"
          href="/"
          aria-label="返回首页"
          onClick={(event) => {
            event.preventDefault();
            go("home");
          }}
        >
          第九特区
        </a>
        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
        </button>
        <nav className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          {links.map((link) => (
            <a
              key={link.page}
              className={currentPage === link.page ? "is-active" : ""}
              href={link.href}
              onClick={(event) => {
                event.preventDefault();
                go(link.page);
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
