export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3214";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },

  REVENUE: {
    BASE: "/admin/revenue",
    BULK: "/admin/revenue/bulk",
    BY_ID: (id: string) => `/admin/revenue/${id}`,
  },

  ANALYTICS: {
    CURRENT_WEEK: "/analytics/current-week",
    WEEK_COMPARISON: "/analytics/week-comparison",
    DATE_RANGE: "/analytics/date-range",
    SUMMARY: "/analytics/summary",
  },
} as const;

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
  },
} as const;
