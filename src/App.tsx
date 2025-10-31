import React from "react";
import PromptContainerWithSidebarBase from "./components/prompt-container-with-sidebar-base";
import AuthPage from "./components/auth-page";
import {supabase} from "./lib/supabase";
import {ChatProvider} from "./components/chat-context";

export default function App() {
  const [loading, setLoading] = React.useState(true);
  const [isAuthed, setIsAuthed] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({data}) => {
      if (!mounted) return;
      setIsAuthed(!!data.session);
      // Ensure chat_users row exists for authed users
      const user = data.session?.user;
      if (user) {
        await supabase.from("chat_users").upsert({id: user.id, email: user.email ?? ""}, {onConflict: "id"});
      }
      setLoading(false);
    });
    const {data: sub} = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthed(!!session);
      const u = session?.user;
      if (u) {
        await supabase.from("chat_users").upsert({id: u.id, email: u.email ?? ""}, {onConflict: "id"});
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

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
