import React, { useState, ReactNode } from "react";

interface AdminDashboardLayoutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

const styles: { [k: string]: React.CSSProperties } = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    color: "#111827",
    background: "#f9fafb",
  },
  sidebar: {
    width: 260,
    flexShrink: 0,
    background: "#111827",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    transition: "width 200ms ease",
  },
  sidebarCollapsed: {
    width: 72,
  },
  brand: {
    padding: "1rem",
    fontWeight: 700,
    fontSize: 18,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  nav: {
    padding: "0.75rem",
    flex: 1,
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 6,
    color: "rgba(255,255,255,0.9)",
    textDecoration: "none",
    cursor: "pointer",
    marginBottom: 6,
  },
  navItemHover: {
    background: "rgba(255,255,255,0.03)",
  },
  toggleBtn: {
    margin: 12,
    padding: "8px 10px",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    background: "#fff",
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  footer: {
    padding: 12,
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
    borderTop: "1px solid rgba(0,0,0,0.04)",
    background: "#fff",
  },
  profile: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#ef4444",
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
};

export default function AdminDashboardLayout({
  children,
  title = "Admin Dashboard",
  className,
}: AdminDashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "users", label: "Users", icon: "👥" },
    { key: "content", label: "Content", icon: "📚" },
    { key: "settings", label: "Settings", icon: "⚙️" },
    { key: "logout", label: "Sign out", icon: "🔓" },
  ];

  return (
    <div style={styles.root} className={className}>
      <aside
        style={{
          ...styles.sidebar,
          ...(collapsed ? styles.sidebarCollapsed : {}),
        }}
        aria-label="Admin sidebar"
      >
        <div style={styles.brand}>{collapsed ? "AD" : "Admin Dashboard"}</div>

        <nav style={styles.nav} aria-label="Main navigation">
          {navItems.map((it) => (
            <a
              role="button"
              key={it.key}
              style={styles.navItem}
              onClick={(e) => {
                e.preventDefault();
                // placeholder: in host app replace with router navigation
                console.log("navigate:", it.key);
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = styles.navItemHover
                  .background as string)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span aria-hidden style={{ width: 20, textAlign: "center" }}>
                {it.icon}
              </span>
              {!collapsed && <span>{it.label}</span>}
            </a>
          ))}
        </nav>

        <div style={{ padding: 12 }}>
          <button
            onClick={() => setCollapsed((s) => !s)}
            style={styles.toggleBtn}
            aria-pressed={collapsed}
            aria-label="Toggle sidebar"
          >
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <h2 style={styles.title}>{title}</h2>

          <div style={styles.profile}>
            <div style={{ color: "#374151" }}>
              <label htmlFor="search" style={{ fontSize: 13, marginRight: 8 }}>
                Search
              </label>
              <input
                id="search"
                placeholder="Search..."
                style={{
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                }}
              />
            </div>

            <div style={styles.avatar} title="Admin">
              A
            </div>
          </div>
        </header>

        <section style={styles.content}>{children}</section>

        <footer style={styles.footer}>
          © {new Date().getFullYear()} Admin — Built with care.
        </footer>
      </main>
    </div>
  );
}
