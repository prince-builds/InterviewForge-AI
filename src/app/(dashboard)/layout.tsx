"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { RouteGuard } from "@/components/shared/route-guard";
import { useUIStore, useProfileStore } from "@/store";
import { profilesApi } from "@/services/api";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useUIStore();
  const { setProfiles } = useProfileStore();

  const { data: profilesData } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => profilesApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (profilesData?.items) {
      setProfiles(profilesData.items);
    }
  }, [profilesData, setProfiles]);

  return (
    <RouteGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Header />
        <main
          className={cn(
            "transition-all duration-300 pt-16",
            isSidebarCollapsed ? "pl-16" : "pl-60"
          )}
        >
          <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
