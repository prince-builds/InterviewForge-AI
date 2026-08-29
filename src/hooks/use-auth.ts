"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/services/api";
import { useAuthStore, useProfileStore } from "@/store";
import { apiClient } from "@/lib/api-client";

export function useLogin() {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: async (tokens) => {
      apiClient.login(tokens);
      const user = await authApi.me();
      login(tokens, user);
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.detail ??
        (err?.message === "Network Error" || !err?.response
          ? "Unable to connect to backend server. Please verify the backend is running."
          : "Invalid email or password");
      toast.error(msg);
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      email,
      password,
      full_name,
    }: {
      email: string;
      password: string;
      full_name?: string;
    }) => authApi.register(email, password, full_name),
    onSuccess: () => {
      toast.success("Account created! Please log in.");
      router.push("/login");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.detail ??
        (err?.message === "Network Error" || !err?.response
          ? "Unable to connect to backend server. Please verify the backend is running."
          : "Registration failed");
      toast.error(msg);
    },
  });
}

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
