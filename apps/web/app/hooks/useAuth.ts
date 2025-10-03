"use client";

import { useState, useEffect, useCallback } from "react";
import { authService } from "../lib/services/authService";
import {
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  setUser,
  clearAuthData,
} from "../lib/utils/auth";
import type { Admin, LoginRequest, RegisterRequest } from "../types/api";

interface AuthState {
  user: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();

      if (token) {
        try {
          setAuthToken(token);

          const profileResponse = await authService.getProfile();

          setState({
            user: profileResponse.admin,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          clearAuthData();
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);

      setAuthToken(response.token);
      setUser(response.admin);

      setState({
        user: response.admin,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      const response = await authService.register(userData);

      setAuthToken(response.token);
      setUser(response.admin);

      setState({
        user: response.admin,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.isAuthenticated) return;

    try {
      const profileResponse = await authService.getProfile();
      setState((prev) => ({
        ...prev,
        user: profileResponse.admin,
      }));
    } catch (error) {
      logout();
      throw error;
    }
  }, [state.isAuthenticated, logout]);

  return {
    ...state,
    login,
    register,
    logout,
    refreshProfile,
  };
};

export default useAuth;
