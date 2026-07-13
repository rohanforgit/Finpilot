"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormData } from "../utils/schemas";
import { useAuth } from "../hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const { resetPassword, isLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    resetPassword(data.email);
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            placeholder="name@example.com" 
            className="bg-white/5 border-white/10 focus-visible:ring-primary/50" 
            {...register("email")} 
          />
          {errors.email && <p className="text-[0.8rem] font-medium text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full h-12 mt-6 rounded-lg text-base" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
        </Button>
      </form>

      <div className="text-center mt-6">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
