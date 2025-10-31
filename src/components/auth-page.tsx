"use client";

import React from "react";
import {Button, Input, Link} from "@heroui/react";
import {supabase} from "../lib/supabase";
import SidebarContainer from "./sidebar-with-gradient-background";

export default function AuthPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [inviteAccepted, setInviteAccepted] = React.useState(false);

  // If there's an invite token and user becomes authenticated, accept it
  React.useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("invite");
    if (!token) return;
    const run = async () => {
      const {data} = await supabase.auth.getSession();
      if (!data.session) return;
      const {error} = await supabase.rpc("accept_invite", {p_token: token});
      if (!error) setInviteAccepted(true);
    };
    // try immediately and also when auth state changes
    run();
    const {data: sub} = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) run();
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
      const {error} = await supabase.auth.signInWithOtp({
        email,
        options: {emailRedirectTo: window.location.origin},
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh w-full">
      <SidebarContainer title="Sign in to BRRRR">
        <div className="flex h-full items-center justify-center">
          <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
            <h3 className="text-large font-semibold">Welcome back</h3>
            <p className="text-small text-default-600">
              Sign in with your work email. Accounts require an invitation to join an organization.
            </p>
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
            />
            {error && <p className="text-tiny text-danger-500">{error}</p>}
            {sent ? (
              <p className="text-small text-success-600">Magic link sent. Check your inbox.</p>
            ) : (
              <Button color="primary" isLoading={loading} type="submit">
                Send magic link
              </Button>
            )}
            {inviteAccepted && (
              <p className="text-tiny text-success-600">Invitation accepted. You now have access.</p>
            )}
            <p className="text-tiny text-default-500">
              Having trouble? Contact <Link href="mailto:support@brrrr.ai">support@brrrr.ai</Link>
            </p>
          </form>
        </div>
      </SidebarContainer>
    </div>
  );
}


