import { InternalAxiosRequestConfig } from "axios";
import { getAuthToken } from "../utils/auth";

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

export const requestErrorInterceptor = (error: any) => {
  return Promise.reject(error);
};
