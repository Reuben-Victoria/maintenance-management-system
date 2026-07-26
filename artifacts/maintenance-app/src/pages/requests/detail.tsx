import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  useGetRequest,
  useGetRequestLogs,
  useListOfficers,
  useUpdateRequestStatus,
  useAssignRequest,
  useUpdateRequest,
  useDeleteRequest,
  ServiceRequestDetailStatus,
  getGetRequestQueryKey,
  getGetRequestLogsQueryKey,
  getListRequestsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, PriorityBadge } from "@/components/shared/badges";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { IonIcon } from "@/components/ui/ion-icon";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";

export default function RequestDetail() {
  const [, params] = useRoute("/requests/:id");
  const id = Number(params?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useGetRequest(id, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: { enabled: !!id } as any,
  });

  const { data: logs, isLoading: loadingLogs } = useGetRequestLogs(id, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: { enabled: !!id } as any,
  });

  const { data: officers } = useListOfficers({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: { enabled: !!user && (user.role === "admin" || user.role === "maintenance_officer") } as any,
  });

  const [newStatus, setNewStatus] = useState<ServiceRequestDetailStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [assignOfficerId, setAssignOfficerId] = useState<string>("");
  const [assignNote, setAssignNote] = useState("");

  const updateMutation = useUpdateRequest({
    mutation: {
      onSuccess: () => {
        toast({ title: "Request updated" });
        queryClient.invalidateQueries({ queryKey: getGetRequestQueryKey(id) });
      }
    }
  });

  const deleteMutation = useDeleteRequest({
    mutation: {
      onSuccess: () => {
        toast({ title: "Request deleted" });
        window.location.href = "/requests";
      }
    }
  });

  const updateStatusMutation = useUpdateRequestStatus({
    mutation: {
      onSuccess: () => {
        toast({ title: "Status updated successfully" });
        setNewStatus("");
        setStatusNote("");
        queryClient.invalidateQueries({ queryKey: getGetRequestQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetRequestLogsQueryKey(id) });
      },
      onError: (err) =>
        toast({ title: "Failed to update status", description: (err as any).data?.error, variant: "destructive" })
    }
  });

  const assignMutation = useAssignRequest({
    mutation: {
      onSuccess: () => {
        toast({ title: "Officer assigned successfully" });
        setAssignOfficerId("");
        setAssignNote("");
        // Invalidate detail, logs, and the list so the assignment
        // is reflected everywhere without a manual refresh
        queryClient.invalidateQueries({ queryKey: getGetRequestQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetRequestLogsQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
      },
      onError: (err) =>
        toast({ title: "Failed to assign", description: (err as any).data?.error, variant: "destructive" })
    }
  });

  if (isLoading || !request) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  // Only the assigned maintenance officer can update status — NOT admin
  const isAssignedOfficer =
    user?.role === "maintenance_officer" && request.assignment?.officerId === user?.id;
  const canUpdateStatus =
    isAssignedOfficer &&
    request.status !== "completed" &&
    request.status !== "rejected";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Back + title row */}
      <Link
        href="/requests"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "-ml-4 text-muted-foreground hover:text-foreground gap-2"
        })}
      >
        <IonIcon name="arrow-back-outline" style={{ fontSize: "16px" }} /> Back to Requests
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">{request.title}</h1>
            <StatusBadge status={request.status} className="text-sm px-3 py-1 shrink-0" />
          </div>
          <p className="text-muted-foreground font-mono text-sm">
            Request #{request.id} • {request.categoryName || "Uncategorized"}
          </p>
        </div>
        <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end shrink-0">
          <PriorityBadge priority={request.priority} className="w-fit text-sm px-3 py-1" />
          {isAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Delete this request forever?")) deleteMutation.mutate({ id });
              }}
              disabled={deleteMutation.isPending}
              className="gap-2"
            >
              {deleteMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <IonIcon name="trash-outline" style={{ fontSize: "14px" }} />
              )}
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main grid — sidebar comes FIRST on mobile so officer sees assignment/status immediately */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* RIGHT COLUMN: Assignment + Status — order-1 on mobile, order-2 on desktop */}
        <div className="space-y-6 order-1 lg:order-2">

          {/* Assignment card */}
          <Card className="border-border/50 shadow-sm bg-muted/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <IonIcon name="person-outline" style={{ fontSize: "18px", color: "var(--muted-foreground)" }} />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.assignment ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/50">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {request.officerName ? request.officerName.charAt(0) : "O"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{request.officerName}</p>
                      <p className="text-xs text-muted-foreground">
                        Assigned on {formatDateTime(request.assignment.assignedAt)}
                      </p>
                    </div>
                  </div>
                  {request.assignment.notes && (
                    <div className="text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border/50">
                      <span className="font-medium text-foreground block mb-1">Assignment Note:</span>
                      {request.assignment.notes}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 bg-background rounded-lg border border-dashed border-border">
                  Not assigned yet.
                </p>
              )}

              {/* Admin-only: assign / reassign */}
              {isAdmin && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!assignOfficerId) return;
                    assignMutation.mutate({
                      id,
                      data: { officerId: Number(assignOfficerId), notes: assignNote }
                    });
                  }}
                  className="pt-4 border-t border-border/50 space-y-3"
                >
                  <Label className="text-sm font-semibold">Assign / Reassign Officer</Label>
                  <select
                    value={assignOfficerId}
                    onChange={(e) => setAssignOfficerId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select Officer...</option>
                    {officers?.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Optional note..."
                    value={assignNote}
                    onChange={(e) => setAssignNote(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full gap-2"
                    disabled={!assignOfficerId || assignMutation.isPending}
                  >
                    {assignMutation.isPending ? <Spinner className="h-4 w-4" /> : null}
                    Assign
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Update Status — assigned officer only */}
          {canUpdateStatus && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Update Status</CardTitle>
                <CardDescription>Change the progress state of this request.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newStatus) return;
                    updateStatusMutation.mutate({
                      id,
                      data: { status: newStatus as any, note: statusNote }
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>New Status</Label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select Status...</option>
                      {request.status === "pending" && (
                        <option value="assigned">Assigned</option>
                      )}
                      {(request.status === "pending" || request.status === "assigned") && (
                        <option value="in_progress">In Progress</option>
                      )}
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status Note (Optional)</Label>
                    <Textarea
                      placeholder="Why was this status changed?"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={!newStatus || updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? <Spinner className="h-4 w-4" /> : null}
                    Update Status
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* LEFT COLUMN: Description + History — order-2 on mobile, order-1 on desktop */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">

          {/* Details card */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        const newDesc = prompt("Update description:", request.description);
                        if (newDesc && newDesc !== request.description)
                          updateMutation.mutate({ id, data: { description: newDesc } });
                      }}
                    >
                      <IonIcon name="create-outline" style={{ fontSize: "12px" }} /> Edit
                    </Button>
                  )}
                </div>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {request.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 sm:gap-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <IonIcon name="person-circle-outline" style={{ fontSize: "16px", color: "var(--muted-foreground)" }} />
                  <span className="text-muted-foreground">By:</span>
                  <span className="font-medium">{request.submitterName}</span>
                </div>
                {request.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <IonIcon name="location-outline" style={{ fontSize: "16px", color: "var(--muted-foreground)" }} />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{request.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <IonIcon name="calendar-outline" style={{ fontSize: "16px", color: "var(--muted-foreground)" }} />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatDateTime(request.createdAt)}</span>
                </div>
              </div>

              {request.evidenceUrl && (
                <div className="pt-4 border-t border-border/50">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <IonIcon name="image-outline" style={{ fontSize: "16px" }} /> Attached Evidence
                  </h3>
                  <a
                    href={request.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block max-w-sm rounded-lg overflow-hidden border border-border/50 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={request.evidenceUrl}
                      alt="Evidence"
                      className="w-full h-auto object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="p-3 bg-muted/50 text-sm truncate">{request.evidenceUrl}</div>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History — scrollable */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <IonIcon name="time-outline" style={{ fontSize: "20px", color: "var(--muted-foreground)" }} />
                Status History
              </CardTitle>
              {logs && logs.length > 3 && (
                <p className="text-xs text-muted-foreground mt-1">Scroll to see all {logs.length} entries</p>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {loadingLogs ? (
                <div className="p-6">
                  <EmptyState icon={<Spinner className="h-7 w-7 text-primary" />} title="Loading history…" />
                </div>
              ) : logs && logs.length > 0 ? (
                /* Scrollable timeline container */
                <div className="max-h-[500px] overflow-y-auto px-6 pb-6 pt-2">
                  <div className="space-y-4 relative before:absolute before:left-5 before:top-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {logs.map((log) => (
                      <div key={log.id} className="relative flex items-start gap-4 pl-14">
                        {/* Timeline dot */}
                        <div className="absolute left-0 w-10 h-10 rounded-full border-4 border-background bg-muted flex items-center justify-center shadow shrink-0 z-10">
                          <IonIcon name="checkmark-circle-outline" style={{ fontSize: "16px" }} />
                        </div>
                        {/* Card */}
                        <div className="flex-1 p-4 rounded-xl border border-border/50 bg-card shadow-sm">
                          <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                            <StatusBadge status={log.newStatus} className="text-[10px] px-2 py-0 h-5" />
                            <time className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDateTime(log.createdAt)}
                            </time>
                          </div>
                          <p className="text-sm font-medium mt-2">{log.changedByName}</p>
                          {log.note && (
                            <p className="text-sm text-muted-foreground mt-1 bg-muted/30 p-2 rounded-md">
                              {log.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState
                    icon={<IonIcon name="clipboard-outline" style={{ fontSize: "28px" }} />}
                    title="No history yet"
                    description="Status changes and updates will appear here once activity begins on this request."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
