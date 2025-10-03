import { AxiosRequestConfig, AxiosResponse } from "axios";
import { apiInstance } from "./config/axios";
import {
  requestInterceptor,
  requestErrorInterceptor,
} from "./interceptors/request";
import {
  responseInterceptor,
  responseErrorInterceptor,
} from "./interceptors/response";

apiInstance.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);
apiInstance.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

const api = apiInstance;

export const apiClient = {
  get: <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => api.get<T>(url, config),

  post: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => api.post<T>(url, data, config),

  put: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => api.put<T>(url, data, config),

  delete: <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => api.delete<T>(url, config),

  patch: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => api.patch<T>(url, data, config),
};

export {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  isAuthenticated,
  getUser,
  setUser,
  clearAuthData,
} from "./utils/auth";

export default api;
