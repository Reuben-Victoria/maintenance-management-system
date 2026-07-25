import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "wouter";
import { IonIcon } from "@/components/ui/ion-icon";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell } from "recharts";
import { formatDateTime } from "@/lib/utils";

const COLORS = {
  pending: "hsl(38 92% 50%)",
  assigned: "hsl(221 83% 53%)",
  inProgress: "hsl(239 84% 67%)",
  completed: "hsl(142 71% 45%)",
  rejected: "hsl(0 84% 60%)"
};

const PRIORITY_COLORS = {
  low: "hsl(215 16% 47%)",
  medium: "hsl(38 92% 50%)",
  high: "hsl(24 94% 50%)",
  urgent: "hsl(0 84% 60%)"
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: { refetchInterval: 30000 } as any,
  });

  // First arg = query params (limit), second arg = hook options (refetchInterval)
  const { data: activities, isLoading: loadingActivity } = useGetRecentActivity(
    { limit: 5 } as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { query: { refetchInterval: 30000 } as any },
  );

  if (loadingSummary || !summary) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isStudentOrStaff = user?.role === "student" || user?.role === "staff";
  const isOfficer = user?.role === "maintenance_officer";
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}. Here's what's happening.
          </p>
        </div>
        {isStudentOrStaff && (
          <Link
            href="/requests/new"
            className={buttonVariants({ size: "lg", className: "shrink-0 shadow-sm gap-2" })}
          >
            <IonIcon name="add-outline" style={{ fontSize: "20px" }} /> New Request
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin || isOfficer ? (
          <>
            <StatCard title="Total Requests" value={summary.total} iconName="documents-outline" />
            <StatCard title="Pending" value={summary.pending} iconName="time-outline" color="text-amber-500" />
            <StatCard title="In Progress" value={summary.inProgress} iconName="construct-outline" color="text-indigo-500" />
            <StatCard title="Completed" value={summary.completed} iconName="checkmark-circle-outline" color="text-emerald-500" />
          </>
        ) : (
          <>
            <StatCard title="My Requests" value={summary.myRequests || 0} iconName="document-text-outline" />
            <StatCard title="Pending" value={summary.pending} iconName="time-outline" color="text-amber-500" />
            <StatCard title="In Progress" value={summary.inProgress} iconName="construct-outline" color="text-indigo-500" />
            <StatCard title="Completed" value={summary.completed} iconName="checkmark-circle-outline" color="text-emerald-500" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isAdmin && (
          <>
            <Card className="lg:col-span-2 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>Requests by Category</CardTitle>
                <CardDescription>
                  Distribution of maintenance issues across categories
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.byCategory}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {summary.byCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.assigned} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>Priority Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.byPriority}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="priority"
                    >
                      {summary.byPriority.map((entry, index) => (
                        <PieCell
                          key={`cell-${index}`}
                          fill={
                            PRIORITY_COLORS[
                              entry.priority as keyof typeof PRIORITY_COLORS
                            ] || COLORS.assigned
                          }
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="lg:col-span-3 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates on maintenance requests</CardDescription>
            </div>
            <Link
              href="/requests"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "hidden sm:flex gap-1"
              })}
            >
              View All{" "}
              <IonIcon name="arrow-forward-outline" style={{ fontSize: "16px" }} />
            </Link>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="space-y-4 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4 mt-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="mt-0.5 shrink-0">
                      {activity.type === "status_change" && (
                        <IonIcon
                          name="checkmark-circle-outline"
                          style={{ fontSize: "20px", color: "rgb(99 102 241)" }}
                        />
                      )}
                      {activity.type === "assignment" && (
                        <IonIcon
                          name="person-add-outline"
                          style={{ fontSize: "20px", color: "rgb(59 130 246)" }}
                        />
                      )}
                      {activity.type === "new_request" && (
                        <IonIcon
                          name="alert-circle-outline"
                          style={{ fontSize: "20px", color: "rgb(245 158 11)" }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        <Link
                          href={`/requests/${activity.requestId}`}
                          className="hover:underline cursor-pointer"
                        >
                          {activity.requestTitle}
                        </Link>
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        <span className="font-medium text-foreground/80">
                          {activity.actorName}
                        </span>{" "}
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDateTime(activity.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <IonIcon
                  name="document-outline"
                  style={{ fontSize: "32px", opacity: 0.2, display: "block", margin: "0 auto 12px" }}
                />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  iconName,
  color = "text-primary"
}: {
  title: string;
  value: number;
  iconName: string;
  color?: string;
}) {
  return (
    <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-muted/50 ${color}`}>
          <IonIcon name={iconName} style={{ fontSize: "24px" }} />
        </div>
      </CardContent>
    </Card>
  );
}
