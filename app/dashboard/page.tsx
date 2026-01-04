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

  // Fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  
  // Links
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
    alert("Saved!");
  };

  const addLink = () => {
    if (!newLinkTitle || !newLinkUrl) return;
    setLinks([...links, { title: newLinkTitle, url: newLinkUrl }]);
    setNewLinkTitle(""); setNewLinkUrl("");
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <main className="min-h-screen p-8 flex justify-center bg-[#050505] text-white font-sans">
        <div className="aurora-bg fixed inset-0 z-0" />
        
        <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* SIDEBAR / HEADER */}
            <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel p-6 flex flex-col items-center text-center">
                    <img src={profile.avatar_url} className="w-24 h-24 rounded-full border-4 border-[#222] mb-4" />
                    <h1 className="text-xl font-bold">{displayName}</h1>
                    <p className="text-gray-500 text-sm">@{profile.username}</p>
                    {profile.is_verified && <span className="mt-2 bg-blue-600 text-xs px-2 py-1 rounded text-white">Verified</span>}
                    
                    <button 
                        onClick={() => window.open(`/${profile.username}`, '_blank')}
                        className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition border border-white/5"
                    >
                        Preview Page
                    </button>
                </div>

                <div className="glass-panel p-6">
                   <p className="text-gray-400 text-xs leading-relaxed">
                     Tip: For banners, use wide images (1200x400). For backgrounds, use high-res wallpapers.
                   </p>
                </div>
            </div>

            {/* MAIN EDITOR */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* IDENTITY SECTION */}
                <div className="glass-panel p-8 space-y-6">
                    <h2 className="text-lg font-bold border-b border-white/10 pb-4 mb-4">Identity</h2>
                    
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Display Name</label>
                            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="modern-input" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Bio</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="modern-input h-24 resize-none" />
                        </div>
                    </div>
                </div>

                {/* VISUALS SECTION */}
                <div className="glass-panel p-8 space-y-6">
                    <h2 className="text-lg font-bold border-b border-white/10 pb-4 mb-4">Visuals</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Banner Image URL</label>
                            <input type="text" placeholder="https://imgur.com/..." value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} className="modern-input text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Page Background URL</label>
                            <input type="text" placeholder="https://..." value={backgroundUrl} onChange={(e) => setBackgroundUrl(e.target.value)} className="modern-input text-sm" />
                        </div>
                    </div>
                </div>

                {/* LINKS SECTION */}
                <div className="glass-panel p-8 space-y-6">
                    <h2 className="text-lg font-bold border-b border-white/10 pb-4 mb-4">Links</h2>
                    
                    <div className="flex gap-3 mb-6">
                        <input type="text" placeholder="Title (Discord)" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="modern-input flex-1" />
                        <input type="text" placeholder="URL" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="modern-input flex-1" />
                        <button onClick={addLink} className="bg-[#5865F2] hover:bg-[#4752c4] px-6 rounded-xl font-bold transition">Add</button>
                    </div>

                    <div className="space-y-3">
                        {links.map((link, i) => (
                            <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="font-medium text-sm">{link.title}</span>
                                <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-500"><i className="fa-solid fa-trash"></i></button>
                            </div>
                        ))}
                        {links.length === 0 && <p className="text-gray-600 text-sm text-center">No links yet.</p>}
                    </div>
                </div>

                <button onClick={saveProfile} disabled={saving} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition">
                    {saving ? "Saving..." : "Save All Changes"}
                </button>
            </div>
        </div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </main>
  );
}