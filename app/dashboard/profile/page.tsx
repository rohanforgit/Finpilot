"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/useUserStore";
import { mockUser } from "@/lib/mockData";

export default function ProfilePage() {
  const user = useUserStore((state) => state.user) || mockUser;

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Profile" 
        description="Manage your personal information."
      />

      <motion.div variants={slideUpVariants} className="max-w-2xl mt-8">
        <Card className="p-8 bg-card/40 border-white/10">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10">
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <Button variant="outline" size="sm" className="mb-2 bg-white/5">Change Avatar</Button>
              <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <Input defaultValue={user.name} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <Input defaultValue={user.email} className="bg-white/5 border-white/10" disabled />
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
