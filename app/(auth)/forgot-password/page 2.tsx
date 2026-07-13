import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | FinPilot",
  description: "Reset your FinPilot password.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader 
        title="Reset password" 
        subtitle="Enter your email and we'll send you a link to reset your password." 
      />
      <ForgotPasswordForm />
    </>
  );
}
