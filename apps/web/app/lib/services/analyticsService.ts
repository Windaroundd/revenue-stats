import { apiClient } from "../api";
import { API_ENDPOINTS } from "../constants/api";
import type {
  CurrentWeekAnalyticsResponse,
  WeekComparisonResponse,
  DateRangeAnalyticsResponse,
  SummaryResponse,
  WeekComparisonQueryParams,
  DateRangeQueryParams,
} from "../../types/api";

export const analyticsService = {
  getCurrentWeekAnalytics: async (): Promise<CurrentWeekAnalyticsResponse> => {
    const response = await apiClient.get<CurrentWeekAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.CURRENT_WEEK
    );
    return response.data;
  },

  getWeekComparison: async (
    params: WeekComparisonQueryParams
  ): Promise<WeekComparisonResponse> => {
    const response = await apiClient.get<WeekComparisonResponse>(
      API_ENDPOINTS.ANALYTICS.WEEK_COMPARISON,
      {
        params,
      }
    );
    return response.data;
  },

  getAnalyticsByDateRange: async (
    params: DateRangeQueryParams
  ): Promise<DateRangeAnalyticsResponse> => {
    const response = await apiClient.get<DateRangeAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.DATE_RANGE,
      {
        params,
      }
    );
    return response.data;
  },

  getSummaryStats: async (): Promise<SummaryResponse> => {
    const response = await apiClient.get<SummaryResponse>(
      API_ENDPOINTS.ANALYTICS.SUMMARY
    );
    return response.data;
  },
};

export default analyticsService;
