"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockUser } from "@/lib/mockData";

export function Topbar() {
  const user = useUserStore((state) => state.user) || mockUser;

  return (
    <header className="h-16 border-b border-white/10 bg-[#09090B]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center">
        <h2 className="text-sm font-medium text-muted-foreground hidden sm:block">Financial Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </Button>
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
          </div>
          <Avatar className="w-8 h-8 border border-white/10">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
