import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { IonIcon } from "@/components/ui/ion-icon";
import { Spinner } from "@/components/ui/spinner";
import { RoleBadge } from "@/components/shared/badges";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    phone: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        department: user.department || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  const updateMutation = useUpdateUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "Profile updated successfully!" });
      },
      onError: (err) => {
        toast({ title: "Update failed", description: err.data?.error, variant: "destructive" });
      }
    }
  });

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: user.id,
      data: {
        name: formData.name,
        department: formData.department,
        phone: formData.phone
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-border/50 shadow-sm h-fit">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-4 border-background shadow-sm">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
              <RoleBadge role={user.role} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-border/50 shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <IonIcon name="person-outline" style={{ fontSize: "14px", color: "var(--muted-foreground)" }} />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <IonIcon name="mail-outline" style={{ fontSize: "14px", color: "var(--muted-foreground)" }} />
                  Email Address
                </Label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>

              {(user.role === "staff" ||
                user.role === "admin" ||
                user.role === "maintenance_officer") && (
                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center gap-2">
                    <IonIcon name="business-outline" style={{ fontSize: "14px", color: "var(--muted-foreground)" }} />
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              )}

              {user.staffId && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <IonIcon name="shield-checkmark-outline" style={{ fontSize: "14px", color: "var(--muted-foreground)" }} />
                    Staff ID
                  </Label>
                  <Input
                    value={user.staffId}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <IonIcon name="call-outline" style={{ fontSize: "14px", color: "var(--muted-foreground)" }} />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-border/50 px-6 py-4 bg-muted/20">
              <Button
                type="submit"
                disabled={updateMutation.isPending || formData.name === ""}
                data-testid="button-save-profile"
                className="gap-2"
              >
                {updateMutation.isPending ? <Spinner className="h-4 w-4" /> : null}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
