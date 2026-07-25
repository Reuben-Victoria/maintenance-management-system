import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn, getInitials } from "@/lib/utils";
import { IonIcon } from "@/components/ui/ion-icon";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "grid-outline",
    roles: ["student", "staff", "maintenance_officer", "admin"],
  },
  {
    label: "Requests",
    href: "/requests",
    icon: "document-text-outline",
    roles: ["student", "staff", "maintenance_officer", "admin"],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "people-outline",
    roles: ["admin"],
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: "folder-open-outline",
    roles: ["admin"],
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: "bar-chart-outline",
    roles: ["admin"],
  },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const allowedNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex md:flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50 bg-sidebar">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-9 w-9 bg-sidebar-primary rounded-lg flex items-center justify-center shadow-sm">
              <IonIcon
                name="construct-outline"
                style={{ fontSize: "20px", color: "white" }}
              />
            </div>
            <div className="leading-tight">
              <span className="text-sidebar-foreground font-bold text-base tracking-tight block">
                UMRS
              </span>
              <span className="text-sidebar-foreground/40 text-[10px] tracking-wide uppercase block">
                Maintenance
              </span>
            </div>
          </div>
          <button
            className="md:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <IonIcon name="close-outline" style={{ fontSize: "22px" }} />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {allowedNavItems.map((item) => {
            const isActive =
              location === item.href ||
              location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <IonIcon name={item.icon} style={{ fontSize: "18px" }} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-sidebar-border/50">
          <Link href="/profile">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors cursor-pointer mb-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-xs font-bold shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate capitalize">
                  {user.role.replace("_", " ")}
                </p>
              </div>
            </div>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 gap-2"
            onClick={logout}
          >
            <IonIcon name="log-out-outline" style={{ fontSize: "16px" }} />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b bg-card shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-foreground/70 hover:text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <IonIcon name="menu-outline" style={{ fontSize: "22px" }} />
            </button>
            <h1 className="text-xl font-semibold capitalize hidden sm:block">
              {location.split("/")[1] || "Dashboard"}
            </h1>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-background">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
