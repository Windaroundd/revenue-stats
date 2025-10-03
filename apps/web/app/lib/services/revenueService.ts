import { apiClient } from "../api";
import { API_ENDPOINTS } from "../constants/api";
import type {
  CreateRevenueRequest,
  UpdateRevenueRequest,
  BulkCreateRevenueRequest,
  RevenueResponse,
  RevenueListResponse,
  RevenueQueryParams,
} from "../../types/api";

export const revenueService = {
  getRevenueData: async (
    params?: RevenueQueryParams
  ): Promise<RevenueListResponse> => {
    const response = await apiClient.get<RevenueListResponse>(
      API_ENDPOINTS.REVENUE.BASE,
      {
        params,
      }
    );
    return response.data;
  },

  createRevenueData: async (
    data: CreateRevenueRequest
  ): Promise<RevenueResponse> => {
    const response = await apiClient.post<RevenueResponse>(
      API_ENDPOINTS.REVENUE.BASE,
      data
    );
    return response.data;
  },

  bulkCreateRevenueData: async (
    data: BulkCreateRevenueRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.REVENUE.BULK,
      data
    );
    return response.data;
  },

  getRevenueDataById: async (id: string): Promise<{ data: any }> => {
    const response = await apiClient.get<{ data: any }>(
      API_ENDPOINTS.REVENUE.BY_ID(id)
    );
    return response.data;
  },

  updateRevenueData: async (
    id: string,
    data: UpdateRevenueRequest
  ): Promise<RevenueResponse> => {
    const response = await apiClient.put<RevenueResponse>(
      API_ENDPOINTS.REVENUE.BY_ID(id),
      data
    );
    return response.data;
  },

  deleteRevenueData: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.REVENUE.BY_ID(id)
    );
    return response.data;
  },
};

export default revenueService;
