import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, isConfigured } from "../lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isConfigured);
  const [sent, setSent] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string) {
    setSignInError(null);
    if (email.toLowerCase() !== "nathanjbrandes@gmail.com") {
      setSignInError("This IDE is only for Nathan.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    });
    if (error) {
      setSignInError(error.message);
    } else {
      setSent(true);
    }
  }

  function signOut() {
    supabase.auth.signOut();
  }

  function resetSent() {
    setSent(false);
  }

  return { user, loading, sent, signInError, signIn, signOut, resetSent };
}
