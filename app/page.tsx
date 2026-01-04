"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      }
      setLoading(false);
    });
  }, []);

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="aurora-bg" />

      <div className="glass-panel w-full max-w-md p-8 space-y-6 text-center z-10">

        {!session && (
          <>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Thorn
              </h1>
              <p className="text-gray-400 mt-2">
                The cleanest link you’ll ever click.
              </p>
            </div>

            <button
              onClick={() =>
                supabase.auth.signInWithOAuth({
                  provider: "discord",
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                })
              }
              className="btn-accent w-full py-4 flex justify-center gap-3"
            >
              <i className="fa-brands fa-discord text-xl" />
              Login with Discord
            </button>
          </>
        )}

        {session && !profile && (
          <>
            <h2 className="text-2xl font-semibold">Claim your handle</h2>

            <div className="space-y-4 text-left">
              <div>
                <label className="label">Username</label>
                <input
                  className="modern-input"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
                  }
                />
              </div>

              <div>
                <label className="label">Display name</label>
                <input
                  className="modern-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>

            {formError && <p className="text-red-400 text-sm">{formError}</p>}

            <button
              onClick={async () => {
                if (!username || !displayName)
                  return setFormError("Fill everything in.");

                const { error } = await supabase.from("profiles").insert({
                  id: session.user.id,
                  username,
                  display_name: displayName,
                  avatar_url: session.user.user_metadata.avatar_url,
                  theme: "dark",
                });

                if (error) setFormError(error.message);
                else location.reload();
              }}
              className="btn-primary w-full"
            >
              Create Profile
            </button>
          </>
        )}

        {session && profile && (
          <>
            <img
              src={profile.avatar_url}
              className="w-24 h-24 rounded-full border border-white/10 mx-auto"
            />
            <div>
              <h2 className="text-2xl font-semibold">
                {profile.display_name}
              </h2>
              <p className="text-gray-400">@{profile.username}</p>
            </div>

            <Link href="/dashboard">
              <button className="btn-primary w-full">Edit Page</button>
            </Link>

            <button
              onClick={() => supabase.auth.signOut().then(() => location.reload())}
              className="text-sm text-gray-500 hover:text-white"
            >
              Sign out
            </button>
          </>
        )}
      </div>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </main>
  );
}
