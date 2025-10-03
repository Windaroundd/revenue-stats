import { AxiosResponse } from "axios";
import { clearAuthData } from "../utils/auth";

export const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

export const responseErrorInterceptor = (error: any) => {
  if (error.response?.status === 401) {
    if (typeof window !== "undefined") {
      clearAuthData();

      window.location.href = "/admin/login";
    }
  }

  if (!error.response) {
    console.error("Network Error:", error.message);
  }

  return Promise.reject(error);
};
