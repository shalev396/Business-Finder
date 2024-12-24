import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { businessAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const categories = [
  "Restaurant",
  "Retail",
  "Technology",
  "Healthcare",
  "Education",
  "Entertainment",
  "Other",
];

export default function CreateBusiness() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });

  const createMutation = useMutation({
    mutationFn: () => businessAPI.createBusiness(formData),
    onSuccess: (response) => {
      toast({
        title: "Business Created",
        description: "Your business has been created successfully.",
      });
      navigate(`/businesses/${response.data.data._id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create business",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  // Check if user has reached their business limit
  const canCreateBusiness = () => {
    if (!user) return false;
    // TODO: Add check for current number of businesses owned
    return true;
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Authentication Required
        </h2>
        <p className="mt-2 text-gray-600">
          Please log in to create a business listing.
        </p>
        <Button className="mt-4" onClick={() => navigate("/login")}>
          Log In
        </Button>
      </div>
    );
  }

  if (!canCreateBusiness()) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Business Limit Reached
        </h2>
        <p className="mt-2 text-gray-600">
          You have reached the maximum number of businesses allowed for your
          plan. Please upgrade your plan to create more businesses.
        </p>
        <Button className="mt-4" onClick={() => navigate("/profile")}>
          Upgrade Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Business</CardTitle>
          <CardDescription>
            Fill out the form below to create your business listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
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

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Business"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
