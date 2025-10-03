import axios, { AxiosInstance } from "axios";
import { API_BASE_URL, API_CONFIG } from "../constants/api";

export const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
  });
};

export const apiInstance = createAxiosInstance();
