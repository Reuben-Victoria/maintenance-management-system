import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useCreateRequest, useListCategories, RequestInputPriority } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

export default function RequestNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    priority: "low" as RequestInputPriority,
    location: "",
    evidenceUrl: ""
  });

  const { data: categories, isLoading: loadingCategories } = useListCategories();
  
  const createMutation = useCreateRequest({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Request submitted successfully!" });
        setLocation(`/requests/${data.id}`);
      },
      onError: (error) => {
        toast({
          title: "Submission failed",
          description: error.data?.error || "An error occurred",
          variant: "destructive"
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        location: formData.location || undefined,
        evidenceUrl: formData.evidenceUrl || undefined,
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Link href="/requests" className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-4 text-muted-foreground hover:text-foreground" })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Submit Maintenance Request</h1>
        <p className="text-muted-foreground">Report an issue on campus. Please provide as much detail as possible.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="e.g., Broken projector in Room 302" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                minLength={5}
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description <span className="text-red-500">*</span></Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe the issue, symptoms, and any other relevant details..." 
                className="min-h-[120px]"
                value={formData.description} 
                onChange={handleChange} 
                required 
                minLength={10}
                data-testid="input-description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <select 
                  id="categoryId" 
                  name="categoryId" 
                  value={formData.categoryId} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a category</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority <span className="text-red-500">*</span></Label>
                <select 
                  id="priority" 
                  name="priority" 
                  value={formData.priority} 
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="low">Low - No immediate impact</option>
                  <option value="medium">Medium - Causes inconvenience</option>
                  <option value="high">High - Prevents normal work</option>
                  <option value="urgent">Urgent - Safety hazard / Critical failure</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / Room Number</Label>
                <Input 
                  id="location" 
                  name="location" 
                  placeholder="e.g., Engineering Building, Room 402" 
                  value={formData.location} 
                  onChange={handleChange} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidenceUrl">Photo / Evidence URL (Optional)</Label>
                <Input 
                  id="evidenceUrl" 
                  name="evidenceUrl" 
                  placeholder="https://..." 
                  type="url"
                  value={formData.evidenceUrl} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/50 px-6 py-4 bg-muted/20">
            <Link href="/requests" className={buttonVariants({ variant: "ghost", className: "mr-2" })}>Cancel</Link>
            <Button type="submit" disabled={createMutation.isPending || loadingCategories} data-testid="button-submit">
              {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Request
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
