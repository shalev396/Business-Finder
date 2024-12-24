import axios from "axios";
import type {
  APIResponse,
  AuthResponse,
  Business,
  CreateBusinessData,
  LoginCredentials,
  ReviewData,
  SignupCredentials,
  UpdateBusinessData,
  User,
  Review,
  AdminReview,
} from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials: LoginCredentials) =>
    api.post<APIResponse<AuthResponse>>("/auth/login", credentials),

  signup: (credentials: SignupCredentials) =>
    api.post<APIResponse<AuthResponse>>("/auth/signup", credentials),

  logout: () => api.post<APIResponse<null>>("/auth/logout"),

  getCurrentUser: () => api.get<APIResponse<User>>("/auth/me"),
};

export const businessAPI = {
  getAllBusinesses: (search?: string, category?: string, onlyOwned?: boolean) =>
    api.get<APIResponse<Business[]>>("/businesses", {
      params: { search, category, onlyOwned },
    }),

  getBusinessById: (id: string) =>
    api.get<APIResponse<Business>>(`/businesses/${id}`),

  createBusiness: (data: CreateBusinessData) =>
    api.post<APIResponse<Business>>("/businesses", data),

  updateBusiness: (id: string, data: UpdateBusinessData) =>
    api.put<APIResponse<Business>>(`/businesses/${id}`, data),

  deleteBusiness: (id: string) =>
    api.delete<APIResponse<null>>(`/businesses/${id}`),

  subscribeToBusiness: (id: string) =>
    api.post<APIResponse<null>>(`/businesses/${id}/subscribe`),

  unsubscribeFromBusiness: (id: string) =>
    api.delete<APIResponse<null>>(`/businesses/${id}/subscribe`),

  saveBusiness: (id: string) =>
    api.post<APIResponse<null>>(`/businesses/${id}/save`),

  unsaveBusiness: (id: string) =>
    api.delete<APIResponse<null>>(`/businesses/${id}/save`),

  // Review-related methods
  createReview: (id: string, data: ReviewData) =>
    api.post<APIResponse<Review>>(`/businesses/${id}/review`, data),

  deleteReview: (businessId: string, reviewId: string) =>
    api.delete<APIResponse<void>>(
      `/businesses/${businessId}/review/${reviewId}`
    ),

  getReviews: (id: string) =>
    api.get<APIResponse<Review[]>>(`/businesses/${id}/reviews`),

  getAllReviews: (search?: string) =>
    api.get<APIResponse<AdminReview[]>>("/admin/reviews", {
      params: { search },
    }),
};

export const userAPI = {
  upgradePlan: (plan: User["plan"]) =>
    api.post<APIResponse<User>>("/users/upgrade-plan", { plan }),

  getSavedBusinesses: () =>
    api.get<APIResponse<Business[]>>("/users/saved-businesses"),
};
