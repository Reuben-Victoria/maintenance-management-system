import { useState } from "react";
import { Link } from "wouter";
import { useListRequests, ListRequestsStatus, ListRequestsPriority } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/shared/badges";
import { formatDate } from "@/lib/utils";
import { Search, Filter, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function RequestsList() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Simple debounce for search
  import("react").then(React => {
    React.useEffect(() => {
      const timer = setTimeout(() => setDebouncedSearch(search), 500);
      return () => clearTimeout(timer);
    }, [search]);
  });

  const queryParams: any = {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  };

  if (statusFilter) queryParams.status = statusFilter;
  if (priorityFilter) queryParams.priority = priorityFilter;

  // Filter based on role automatically if needed (though backend might handle it)
  // If backend handles filtering by role automatically, we just pass params.
  // Actually, usually student sees theirs, officer sees theirs.
  
  const { data, isLoading } = useListRequests(queryParams, {
    query: { keepPreviousData: true }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Requests</h1>
          <p className="text-muted-foreground">Manage and track service requests across campus.</p>
        </div>
        {(user?.role === "student" || user?.role === "staff") && (
          <Link href="/requests/new" className={buttonVariants()}>
              <Plus className="mr-2 h-4 w-4" /> New Request
          </Link>
        )}
      </div>

      <Card className="p-4 shadow-sm border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title or ID..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            <select 
              value={priorityFilter} 
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !data ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No requests found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((request) => (
                  <TableRow key={request.id} className="group cursor-pointer">
                    <TableCell className="font-mono text-xs text-muted-foreground">#{request.id}</TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/requests/${request.id}`} className="hover:underline">
                        {request.title}
                      </Link>
                    </TableCell>
                    <TableCell>{request.categoryName || "Uncategorized"}</TableCell>
                    <TableCell><StatusBadge status={request.status} /></TableCell>
                    <TableCell><PriorityBadge priority={request.priority} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(request.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/requests/${request.id}`} className={buttonVariants({ variant: "ghost", size: "sm", className: "opacity-0 group-hover:opacity-100 transition-opacity" })}>
                          View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, data.total)}</span> of <span className="font-medium text-foreground">{data.total}</span> requests
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= data.total}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
