import { useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useCreateRequest, useListCategories, RequestInputPriority } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, UploadCloud, X, Image as ImageIcon } from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function uploadFile(file: File, token: string | null): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json();
  return json.url as string;
}

export default function RequestNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    priority: "low" as RequestInputPriority,
    location: "",
  });

  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; preview: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: categories, isLoading: loadingCategories } = useListCategories();

  const createMutation = useCreateRequest({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Request submitted successfully!" });
        setLocation(`/requests/${data.id}`);
      },
      onError: (error: any) => {
        toast({
          title: "Submission failed",
          description: error.data?.error || "An error occurred",
          variant: "destructive",
        });
      },
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    setUploading(true);
    try {
      const url = await uploadFile(file, token);
      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : null;
      setUploadedFile({ name: file.name, url, preview });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload the file. Try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveFile = () => {
    if (uploadedFile?.preview) URL.revokeObjectURL(uploadedFile.preview);
    setUploadedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        location: formData.location || undefined,
        evidenceUrl: uploadedFile?.url || undefined,
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Link
        href="/requests"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-4 text-muted-foreground hover:text-foreground" })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Submit Maintenance Request</h1>
        <p className="text-muted-foreground">Report an issue on campus. Please provide as much detail as possible.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Issue Title <span className="text-red-500">*</span>
              </Label>
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Detailed Description <span className="text-red-500">*</span>
              </Label>
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

            {/* Category / Priority / Location */}
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
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="low">Low — No immediate impact</option>
                  <option value="medium">Medium — Causes inconvenience</option>
                  <option value="high">High — Prevents normal work</option>
                  <option value="urgent">Urgent — Safety hazard / Critical failure</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location / Room Number</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Engineering Building, Room 402"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Photo / Evidence (Optional)</Label>

              {uploadedFile ? (
                <div className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt="Preview"
                      className="h-20 w-20 rounded-md object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-md border border-border bg-muted flex items-center justify-center shrink-0">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Uploaded successfully</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile} className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Uploading…</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload image or PDF</p>
                      <p className="text-xs text-muted-foreground">JPEG, PNG, GIF, WebP, PDF — max 10 MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="input-file"
                  />
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t border-border/50 px-6 py-4 bg-muted/20">
            <Link href="/requests" className={buttonVariants({ variant: "ghost", className: "mr-2" })}>
              Cancel
            </Link>
            <Button type="submit" disabled={createMutation.isPending || loadingCategories || uploading} data-testid="button-submit">
              {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Request
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
