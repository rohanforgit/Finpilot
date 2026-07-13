"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../utils/schemas";
import { useAuth } from "../hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "./PasswordInput";
import { GoogleAuthButton } from "./GoogleAuthButton";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const { login, signInWithGoogle, isLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <GoogleAuthButton onClick={signInWithGoogle} isLoading={isLoading} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput 
            id="password" 
            placeholder="Enter your password" 
            {...register("password")} 
          />
          {errors.password && <p className="text-[0.8rem] font-medium text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full h-12 mt-6 rounded-lg text-base" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
