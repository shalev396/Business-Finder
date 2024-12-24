import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { businessAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { Business } from "@/types";

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isOwner =
    user?._id ===
    (typeof business.owner === "string" ? business.owner : business.owner._id);
  const isSubscribed =
    user &&
    business.subscribers.some(
      (sub) => (typeof sub === "string" ? sub : sub._id) === user._id
    );

  const subscribeMutation = useMutation({
    mutationFn: () => businessAPI.subscribeToBusiness(business._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      toast({
        title: "Subscribed!",
        description: "You will now receive updates for this business.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to subscribe",
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: () => businessAPI.unsubscribeFromBusiness(business._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      toast({
        title: "Unsubscribed",
        description: "You will no longer receive updates for this business.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to unsubscribe",
      });
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{business.name}</CardTitle>
            <CardDescription>{business.category}</CardDescription>
          </div>
          <Badge variant="secondary">
            {business.subscribers.length} Subscriber
            {business.subscribers.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-muted-foreground">
          {business.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link to={`/businesses/${business._id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
        {!isOwner && (
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
      </CardFooter>
    </Card>
  );
}
