import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200" },
  assigned: { label: "Assigned", className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200" },
  in_progress: { label: "In Progress", className: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200" },
};

export function StatusBadge({ status, className }: { status: keyof typeof statusConfig | string; className?: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-100 text-gray-800" };
  
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}

const priorityConfig = {
  low: { label: "Low", className: "bg-slate-100 text-slate-700 border-slate-200" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-800 border-orange-200" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-800 border-red-200" },
};

export function PriorityBadge({ priority, className }: { priority: keyof typeof priorityConfig | string; className?: string }) {
  const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, className: "bg-gray-100 text-gray-800" };
  
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}

const roleConfig = {
  student: { label: "Student", className: "bg-slate-100 text-slate-700" },
  staff: { label: "Staff", className: "bg-blue-100 text-blue-700" },
  maintenance_officer: { label: "Officer", className: "bg-teal-100 text-teal-800" },
  admin: { label: "Admin", className: "bg-purple-100 text-purple-800" },
};

export function RoleBadge({ role, className }: { role: keyof typeof roleConfig | string; className?: string }) {
  const config = roleConfig[role as keyof typeof roleConfig] || { label: role, className: "bg-gray-100 text-gray-800" };
  
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
