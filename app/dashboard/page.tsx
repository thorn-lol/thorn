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
  const [links, setLinks] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return router.push("/");
      supabase
        .from("profiles")
        .select("*")
        .eq("id", data.session.user.id)
        .single()
        .then(({ data }) => {
          setProfile(data);
          setDisplayName(data.display_name);
          setBio(data.bio || "");
          setLinks(data.links || []);
          setLoading(false);
        });
    });
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <main className="min-h-screen p-6 flex justify-center relative">
      <div className="aurora-bg" />

      <div className="glass-panel w-full max-w-3xl p-8 space-y-8 z-10">

        <header className="flex justify-between items-center border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage your page</p>
          </div>
          <button
            onClick={() => window.open(`/${profile.username}`, "_blank")}
            className="btn-secondary px-4"
          >
            View Page
          </button>
        </header>

        <section className="glass-panel soft p-6 space-y-4">
          <h2 className="font-semibold">Profile</h2>

          <div>
            <label className="label">Display Name</label>
            <input
              className="modern-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea
              className="modern-input h-28 resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </section>

        <section className="glass-panel soft p-6 space-y-4">
          <h2 className="font-semibold">Links</h2>

          <div className="flex gap-3">
            <input
              placeholder="Title"
              className="modern-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <input
              placeholder="URL"
              className="modern-input"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <button
              className="btn-accent px-6"
              onClick={() => {
                if (!newTitle || !newUrl) return;
                setLinks([...links, { title: newTitle, url: newUrl }]);
                setNewTitle("");
                setNewUrl("");
              }}
            >
              Add
            </button>
          </div>

          <div className="space-y-3">
            {links.map((l, i) => (
              <div key={i} className="flex justify-between items-center glass-button">
                <span>{l.title}</span>
                <button
                  onClick={() => setLinks(links.filter((_, x) => x !== i))}
                  className="text-gray-400 hover:text-red-400"
                >
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <button
          className="btn-primary w-full"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await supabase
              .from("profiles")
              .update({ display_name: displayName, bio, links })
              .eq("id", profile.id);
            setSaving(false);
          }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </main>
  );
}
