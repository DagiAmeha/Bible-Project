"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const { data: session, status, update } = useSession();
  const t = useTranslations("common");
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Handle redirect after successful login
  useEffect(() => {
    if (justLoggedIn && status === "authenticated" && session?.user?.role) {
      if (session.user.role === "admin") {
        router.push("/stats");
      } else {
        router.push("/dashboard");
      }
      setJustLoggedIn(false);
    }
  }, [justLoggedIn, status, session, router]);

  const showError = (errMsg: string) => {
    setError(errMsg);
    setTimeout(() => setError(""), 4000);
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !email ||
      !password ||
      (mode === "signup" && (!fullName || !confirmPassword))
    ) {
      setLoading(false);
      return showError("Please fill all required fields!");
    }

    if (!isValidEmail(email)) {
      setLoading(false);
      return showError("Please enter a valid email address!");
    }

    if (password.length < 6) {
      setLoading(false);
      return showError("Password must be at least 6 characters long!");
    }

    if (mode === "signup" && password !== confirmPassword) {
      setLoading(false);
      return showError("Passwords do not match!");
    }

    try {
      if (mode === "login") {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.ok) {
          // Trigger session update to get the latest session with role
          await update();
          setJustLoggedIn(true);
          // The useEffect will handle the redirect once session is updated
        } else {
          showError("Invalid email or password!");
          setLoading(false);
        }
      } else {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password, confirmPassword }),
        });

        if (res.ok) {
          router.push("/login"); // ✅ redirect safely after signup
        } else {
          const data = await res.json();
          showError(data.message || "Signup failed. Try again!");
        }
      }
    } catch (err) {
      console.error(err);
      showError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg border shadow-lg p-6 md:p-8">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          {mode === "login" ? t("Login") : t("Signup")}
        </h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          {mode === "login"
            ? "Welcome back! Please sign in to your account."
            : "Create your account to get started."}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
        {mode === "signup" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("fullName")}
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("email")}
          </label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("password")}
          </label>
          <Input
            placeholder="******"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
        </div>
        {mode === "signup" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("passwordConfirm")}
            </label>
            <Input
              placeholder="******"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
            />
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : t("continue")}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={async () => {
            await signIn("google");
          }}
          className="mt-4 w-full flex items-center justify-center px-4 py-3 md:py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          <img src="/imgs/google.png" alt="Google" className="w-5 h-5 mr-3" />
          Continue with Google
        </button>
      </div>

      <p className="text-sm text-center mt-6 text-gray-600">
        {mode === "login"
          ? "Don't have an account? "
          : "Already have an account? "}
        <a
          href={mode === "login" ? "/signup" : "/login"}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </a>
      </p>
    </div>
  );
}
