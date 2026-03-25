"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-8">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <h1 className="font-display text-[32px] font-semibold tracking-[-0.01em] leading-[1.2] text-night">
          Family Bonds
        </h1>
        <p className="text-clay text-center text-[15px] leading-[1.6] tracking-[0.01em]">
          {isSignUp ? "Create an account" : "Sign in to continue"}
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 w-full rounded-[10px] border border-latte bg-linen px-4 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-12 w-full rounded-[10px] border border-latte bg-linen px-4 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
          />

          {error && (
            <p className="text-sm text-red-700">{error}</p>
          )}
          {message && (
            <p className="text-sm text-olive">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-[12px] bg-umber px-4 text-cream text-[15px] font-semibold tracking-[0.03em] transition-colors duration-200 ease-in-out hover:bg-bark disabled:opacity-50 cursor-pointer"
          >
            {loading ? "..." : isSignUp ? "Sign up" : "Sign in"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setMessage(null);
          }}
          className="text-[14px] text-clay hover:text-bark transition-colors duration-200 ease-in-out cursor-pointer"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
