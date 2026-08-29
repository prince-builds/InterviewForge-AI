import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Profile, User } from "@/types";
import { apiClient } from "@/lib/api-client";

// ── Auth Store ────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (tokens: { access_token: string; refresh_token: string }, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,

        setUser: (user) =>
          set({ user, isAuthenticated: !!user }),

        login: (tokens, user) => {
          apiClient.login(tokens);
          set({ user, isAuthenticated: true });
        },

        logout: () => {
          apiClient.clearTokens();
          set({ user: null, isAuthenticated: false });
        },

        setLoading: (isLoading) => set({ isLoading }),
      }),
      {
        name: "auth-store",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: "AuthStore" }
  )
);

// ── Profile Store ─────────────────────────────────────────────────────────────

interface ProfileState {
  activeProfile: Profile | null;
  profiles: Profile[];
  setActiveProfile: (profile: Profile | null) => void;
  setProfiles: (profiles: Profile[]) => void;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set) => ({
        activeProfile: null,
        profiles: [],

        setActiveProfile: (activeProfile) => set({ activeProfile }),
        setProfiles: (profiles) => {
          set({ profiles });
          // Auto-select default profile
          const defaultProfile = profiles.find((p) => p.is_default);
          if (defaultProfile) {
            set((state) =>
              state.activeProfile ? state : { activeProfile: defaultProfile }
            );
          }
        },
      }),
      {
        name: "profile-store",
        partialize: (state) => ({ activeProfile: state.activeProfile }),
      }
    ),
    { name: "ProfileStore" }
  )
);

// ── UI Store ──────────────────────────────────────────────────────────────────

interface UIState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        isSidebarOpen: true,
        isSidebarCollapsed: false,
        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
        setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
      }),
      { name: "ui-store" }
    ),
    { name: "UIStore" }
  )
);

// ── Interview Session Store ───────────────────────────────────────────────────

interface InterviewSessionState {
  currentInterviewId: string | null;
  currentAnswer: string;
  setCurrentInterviewId: (id: string | null) => void;
  setCurrentAnswer: (answer: string) => void;
  clearSession: () => void;
}

export const useInterviewSessionStore = create<InterviewSessionState>()(
  devtools(
    (set) => ({
      currentInterviewId: null,
      currentAnswer: "",
      setCurrentInterviewId: (currentInterviewId) => set({ currentInterviewId }),
      setCurrentAnswer: (currentAnswer) => set({ currentAnswer }),
      clearSession: () =>
        set({ currentInterviewId: null, currentAnswer: "" }),
    }),
    { name: "InterviewSessionStore" }
  )
);
