import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { businessAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { Business, APIResponse } from "@/types";
import type { AxiosResponse } from "axios";

type PlanType = "Standard" | "Gold" | "Platinum";

const plans = [
  {
    name: "Standard" as PlanType,
    description: "Perfect for individuals starting out",
    features: ["Create 1 business listing", "Basic analytics", "Email support"],
    price: "Free",
  },
  {
    name: "Gold" as PlanType,
    description: "Great for small business owners",
    features: [
      "Create up to 3 business listings",
      "Advanced analytics",
      "Priority support",
    ],
    price: "$9.99/month",
  },
  {
    name: "Platinum" as PlanType,
    description: "Best for established businesses",
    features: [
      "Create up to 10 business listings",
      "Premium analytics",
      "24/7 phone support",
    ],
    price: "$24.99/month",
  },
];

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    (user?.plan as PlanType) || "Standard"
  );

  const { data: response, isLoading } = useQuery<
    AxiosResponse<APIResponse<Business[]>>
  >({
    queryKey: ["businesses", { onlyOwned: true }],
    queryFn: () => businessAPI.getAllBusinesses(undefined, undefined, true),
    enabled: !!user,
  });

  const businesses = response?.data?.data || [];

  const upgradePlanMutation = useMutation({
    mutationFn: (plan: PlanType) =>
      // TODO: Implement plan upgrade API endpoint
      Promise.resolve({ data: { plan } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Plan Upgraded",
        description: `Your plan has been upgraded to ${selectedPlan}`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to upgrade plan",
      });
    },
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Authentication Required
        </h2>
        <p className="mt-2 text-gray-600">
          Please log in to view your profile.
        </p>
        <Button className="mt-4" onClick={() => navigate("/login")}>
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            View and manage your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Name</h3>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>
          <div>
            <h3 className="font-medium">Email</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <h3 className="font-medium">Current Plan</h3>
            <Badge variant="secondary" className="mt-1">
              {user.plan}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Businesses</CardTitle>
          <CardDescription>Manage your business listings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          ) : businesses.length > 0 ? (
            <div className="space-y-4">
              {businesses.map((business: Business) => (
                <div
                  key={business._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{business.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {business.category}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/businesses/${business._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              You haven't created any businesses yet.
            </p>
          )}
          <Button
            className="mt-4 w-full"
            onClick={() => navigate("/businesses/create")}
          >
            Create New Business
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade Plan</CardTitle>
          <CardDescription>
            Choose a plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select
            value={selectedPlan}
            onValueChange={(value: PlanType) => setSelectedPlan(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.name} value={plan.name}>
                  {plan.name} - {plan.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  selectedPlan === plan.name
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                {selectedPlan === plan.name && (
                  <div className="absolute -top-2 -right-2">
                    <Badge>Selected</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold mb-4">{plan.price}</p>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            className="w-full"
            disabled={
              selectedPlan === user.plan || upgradePlanMutation.isPending
            }
            onClick={() => upgradePlanMutation.mutate(selectedPlan)}
          >
            {upgradePlanMutation.isPending
              ? "Upgrading..."
              : selectedPlan === user.plan
              ? "Current Plan"
              : "Upgrade Plan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
