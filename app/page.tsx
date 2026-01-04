"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form States
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [formError, setFormError] = useState("");

  // 1. Check Auth & Profile on Load
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Check if they have a row in 'profiles'
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setProfile(data); // If data is null, they need to create a profile
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // 2. Login Logic
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // 3. Create Profile Logic (The "Claim" Action)
  const createProfile = async () => {
    if (!username || !displayName) {
      setFormError("Please fill in both fields.");
      return;
    }

    // Insert into Supabase
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id, // Links to their Auth ID
        username: username,  // The unique link (e.g. /coolguy)
        display_name: displayName, // The visual name
        avatar_url: session.user.user_metadata.avatar_url, // Grab Discord PFP
        theme: 'dark'
      });

    if (error) {
      if (error.code === '23505') { // Postgres code for "Unique Violation"
        setFormError("That username is already taken!");
      } else {
        setFormError(error.message);
      }
    } else {
      // Success! Refresh to show the "Dashboard" view
      window.location.reload();
    }
  };

  // 4. Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) return <div className="main-container">Loading...</div>;

  return (
    <main className="main-container">
      <div className="gradient-bg"></div>
      <div className="glass-card">
        
        {/* STATE 1: NOT LOGGED IN */}
        {!session && (
          <div className="content">
            <h1 className="title">Biolink</h1>
            <p className="subtitle">Claim your corner of the internet.</p>
            <button onClick={handleLogin} className="discord-btn">
              <i className="fa-brands fa-discord"></i> Login with Discord
            </button>
          </div>
        )}

        {/* STATE 2: LOGGED IN BUT NO PROFILE (Onboarding) */}
        {session && !profile && (
          <div className="content">
            <h1 className="title">One Last Step</h1>
            <p className="subtitle">Claim your unique handle.</p>

            <div className="input-group">
              <input 
                type="text" 
                placeholder="username (e.g. ghost)" 
                className="glass-input"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} // Force lowercase, no spaces
              />
              <input 
                type="text" 
                placeholder="Display Name" 
                className="glass-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {formError && <p className="error-text">{formError}</p>}

            <button onClick={createProfile} className="primary-btn">
              Create Profile
            </button>
          </div>
        )}

        {/* STATE 3: LOGGED IN AND HAS PROFILE (Dashboard) */}
        {session && profile && (
          <div className="content">
            <img src={profile.avatar_url} alt="Avatar" className="avatar" />
            <h1 className="title">Welcome, {profile.display_name}</h1>
            <p className="subtitle">@{profile.username}</p>
            
            <div className="btn-row">
                  <Link href="/dashboard" className="w-full">
                    <button className="primary-btn">Edit Page</button>
                  </Link>
              <button onClick={handleLogout} className="logout-btn">Sign Out</button>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        /* Reuse previous CSS, adding these new ones: */
        .main-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: #050505; color: white; position: relative; overflow: hidden; font-family: sans-serif; }
        .gradient-bg { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(88, 101, 242, 0.15) 0%, rgba(0,0,0,0) 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; pointer-events: none; }
        .glass-card { position: relative; z-index: 10; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 3rem; border-radius: 24px; width: 100%; max-width: 380px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
        .title { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0; background: linear-gradient(to right, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { color: #888; font-size: 0.95rem; margin-bottom: 2rem; }
        
        /* Inputs */
        .input-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .glass-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px; border-radius: 8px; outline: none; transition: 0.2s; }
        .glass-input:focus { border-color: #5865F2; background: rgba(0,0,0,0.5); }
        
        /* Buttons */
        .discord-btn { width: 100%; background: #5865F2; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .primary-btn { width: 100%; background: white; color: black; border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; margin-bottom: 10px; }
        .logout-btn { background: transparent; color: #888; border: none; cursor: pointer; font-size: 0.9rem; }
        .logout-btn:hover { color: white; }
        
        .error-text { color: #ff4d4d; font-size: 0.9rem; margin-bottom: 15px; }
        .avatar { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; border: 2px solid rgba(255,255,255,0.1); }
        .btn-row { display: flex; flex-direction: column; gap: 5px; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </main>
  );
}