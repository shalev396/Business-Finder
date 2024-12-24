import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { businessAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import type { Business } from "@/types";

const categories = [
  "All",
  "Restaurant",
  "Retail",
  "Technology",
  "Healthcare",
  "Education",
  "Entertainment",
  "Other",
];

export default function AdminBusinessList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: [
      "businesses",
      { search: searchQuery, category: selectedCategory },
    ],
    queryFn: () =>
      businessAPI.getAllBusinesses(
        searchQuery,
        selectedCategory === "All" ? undefined : selectedCategory
      ),
  });

  const businesses = response?.data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => businessAPI.deleteBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      toast({
        title: "Business Deleted",
        description: "The business has been deleted successfully.",
      });
      setBusinessToDelete(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete business",
      });
    },
  });

  if (!user?.role || user.role !== "admin") {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Businesses</h1>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      ) : businesses.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business: Business) => (
                <TableRow key={business._id}>
                  <TableCell className="font-medium">{business.name}</TableCell>
                  <TableCell>{business.category}</TableCell>
                  <TableCell>
                    {typeof business.owner === "string"
                      ? "Unknown"
                      : business.owner.name}
                  </TableCell>
                  <TableCell>{business.subscribers.length}</TableCell>
                  <TableCell>{business.reviews.length}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/businesses/${business._id}`)}
                    >
                      View
                    </Button>
                    <Dialog
                      open={businessToDelete === business._id}
                      onOpenChange={(open) =>
                        setBusinessToDelete(open ? business._id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Business</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this business? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setBusinessToDelete(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(business._id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            No businesses found
          </h2>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      )}
    </div>
  );
}
