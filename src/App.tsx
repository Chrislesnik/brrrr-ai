import React from "react";
import PromptContainerWithSidebarBase from "./components/prompt-container-with-sidebar-base";
import AuthPage from "./components/auth-page";
import {supabase} from "./lib/supabase";
import {ChatProvider} from "./components/chat-context";

export default function App() {
  const [loading, setLoading] = React.useState(true);
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Handle Supabase email magic link / OAuth callback by exchanging the code for a session
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");
    if (error) {
      // Surface in console for now; the send form now shows errors for message flow
      // If needed we can route this to UI state later
      console.error("Auth error:", error, errorDescription);
    }
    if (code) {
      (async () => {
        const {error: exchangeErr} = await supabase.auth.exchangeCodeForSession({code});
        if (exchangeErr) {
          console.error("Failed to exchange auth code:", exchangeErr.message);
        }
        // Clean auth params from the URL while preserving other query params (e.g. invite)
        url.searchParams.delete("code");
        url.searchParams.delete("type");
        url.searchParams.delete("error");
        url.searchParams.delete("error_description");
        window.history.replaceState({}, document.title, url.toString());
      })();
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const {data} = await supabase.auth.getSession();
        if (!mounted) return;
        setIsAuthed(!!data.session);
        const user = data.session?.user;
        if (user) {
          await supabase
            .from("chat_users")
            .upsert({id: user.id, email: user.email ?? ""}, {onConflict: "id"});
        }
      } catch (err: any) {
        console.error("Failed to initialize auth session:", err);
        setLoadError(err?.message || "Failed to initialize session");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const {data: sub} = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthed(!!session);
      const u = session?.user;
      if (u) {
        await supabase
          .from("chat_users")
          .upsert({id: u.id, email: u.email ?? ""}, {onConflict: "id"});
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-default-500">
        Loading…
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-danger-500">
        {loadError}
      </div>
    );
  }

  return isAuthed ? (
    <ChatProvider>
      <div className="flex items-center min-h-screen justify-center">
        <PromptContainerWithSidebarBase />
      </div>
    </ChatProvider>
  ) : (
    <AuthPage />
  );
}
