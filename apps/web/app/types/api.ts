// API Types based on backend models

export interface Admin {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueData {
  _id: string;
  date: string;
  dayOfWeek: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  posRevenue: number;
  eatclubRevenue: number;
  labourCosts: number;
  totalCovers: number;
  events?: Array<{
    name: string;
    impact: "positive" | "negative";
  }>;
  weekNumber: number;
  year: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: "admin" | "super_admin";
}

export interface AuthResponse {
  message: string;
  token: string;
  admin: Admin;
}

export interface ProfileResponse {
  admin: Admin;
}

// Revenue API Types
export interface CreateRevenueRequest {
  date: string;
  posRevenue: number;
  eatclubRevenue: number;
  labourCosts: number;
  totalCovers: number;
  events?: Array<{
    name: string;
    impact: "positive" | "negative";
  }>;
}

export interface UpdateRevenueRequest {
  posRevenue?: number;
  eatclubRevenue?: number;
  labourCosts?: number;
  totalCovers?: number;
  events?: Array<{
    name: string;
    impact: "positive" | "negative";
  }>;
}

export interface RevenueResponse {
  message: string;
  data: RevenueData;
}

export interface RevenueListResponse {
  data: RevenueData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BulkCreateRevenueRequest {
  data: CreateRevenueRequest[];
}

// Analytics API Types
export interface WeekStats {
  totalRevenue: number;
  totalPosRevenue: number;
  totalEatclubRevenue: number;
  totalLabourCosts: number;
  totalCovers: number;
  averagePerDay: number;
  averageCoversPerDay: number;
  daysCount: number;
}

export interface WeekData {
  year: number;
  weekNumber: number;
  data: RevenueData[];
  stats: WeekStats;
}

export interface Comparison {
  totalRevenueChange: number;
  averagePerDayChange: number;
  totalCoversChange: number;
}

export interface CurrentWeekAnalyticsResponse {
  currentWeek: WeekData;
  previousWeek: WeekData | null;
  comparison: Comparison;
}

export interface WeekComparisonResponse {
  currentWeek: WeekData;
  previousWeek: WeekData | null;
  comparison: Comparison;
}

export interface DateRangeAnalyticsResponse {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  data: RevenueData[];
  stats: WeekStats;
}

export interface SummaryStats {
  totalRevenue: number;
  totalPosRevenue: number;
  totalEatclubRevenue: number;
  totalLabourCosts: number;
  totalCovers: number;
  averageRevenue: number;
  averageCovers: number;
  recordCount: number;
}

export interface SummaryResponse {
  stats: SummaryStats;
}

// Common API Response Types
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Query Parameters
export interface RevenueQueryParams {
  year?: number;
  weekNumber?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface WeekComparisonQueryParams {
  year: number;
  weekNumber: number;
}

export interface DateRangeQueryParams {
  startDate: string;
  endDate: string;
}
