import React from "react";
import PromptContainerWithSidebarBase from "./components/prompt-container-with-sidebar-base";
import AuthPage from "./components/auth-page";
import {supabase} from "./lib/supabase";

export default function App() {
  const [loading, setLoading] = React.useState(true);
  const [isAuthed, setIsAuthed] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({data}) => {
      if (!mounted) return;
      setIsAuthed(!!data.session);
      setLoading(false);
    });
    const {data: sub} = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  return isAuthed ? (
    <div className="flex items-center min-h-screen justify-center">
      <PromptContainerWithSidebarBase />
    </div>
  ) : (
    <AuthPage />
  );
}
