import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { businessAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { AdminReview, APIResponse } from "@/types";
import type { AxiosResponse } from "axios";

export default function ReviewList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState<{
    reviewId: string;
    businessId: string;
  } | null>(null);

  const { data: response, isLoading } = useQuery<
    AxiosResponse<APIResponse<AdminReview[]>>
  >({
    queryKey: ["reviews", { search: searchQuery }],
    queryFn: () => businessAPI.getAllReviews(searchQuery),
  });

  const reviews = response?.data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: ({
      businessId,
      reviewId,
    }: {
      businessId: string;
      reviewId: string;
    }) => businessAPI.deleteReview(businessId, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({
        title: "Review Deleted",
        description: "The review has been deleted successfully.",
      });
      setReviewToDelete(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete review",
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
        <h1 className="text-3xl font-bold">Manage Reviews</h1>
      </div>

      <div className="mb-8">
        <Input
          placeholder="Search reviews..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review: AdminReview) => (
              <TableRow key={review._id}>
                <TableCell>
                  <Button
                    variant="link"
                    onClick={() => navigate(`/businesses/${review.businessId}`)}
                  >
                    {review.businessName}
                  </Button>
                </TableCell>
                <TableCell>
                  {typeof review.userId === "string"
                    ? "Anonymous"
                    : review.userId.name}
                </TableCell>
                <TableCell>{review.comment}</TableCell>
                <TableCell>
                  {new Date(review.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Dialog
                    open={
                      reviewToDelete?.reviewId === review._id &&
                      reviewToDelete?.businessId === review.businessId
                    }
                    onOpenChange={(open) => {
                      if (!open) setReviewToDelete(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          setReviewToDelete({
                            reviewId: review._id,
                            businessId: review.businessId,
                          })
                        }
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Review</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this review? This
                          action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setReviewToDelete(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (reviewToDelete) {
                              deleteMutation.mutate(reviewToDelete);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            No reviews found
          </h2>
          <p className="mt-2 text-gray-600">
            Try adjusting your search to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
