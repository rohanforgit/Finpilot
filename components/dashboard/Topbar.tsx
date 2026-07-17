"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Topbar() {
  const user = useUserStore((state) => state.user);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center">
        <h2 className="text-sm font-medium text-muted-foreground hidden sm:block">Financial Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        {mounted && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </Button>
        <div className="flex items-center gap-3 pl-4 border-l border-border min-h-[32px]">
          {user ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
              </div>
              <Avatar className="w-8 h-8 border border-border">
                <AvatarImage src={user.avatarUrl} alt={user.name || 'User'} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-20 h-4 bg-white/5 rounded animate-pulse hidden sm:block" />
              <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
