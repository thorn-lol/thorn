"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        supabase.from('profiles').select('*').eq('id', data.session.user.id).single().then(({ data }) => setProfile(data));
      }
      setLoading(false);
    });
  }, []);

  const login = () => supabase.auth.signInWithOAuth({ provider: "discord", options: { redirectTo: `${window.location.origin}/auth/callback` } });

  const createProfile = async () => {
    if (!username || !displayName) return alert("Fill in fields");
    await supabase.from('profiles').insert({
        id: session.user.id,
        username,
        display_name: displayName,
        avatar_url: session.user.user_metadata.avatar_url
    });
    window.location.reload();
  };

  if (loading) return <div className="h-screen bg-black" />;

  return (
    <main className="bg-red-500 min-h-screen flex items-center justify-center relative overflow-hidden text-white">
      <div className="aurora-bg fixed inset-0 z-0" />
      
      <div className="z-10 w-full max-w-md p-8 glass-panel animate-fade-in-up text-center border-t border-white/10">
        
        {/* LOGO */}
        <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-900/50">
                <i className="fa-solid fa-link text-2xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Thorn</h1>
            <p className="text-gray-400 mt-2 text-sm">The biolink for the modern internet.</p>
        </div>

        {/* LOGIC STATES */}
        {!session ? (
            <button onClick={login} className="w-full py-4 bg-[#5865F2] hover:bg-[#4752c4] rounded-xl font-bold transition flex items-center justify-center gap-3 text-white shadow-xl shadow-[#5865F2]/20">
                <i className="fa-brands fa-discord text-xl"></i> Continue with Discord
            </button>
        ) : !profile ? (
            <div className="space-y-4 text-left animate-fade-in">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Username</label>
                    <input className="modern-input" placeholder="ghost" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Display Name</label>
                    <input className="modern-input" placeholder="Ghost" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <button onClick={createProfile} className="w-full py-3 bg-white text-black font-bold rounded-xl mt-4">Claim Identity</button>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl flex items-center gap-4 border border-white/5">
                    <img src={profile.avatar_url} className="w-12 h-12 rounded-full" />
                    <div className="text-left">
                        <p className="font-bold">{profile.display_name}</p>
                        <p className="text-xs text-gray-400">@{profile.username}</p>
                    </div>
                </div>
                <Link href="/dashboard" className="block w-full">
                    <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition">Go to Dashboard</button>
                </Link>
            </div>
        )}
      </div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </main>
  );
}