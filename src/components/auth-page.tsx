"use client";

import React from "react";
import {Button, Input, Link} from "@heroui/react";
import {supabase} from "../lib/supabase";
 

export default function AuthPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [inviteAccepted, setInviteAccepted] = React.useState(false);
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");

  // If there's an invite token and user becomes authenticated, accept it
  React.useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("invite");
    if (!token) return;
    const run = async () => {
      const {data} = await supabase.auth.getSession();
      if (!data.session) return;
      // Ensure chat_users row exists for this user
      const user = data.session.user;
      if (user) {
        await supabase
          .from("chat_users")
          .upsert({id: user.id, email: user.email ?? ""}, {onConflict: "id"});
      }
      const {error} = await supabase.rpc("accept_invite", {p_token: token});
      if (!error) setInviteAccepted(true);
    };
    // try immediately and also when auth state changes
    run();
    const {data: sub} = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) {
        // Ensure chat_users row exists
        const u = session.user;
        if (u) {
          supabase
            .from("chat_users")
            .upsert({id: u.id, email: u.email ?? ""}, {onConflict: "id"});
        }
        run();
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const emailLower = email.trim().toLowerCase();
      if (!emailLower) throw new Error("Email is required");
      if (!password) throw new Error("Password is required");

      if (mode === "signup") {
        // Optional: allowlist only on sign up
        const {data: domains, error: domainsError} = await supabase
          .from("allowed_email_domains")
          .select("domain, allowed")
          .eq("allowed", true);
        if (domainsError) throw domainsError;
        const isAllowed = (domains || []).some((d: any) =>
          emailLower.endsWith(String(d.domain || "").toLowerCase()),
        );
        if (!isAllowed)
          throw new Error("Email domain is not allowed. Contact your administrator.");
        const {error: signUpErr} = await supabase.auth.signUp({email: emailLower, password});
        if (signUpErr) throw signUpErr;
      } else {
        const {error: signInErr} = await supabase.auth.signInWithPassword({
          email: emailLower,
          password,
        });
        if (signInErr) throw signInErr;
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const siteUrl = (import.meta.env.VITE_SITE_URL as string) || window.location.origin;
      const redirectTo = `${siteUrl}${window.location.pathname}${window.location.search}`;
      const {error: oauthErr} = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {redirectTo},
      });
      if (oauthErr) throw oauthErr;
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh w-full flex items-center justify-center bg-content1">
      <div className="rounded-medium border-small border-divider bg-background shadow-medium w-full max-w-md p-6">
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-semibold tracking-tight">Sign in to BRRRR</h3>
            <p className="text-small text-default-500">Use Google or your work email.</p>
          </div>
          <Button color="primary" variant="solid" onPress={handleGoogle} isDisabled={loading}>
            Continue with Google
          </Button>
          <div className="h-px w-full bg-default-200" />
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired
          />
          {error && <p className="text-tiny text-danger-500">{error}</p>}
          <Button color="primary" isLoading={loading} type="submit">
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
          <p className="text-tiny text-default-500">
            {mode === "signin" ? (
              <>
                Don’t have an account?{" "}
                <button type="button" className="text-primary" onClick={() => setMode("signup")}>Create one</button>.
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" className="text-primary" onClick={() => setMode("signin")}>Sign in</button>.
              </>
            )}
          </p>
          {inviteAccepted && (
            <p className="text-tiny text-success-600">Invitation accepted. You now have access.</p>
          )}
          <p className="text-tiny text-default-500">
            Having trouble? Contact <Link href="mailto:support@brrrr.ai">support@brrrr.ai</Link>
          </p>
        </form>
      </div>
    </div>
  );
}


