import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister, RegisterInputRole } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { IonIcon } from "@/components/ui/ion-icon";
import { Spinner } from "@/components/ui/spinner";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as RegisterInputRole,
    department: "",
    phone: "",
    staffId: ""
  });

  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Registration failed",
          description: error.data?.error || "Could not create account",
          variant: "destructive",
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ data: formData });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden py-12">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-lg relative z-10 border-border/50 shadow-xl shadow-black/5">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-2 shadow-md shadow-primary/20">
            <IonIcon name="construct-outline" style={{ fontSize: "28px", color: "white" }} />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Join the University Maintenance Request System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="role">I am a...</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff Member</option>
                  <option value="maintenance_officer">Maintenance Officer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {(formData.role === "staff" || formData.role === "admin") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staffId">Staff ID</Label>
                    <Input
                      id="staffId"
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2 col-span-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base mt-4 gap-2"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? <Spinner className="h-5 w-5" /> : null}
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-primary font-medium hover:underline cursor-pointer">
                Sign in
              </span>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
