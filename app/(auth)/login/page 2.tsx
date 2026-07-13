import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | FinPilot",
  description: "Log in to your FinPilot account",
};

export default function LoginPage() {
  return (
    <>
      <AuthHeader 
        title="Welcome back" 
        subtitle="Enter your details to access your dashboard." 
      />
      <LoginForm />
    </>
  );
}
