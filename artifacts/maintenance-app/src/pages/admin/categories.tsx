import { useState } from "react";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableEmptyState } from "@/components/shared/empty-state";
import { IonIcon } from "@/components/ui/ion-icon";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminCategories() {
  const { toast } = useToast();
  const { data: categories, isLoading, refetch } = useListCategories();

  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const createMutation = useCreateCategory({
    mutation: {
      onSuccess: () => {
        toast({ title: "Category added" });
        setNewCatName("");
        setNewCatDesc("");
        refetch();
      },
      onError: (err) =>
        toast({ title: "Failed to add", description: err.data?.error, variant: "destructive" })
    }
  });

  const updateMutation = useUpdateCategory({
    mutation: {
      onSuccess: () => {
        toast({ title: "Category updated" });
        setEditingId(null);
        refetch();
      },
      onError: (err) =>
        toast({ title: "Failed to update", description: err.data?.error, variant: "destructive" })
    }
  });

  const deleteMutation = useDeleteCategory({
    mutation: {
      onSuccess: () => {
        toast({ title: "Category deleted" });
        refetch();
      },
      onError: (err) =>
        toast({ title: "Failed to delete", description: err.data?.error, variant: "destructive" })
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    createMutation.mutate({ data: { name: newCatName, description: newCatDesc } });
  };

  const handleUpdate = (id: number) => {
    if (!editName) return;
    updateMutation.mutate({ id, data: { name: editName, description: editDesc } });
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || "");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage Categories</h1>
        <p className="text-muted-foreground">
          Define the types of maintenance requests users can submit.
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <Input
                placeholder="Category Name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 flex-[2] w-full">
              <Input
                placeholder="Description (Optional)"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={!newCatName || createMutation.isPending}
              className="w-full sm:w-auto shrink-0 gap-2"
            >
              {createMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <IonIcon name="add-outline" style={{ fontSize: "16px" }} />
              )}
              Add Category
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px]">Created</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableEmptyState
                colSpan={4}
                icon={<Spinner className="h-7 w-7 text-primary" />}
                title="Loading categories…"
              />
            ) : categories?.length === 0 ? (
              <TableEmptyState
                colSpan={4}
                icon={<IonIcon name="pricetag-outline" style={{ fontSize: "28px" }} />}
                title="No categories yet"
                description="Add your first category using the form above to let users classify their maintenance requests."
              />
            ) : (
              categories?.map((cat) => (
                <TableRow key={cat.id}>
                  {editingId === cat.id ? (
                    <>
                      <TableCell>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(cat.createdAt)}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(cat.id)}
                          disabled={updateMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {cat.description || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(cat.createdAt)}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(cat)}>
                          <IonIcon name="create-outline" style={{ fontSize: "16px" }} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm("Delete category?"))
                              deleteMutation.mutate({ id: cat.id });
                          }}
                        >
                          <IonIcon name="trash-outline" style={{ fontSize: "16px" }} />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
