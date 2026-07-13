import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | FinPilot",
  description: "Join FinPilot and take control of your finances.",
};

export default function SignupPage() {
  return (
    <>
      <AuthHeader 
        title="Create an account" 
        subtitle="Start planning smarter financial months today." 
      />
      <SignupForm />
    </>
  );
}
