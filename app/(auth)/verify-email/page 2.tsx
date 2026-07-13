import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="text-center flex flex-col items-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <MailCheck className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-heading font-bold mb-4 tracking-tight">Check your email</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        We've sent a verification link to your email address. Please click the link to activate your account.
      </p>
      
      <Link href="/login" className="w-full">
        <Button variant="outline" className="w-full h-12 bg-white/5 border-white/10">
          Return to login
        </Button>
      </Link>
    </div>
  );
}
