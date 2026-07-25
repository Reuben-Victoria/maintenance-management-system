import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListRequests } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/shared/badges";
import { TableEmptyState } from "@/components/shared/empty-state";
import { IonIcon } from "@/components/ui/ion-icon";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function RequestsList() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams: Record<string, unknown> = {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  };

  const { data, isLoading } = useListRequests(queryParams as any, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: { placeholderData: (prev: any) => prev } as any,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Requests</h1>
          <p className="text-muted-foreground">Manage and track service requests across campus.</p>
        </div>
        {(user?.role === "student" || user?.role === "staff") && (
          <Link href="/requests/new" className={buttonVariants({ className: "gap-2" })}>
            <IonIcon name="add-outline" style={{ fontSize: "16px" }} /> New Request
          </Link>
        )}
      </div>

      <Card className="p-4 shadow-sm border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <IonIcon
              name="search-outline"
              style={{ fontSize: "16px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }}
            />
            <Input
              placeholder="Search by title..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="select-status-filter"
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
              data-testid="select-priority-filter"
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
                <TableEmptyState
                  colSpan={7}
                  icon={<Spinner className="h-7 w-7 text-primary" />}
                  title="Loading requests…"
                />
              ) : data?.data.length === 0 ? (
                debouncedSearch || statusFilter || priorityFilter ? (
                  <TableEmptyState
                    colSpan={7}
                    icon={<IonIcon name="options-outline" style={{ fontSize: "28px" }} />}
                    title="No matching requests"
                    description="Try adjusting your search term or filters to find what you're looking for."
                  />
                ) : (
                  <TableEmptyState
                    colSpan={7}
                    icon={<IonIcon name="document-outline" style={{ fontSize: "28px" }} />}
                    title="No requests yet"
                    description={
                      user?.role === "student" || user?.role === "staff"
                        ? "You haven't submitted any maintenance requests. Use the 'New Request' button to get started."
                        : user?.role === "maintenance_officer"
                        ? "No requests have been assigned to you yet."
                        : "No maintenance requests have been submitted yet."
                    }
                    action={
                      user?.role === "student" || user?.role === "staff" ? (
                        <a
                          href="/requests/new"
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          <IonIcon name="add-circle-outline" style={{ fontSize: "16px" }} />
                          Create your first request
                        </a>
                      ) : undefined
                    }
                  />
                )
              ) : (
                data?.data.map((request) => (
                  <TableRow
                    key={request.id}
                    className="group cursor-pointer"
                    data-testid={`row-request-${request.id}`}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{request.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/requests/${request.id}`} className="hover:underline">
                        {request.title}
                      </Link>
                    </TableCell>
                    <TableCell>{request.categoryName || "Uncategorized"}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={request.priority} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/requests/${request.id}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "sm",
                          className: "opacity-0 group-hover:opacity-100 transition-opacity"
                        })}
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">{(page - 1) * 10 + 1}</span> to{" "}
              <span className="font-medium text-foreground">
                {Math.min(page * 10, data.total)}
              </span>{" "}
              of <span className="font-medium text-foreground">{data.total}</span> requests
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-1"
              >
                <IonIcon name="chevron-back-outline" style={{ fontSize: "14px" }} /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 10 >= data.total}
                className="gap-1"
              >
                Next <IonIcon name="chevron-forward-outline" style={{ fontSize: "14px" }} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
