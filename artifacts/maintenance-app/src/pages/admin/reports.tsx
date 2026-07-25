import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IonIcon } from "@/components/ui/ion-icon";
import { useAuth } from "@/hooks/use-auth";

export default function AdminReports() {
  const { token } = useAuth();
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleExport = () => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const url = `/api/reports/export?${params.toString()}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `maintenance_report_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Export Reports</h1>
        <p className="text-muted-foreground">Download system data for external analysis.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IonIcon
              name="document-text-outline"
              style={{ fontSize: "20px", color: "hsl(var(--primary))" }}
            />
            Requests Export
          </CardTitle>
          <CardDescription>
            Filter requests by status and date range before exporting to CSV.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Status Filter</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleExport} className="w-full md:w-auto gap-2">
            <IonIcon name="download-outline" style={{ fontSize: "16px" }} />
            Download CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
