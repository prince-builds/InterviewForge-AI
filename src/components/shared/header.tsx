"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, User, ChevronDown, CheckCircle2 } from "lucide-react";
import { useAuthStore, useProfileStore } from "@/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { activeProfile, profiles, setActiveProfile } = useProfileStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <header className="fixed top-0 right-0 z-30 h-16 flex items-center gap-4 px-6 border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all duration-300 left-60">
      {/* Profile switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="glass" size="sm" className="gap-2 h-9">
            <div className="w-5 h-5 rounded-md gradient-brand flex items-center justify-center text-[10px] font-bold text-white">
              {activeProfile ? getInitials(activeProfile.name) : "?"}
            </div>
            <span className="text-sm font-medium max-w-[120px] truncate">
              {activeProfile?.name ?? "Select Profile"}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Switch Profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {profiles.length === 0 ? (
            <DropdownMenuItem
              onClick={() => router.push("/profiles")}
            >
              + Create your first profile
            </DropdownMenuItem>
          ) : (
            profiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => {
                  setActiveProfile(profile);
                  toast.success(`Switched to ${profile.name}`);
                }}
                className="gap-2"
              >
                <div className="w-6 h-6 rounded-md gradient-brand flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {getInitials(profile.name)}
                </div>
                <span className="flex-1 truncate">{profile.name}</span>
                {activeProfile?.id === profile.id && (
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profiles")}>
            Manage profiles
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="rounded-xl">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center text-xs font-bold text-white">
              {user ? getInitials(user.full_name ?? user.email) : "?"}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <div className="font-medium truncate">{user?.full_name ?? "User"}</div>
            <div className="text-xs text-muted-foreground font-normal truncate">
              {user?.email}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="w-4 h-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400">
            <LogOut className="w-4 h-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
