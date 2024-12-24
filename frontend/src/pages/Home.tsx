import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { businessAPI } from "@/services/api";
import { BusinessCard } from "@/components/BusinessCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Business } from "@/types";
import type { AxiosResponse } from "axios";

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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: response, isLoading } = useQuery<
    AxiosResponse<{ data: Business[] }>
  >({
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically re-run due to the queryKey dependency
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Find Local Businesses</h1>
        <p className="text-muted-foreground">
          Discover and connect with businesses in your area
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
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
          <Button type="submit">Search</Button>
        </form>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[300px] rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : businesses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard key={business._id} business={business} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            No businesses found
          </h2>
          <p className="mt-2 text-gray-600">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      )}
    </div>
  );
}
