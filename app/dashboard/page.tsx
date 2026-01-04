"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define what a Link looks like
type LinkItem = {
  title: string;
  url: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Data
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [theme, setTheme] = useState("dark");
  
  // Link Data
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // 1. Check Auth & Fetch Data
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUser(profile);
        setDisplayName(profile.display_name);
        setBio(profile.bio || "");
        setTheme(profile.theme);
        // Load existing links or empty array if null
        setLinks(profile.links || []); 
      }
      setLoading(false);
    };
    checkSession();
  }, [router]);

  // 2. Add a new link to the list (Client side only initially)
  const addLink = () => {
    if (!newLinkTitle || !newLinkUrl) return alert("Please fill in both fields");
    
    // Create new array with the new link added
    const updatedLinks = [...links, { title: newLinkTitle, url: newLinkUrl }];
    setLinks(updatedLinks);
    
    // Clear inputs
    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  // 3. Remove a link
  const removeLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
  };

  // 4. Save everything to Supabase
  const updateProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio: bio,
        theme: theme,
        links: links // Saves the JSON array
      })
      .eq('id', user.id);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert("Profile updated!");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-white p-10">Loading Dashboard...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 font-sans flex justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Dashboard
            </h1>
            <button 
                onClick={() => window.open(`/${user.username}`, '_blank')}
                className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-full transition"
            >
                View Page <i className="fa-solid fa-arrow-up-right-from-square ml-2"></i>
            </button>
        </div>

        <div className="space-y-8">
            {/* Display Name */}
            <div className="space-y-2">
                <label className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Display Name</label>
                <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#111] border border-[#333] p-4 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                />
            </div>

            {/* Bio */}
            <div className="space-y-2">
                <label className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Bio</label>
                <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-[#111] border border-[#333] p-4 rounded-xl text-white focus:outline-none focus:border-blue-500 transition h-24"
                ></textarea>
            </div>

            {/* --- NEW SECTION: LINKS --- */}
            <div className="space-y-4">
                <label className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Your Links</label>
                
                {/* Link Input Row */}
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Title (e.g. Discord)" 
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        className="flex-1 bg-[#111] border border-[#333] p-4 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <input 
                        type="text" 
                        placeholder="URL (https://...)" 
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="flex-1 bg-[#111] border border-[#333] p-4 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <button 
                        onClick={addLink}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold transition"
                    >
                        Add
                    </button>
                </div>

                {/* List of Added Links */}
                <div className="space-y-3 mt-4">
                    {links.map((link, index) => (
                        <div key={index} className="flex justify-between items-center bg-[#0a0a0a] border border-[#222] p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-link text-gray-500"></i>
                                <div>
                                    <p className="font-bold text-sm">{link.title}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{link.url}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => removeLink(index)}
                                className="text-red-500 hover:text-red-400 text-sm px-3 py-1 rounded hover:bg-red-500/10 transition"
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    ))}
                    {links.length === 0 && (
                        <p className="text-gray-600 text-center text-sm py-4">No links added yet.</p>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <button 
                onClick={updateProfile}
                disabled={saving}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition mt-8"
            >
                {saving ? "Saving..." : "Save Changes"}
            </button>

        </div>
      </div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </main>
  );
}