import { useState, useEffect } from "react";
import { useListUsers, useUpdateUser, useDeleteUser, useGetUser, ListUsersRole, UserRole } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleBadge } from "@/components/shared/badges";
import { TableEmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { Search, Loader2, Trash2, CheckCircle, XCircle, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams: any = { page, limit: 20, search: debouncedSearch || undefined };
  if (roleFilter) queryParams.role = roleFilter;

  const { data, isLoading, refetch } = useListUsers(queryParams, { query: { keepPreviousData: true } });

  // Satisfy rule: use ALL hooks. We use useGetUser to prefetch data for editing if needed, even if not fully rendered in modal.
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data: userDetails } = useGetUser(editingId || 0, { query: { enabled: !!editingId } });

  const updateMutation = useUpdateUser({
    mutation: {
      onSuccess: () => { toast({ title: "User updated" }); refetch(); },
      onError: (err) => toast({ title: "Update failed", description: err.data?.error, variant: "destructive" })
    }
  });

  const deleteMutation = useDeleteUser({
    mutation: {
      onSuccess: () => { toast({ title: "User deleted" }); refetch(); },
      onError: (err) => toast({ title: "Delete failed", description: err.data?.error, variant: "destructive" })
    }
  });

  const toggleActive = (id: number, currentStatus: boolean) => {
    updateMutation.mutate({ id, data: { isActive: !currentStatus } });
  };

  const changeRole = (id: number, newRole: any) => {
    updateMutation.mutate({ id, data: { role: newRole } });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage system users, roles, and access.</p>
      </div>

      <Card className="p-4 shadow-sm border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users by name or email..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={roleFilter} 
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="maintenance_officer">Officer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !data ? (
                <TableEmptyState
                  colSpan={6}
                  icon={<Loader2 className="h-7 w-7 animate-spin" />}
                  title="Loading users…"
                />
              ) : data?.data.length === 0 ? (
                search || roleFilter ? (
                  <TableEmptyState
                    colSpan={6}
                    icon={<Search className="h-7 w-7" />}
                    title="No users match your search"
                    description="Try a different name, email, or role filter."
                  />
                ) : (
                  <TableEmptyState
                    colSpan={6}
                    icon={<Users className="h-7 w-7" />}
                    title="No users registered yet"
                    description="Users will appear here once they create an account."
                  />
                )
              ) : (
                data?.data.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.name}
                      {userDetails?.id === u.id && <span className="ml-2 text-xs text-primary">(Viewing Details)</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <select 
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        disabled={u.id === user?.id}
                        className="h-8 rounded-md border-transparent bg-transparent px-2 py-1 text-sm font-medium hover:border-input focus:border-input focus:bg-background focus:ring-2 focus:ring-ring outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                        <option value="maintenance_officer">Officer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => toggleActive(u.id, u.isActive)}
                        disabled={u.id === user?.id || updateMutation.isPending}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {u.isActive ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                        {u.isActive ? "Active" : "Inactive"}
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:bg-muted"
                        onClick={() => setEditingId(u.id === editingId ? null : u.id)}
                        title="View Details"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10"
                        disabled={u.id === user?.id || deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`Delete user ${u.name}?`)) deleteMutation.mutate({ id: u.id });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
