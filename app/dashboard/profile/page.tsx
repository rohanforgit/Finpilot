"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/features/dashboard/hooks/useProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(`${profile.first_name || ""} ${profile.last_name || ""}`.trim());
    }
  }, [profile]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    const parts = fullName.trim().split(" ");
    const first_name = parts[0] || "";
    const last_name = parts.slice(1).join(" ") || "";

    try {
      await updateProfile({
        first_name,
        last_name,
      });
      toast.success("Profile saved successfully!");
    } catch (e: any) {
      toast.error("Failed to update profile: " + e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div className="h-12 bg-white/5 rounded-lg w-1/4" />
        <div className="max-w-2xl mt-8">
          <div className="h-[250px] bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Profile" 
        description="Manage your personal information."
      />

      <motion.div variants={slideUpVariants} className="max-w-2xl mt-8">
        <Card className="p-8 bg-card/40 border-white/10">
          <div className="flex items-center gap-6 mb-8">
            <Avatar className="w-24 h-24 border-2 border-white/10 text-xl font-bold flex items-center justify-center bg-white/5">
              <AvatarImage src="" alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{fullName || "Your Account"}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <Input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                className="bg-white/5 border-white/10" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <Input 
                value={profile?.email || ""} 
                className="bg-white/5 border-white/10" 
                disabled 
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

