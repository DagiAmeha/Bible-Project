"use client";
import { AuthCard } from "@/components/AuthCard";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <AuthCard mode="signup" />
    </div>
  );
}
