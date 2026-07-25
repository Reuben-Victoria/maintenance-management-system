import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";

// Lazy-loaded or direct imports
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import RequestsList from "@/pages/requests/index";
import RequestNew from "@/pages/requests/new";
import RequestDetail from "@/pages/requests/detail";
import AdminUsers from "@/pages/admin/users";
import AdminCategories from "@/pages/admin/categories";
import AdminReports from "@/pages/admin/reports";
import Profile from "@/pages/profile";

function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
    </div>
  );
}

function ProtectedRoute({ component: Component, roles }: { component: any, roles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && roles && !roles.includes(user.role)) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation, roles]);

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (roles && !roles.includes(user.role)) {
    return null; // will redirect in effect
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function PublicOnlyRoute({ component: Component }: { component: any }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (user) return null;

  return <Component />;
}

export function Router() {
  return (
    <Switch>
      <Route path="/" component={() => {
        const { user } = useAuth();
        const [, setLocation] = useLocation();
        useEffect(() => { setLocation(user ? "/dashboard" : "/login"); }, [user]);
        return null;
      }} />
      <Route path="/login" component={() => <PublicOnlyRoute component={Login} />} />
      <Route path="/register" component={() => <PublicOnlyRoute component={Register} />} />
      
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      
      <Route path="/requests" component={() => <ProtectedRoute component={RequestsList} />} />
      <Route path="/requests/new" component={() => <ProtectedRoute component={RequestNew} />} />
      <Route path="/requests/:id" component={() => <ProtectedRoute component={RequestDetail} />} />
      
      <Route path="/admin/users" component={() => <ProtectedRoute component={AdminUsers} roles={["admin"]} />} />
      <Route path="/admin/categories" component={() => <ProtectedRoute component={AdminCategories} roles={["admin"]} />} />
      <Route path="/admin/reports" component={() => <ProtectedRoute component={AdminReports} roles={["admin"]} />} />
      
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}
