export interface User {
  _id: string;
  name: string;
  email: string;
  plan: "Standard" | "Gold" | "Platinum";
  role?: "user" | "admin";
  savedBusinesses: string[];
}

export interface Business {
  _id: string;
  name: string;
  description: string;
  category: string;
  owner: string | User;
  subscribers: (string | User)[];
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  userId: string | User;
  user?: User;
  comment: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  plan: User["plan"];
}

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateBusinessData {
  name: string;
  description: string;
  category: string;
}

export interface UpdateBusinessData extends Partial<CreateBusinessData> {}

export interface ReviewData {
  comment: string;
}

export interface NotificationData {
  type: "update" | "delete";
  businessId: string;
  businessName: string;
  message: string;
}

export interface AdminReview extends Review {
  businessId: string;
  businessName: string;
}
