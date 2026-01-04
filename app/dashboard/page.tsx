"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  
  const [links, setLinks] = useState<any[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/");
      
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile(data);
        setDisplayName(data.display_name);
        setBio(data.bio || "");
        setBannerUrl(data.banner_url || "");
        setBackgroundUrl(data.background_url || "");
        setLinks(data.links || []);
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const saveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update({
        display_name: displayName,
        bio,
        banner_url: bannerUrl,
        background_url: backgroundUrl,
        links
    }).eq('id', profile.id);
    setSaving(false);
  };

  const addLink = () => {
    if (!newLinkTitle || !newLinkUrl) return;
    setLinks([...links, { title: newLinkTitle, url: newLinkUrl }]);
    setNewLinkTitle(""); setNewLinkUrl("");
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#101010] text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-[#101010] text-white font-sans flex justify-center p-6 md:p-12">
        <div className="thorn-bg" />
        
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
            
            {/* --- SIDEBAR --- */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#151515] border border-[#222] rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
                    <img src={profile.avatar_url} className="w-28 h-28 rounded-full border-4 border-[#101010] mb-4 shadow-lg" />
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                    <p className="text-gray-500 text-sm mb-4">@{profile.username}</p>
                    
                    <button 
                        onClick={() => window.open(`/${profile.username}`, '_blank')}
                        className="w-full py-3 bg-[#222] hover:bg-[#333] text-white rounded-xl text-sm font-bold transition border border-[#333]"
                    >
                        View Live Page
                    </button>
                </div>
            </div>

            {/* --- MAIN EDITOR --- */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 1. CORE INFO */}
                <section className="bg-[#151515] border border-[#222] rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                        <span className="w-2 h-8 bg-green-700 rounded-full inline-block"></span> Identity
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Display Name</label>
                            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="modern-input" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Bio</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="modern-input h-32 resize-none" />
                        </div>
                    </div>
                </section>

                {/* 2. DESIGN */}
                <section className="bg-[#151515] border border-[#222] rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                         <span className="w-2 h-8 bg-green-700 rounded-full inline-block"></span> Visuals
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Banner URL</label>
                            <input type="text" placeholder="https://..." value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} className="modern-input text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Background URL</label>
                            <input type="text" placeholder="https://..." value={backgroundUrl} onChange={(e) => setBackgroundUrl(e.target.value)} className="modern-input text-sm" />
                        </div>
                    </div>
                </section>

                {/* 3. LINKS */}
                <section className="bg-[#151515] border border-[#222] rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                        <span className="w-2 h-8 bg-green-700 rounded-full inline-block"></span> Links
                    </h2>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <input type="text" placeholder="Title (e.g. Spotify)" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="modern-input flex-1" />
                        <input type="text" placeholder="URL" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="modern-input flex-1" />
                        <button onClick={addLink} className="bg-[#1a472a] hover:bg-[#2d8a55] text-white px-8 rounded-xl font-bold transition">Add</button>
                    </div>

                    <div className="space-y-3">
                        {links.map((link, i) => (
                            <div key={i} className="flex justify-between items-center bg-[#0a0a0a] border border-[#222] p-4 rounded-xl">
                                <span className="font-bold text-sm">{link.title}</span>
                                <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="text-gray-600 hover:text-red-500 transition"><i className="fa-solid fa-trash"></i></button>
                            </div>
                        ))}
                        {links.length === 0 && <p className="text-gray-600 text-sm">No links added.</p>}
                    </div>
                </section>

                <button onClick={saveProfile} disabled={saving} className="w-full btn-primary text-lg">
                    {saving ? "Saving..." : "Save All Changes"}
                </button>
            </div>
        </div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </main>
  );
}