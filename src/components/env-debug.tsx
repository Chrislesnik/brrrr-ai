"use client";

import React from "react";
import {Button} from "@heroui/react";
import {supabase} from "../lib/supabase";

function mask(value: string | undefined, visible: number = 6) {
  if (!value) return "<missing>";
  if (value.length <= visible) return value;
  return value.slice(0, visible) + "…";
}

export default function EnvDebug() {
  const [health, setHealth] = React.useState<string>("");
  const [user, setUser] = React.useState<string>("");

  const env = (import.meta as any).env || {};
  const url = env?.VITE_SUPABASE_URL as string | undefined;
  const anon = env?.VITE_SUPABASE_ANON_KEY as string | undefined;
  const site = env?.VITE_SITE_URL as string | undefined;

  const check = async () => {
    try {
      const res = await fetch(`${(url || "").replace(/\/$/, "")}/auth/v1/health`);
      setHealth(`${res.status} ${res.statusText}`);
    } catch (e: any) {
      setHealth(`error: ${e?.message || String(e)}`);
    }
  };

  const getCurrentUser = async () => {
    const {data} = await supabase.auth.getUser();
    setUser(JSON.stringify(data?.user || null));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Env Debug</h2>
      <ul className="text-sm mb-4">
        <li>VITE_SUPABASE_URL: {mask(url)}</li>
        <li>VITE_SUPABASE_ANON_KEY: {mask(anon)}</li>
        <li>VITE_SITE_URL: {mask(site)}</li>
      </ul>
      <div className="flex gap-2 mb-2">
        <Button size="sm" onPress={check}>Check Auth Health</Button>
        <Button size="sm" onPress={getCurrentUser}>Get Current User</Button>
      </div>
      <div className="text-sm">
        <div>health: {health || "(run check)"}</div>
        <div>user: {user || "(run get user)"}</div>
      </div>
    </div>
  );
}


