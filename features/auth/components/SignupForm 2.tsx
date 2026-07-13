"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormData } from "../utils/schemas";
import { useAuth } from "../hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "./PasswordInput";
import { GoogleAuthButton } from "./GoogleAuthButton";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const { signup, signInWithGoogle, isLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = (data: SignupFormData) => {
    signup(data);
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <GoogleAuthButton onClick={signInWithGoogle} isLoading={isLoading} label="Sign up with Google" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            placeholder="John Doe" 
            className="bg-white/5 border-white/10 focus-visible:ring-primary/50" 
            {...register("name")} 
          />
          {errors.name && <p className="text-[0.8rem] font-medium text-destructive">{errors.name.message}</p>}
        </div>

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
          <Label htmlFor="password">Password</Label>
          <PasswordInput 
            id="password" 
            placeholder="Create a strong password" 
            {...register("password")} 
          />
          {errors.password && <p className="text-[0.8rem] font-medium text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full h-12 mt-6 rounded-lg text-base" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline hover:text-primary">Terms of Service</a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
      </p>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
