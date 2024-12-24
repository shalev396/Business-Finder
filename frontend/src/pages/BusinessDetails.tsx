import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { businessAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function BusinessDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newReview, setNewReview] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ["business", id],
    queryFn: () => businessAPI.getBusinessById(id!),
  });

  const business = response?.data?.data;

  const isOwner =
    user?._id ===
    (typeof business?.owner === "string"
      ? business?.owner
      : business?.owner._id);
  const isSubscribed =
    user &&
    business?.subscribers.some(
      (sub) => (typeof sub === "string" ? sub : sub._id) === user._id
    );

  const subscribeMutation = useMutation({
    mutationFn: () => businessAPI.subscribeToBusiness(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business", id] });
      toast({
        title: "Subscribed!",
        description: "You will now receive updates for this business.",
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: () => businessAPI.unsubscribeFromBusiness(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business", id] });
      toast({
        title: "Unsubscribed",
        description: "You will no longer receive updates for this business.",
      });
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: () => businessAPI.createReview(id!, { comment: newReview }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business", id] });
      setNewReview("");
      toast({
        title: "Review Added",
        description: "Your review has been added successfully.",
      });
    },
  });

  const deleteBusinessMutation = useMutation({
    mutationFn: () => businessAPI.deleteBusiness(id!),
    onSuccess: () => {
      toast({
        title: "Business Deleted",
        description: "The business has been deleted successfully.",
      });
      navigate("/");
    },
  });

  const handleSubscribeToggle = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to subscribe to businesses.",
      });
      return;
    }

    if (isSubscribed) {
      unsubscribeMutation.mutate();
    } else {
      subscribeMutation.mutate();
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to leave a review.",
      });
      return;
    }

    if (!newReview.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a review.",
      });
      return;
    }

    addReviewMutation.mutate();
  };

  const handleDelete = () => {
    deleteBusinessMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Business not found</h1>
        <p className="mt-2 text-muted-foreground">
          The business you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{business.name}</CardTitle>
              <CardDescription className="text-lg">
                {business.category}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {business.subscribers.length} Subscriber
                {business.subscribers.length !== 1 ? "s" : ""}
              </Badge>
              {isOwner ? (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/businesses/${id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
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
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={deleteBusinessMutation.isPending}
                        >
                          {deleteBusinessMutation.isPending
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <Button
                  variant={isSubscribed ? "outline" : "default"}
                  onClick={handleSubscribeToggle}
                  disabled={
                    subscribeMutation.isPending || unsubscribeMutation.isPending
                  }
                >
                  {subscribeMutation.isPending
                    ? "Subscribing..."
                    : unsubscribeMutation.isPending
                    ? "Unsubscribing..."
                    : isSubscribed
                    ? "Unsubscribe"
                    : "Subscribe"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{business.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Reviews</h3>
            {business.reviews.length > 0 ? (
              <div className="space-y-4">
                {business.reviews.map((review) => (
                  <Card key={review._id}>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        {review.userId &&
                        typeof review.userId === "object" &&
                        review.userId.name
                          ? review.userId.name
                          : "Anonymous"}
                      </CardTitle>
                      <CardDescription>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No reviews yet. Be the first to leave a review!
              </p>
            )}

            {user && !isOwner && (
              <form onSubmit={handleAddReview} className="mt-6 space-y-4">
                <Textarea
                  placeholder="Write your review..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={addReviewMutation.isPending}
                  className="w-full"
                >
                  {addReviewMutation.isPending
                    ? "Adding Review..."
                    : "Add Review"}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
