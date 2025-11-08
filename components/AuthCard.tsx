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

    if (!email || !password || (mode === "signup" && (!fullName || !confirmPassword))) {
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
    <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm dark:bg-neutral-900 relative">
      <h2 className="text-xl font-semibold mb-4">
        {mode === "login" ? t("Login") : t("Signup")}
      </h2>

      {error && (
        <div className="mb-3 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      <form className="space-y-3" onSubmit={onSubmit}>
        {mode === "signup" && (
          <div>
            <label className="block text-sm mb-1">{t("fullName")}</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">{t("email")}</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">{t("password")}</label>
          <Input
            placeholder="******"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {mode === "signup" && (
          <div>
            <label className="block text-sm mb-1">{t("passwordConfirm")}</label>
            <Input
              placeholder="******"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            t("continue")
          )}
        </Button>
      </form>

      <div className="flex items-center justify-center my-4">
        <span className="text-gray-500 text-sm">OR</span>
      </div>

      <button
        onClick={async () => {
          // For Google OAuth, we need to allow redirect
          // The LoginPage will handle role-based redirect after Google auth completes
          await signIn("google");
        }}
        className="flex items-center justify-center border py-2 rounded hover:bg-gray-100 w-full"
      >
        <img src="/imgs/google.png" alt="Google" className="w-7 h-7 mr-2" />
        Continue with Google
      </button>

      <p className="text-sm text-center mt-4">
        {mode === "login"
          ? "You don't have an account? "
          : "Already have an account? "}
        <a
          href={mode === "login" ? "/signup" : "/login"}
          className="text-blue-600 hover:underline"
        >
          {mode === "login" ? "Signup" : "Login"}
        </a>
      </p>
    </div>
  );
}
