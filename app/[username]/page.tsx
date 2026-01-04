import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Metadata } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getProfile(username: string) {
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single();
  return profile;
}

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const profile = await getProfile(resolvedParams.username);
  if (!profile) return { title: "User Not Found" };
  return {
    title: `${profile.display_name} (@${profile.username})`,
    openGraph: { images: [{ url: profile.avatar_url }] },
  };
}

export default async function PublicProfile({ params }: Props) {
  const resolvedParams = await params;
  const profile = await getProfile(resolvedParams.username);

  if (!profile) return notFound();
  const hasCustomBg = !!profile.background_url;

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 relative bg-[#030303] text-white font-sans selection:bg-emerald-500/30">
      
      {/* Global Background */}
      {hasCustomBg ? (
        <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${profile.background_url})`, filter: 'blur(60px) brightness(0.2)', transform: 'scale(1.1)' }} />
      ) : (
        <div className="fixed inset-0 z-0 bg-[#030303]">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(20,50,30,0.15),transparent_70%)]"></div>
        </div>
      )}

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[680px] bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/[0.06]">
        
        {/* Banner */}
        <div className="relative h-32 w-full">
            {profile.banner_url ? (
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${profile.banner_url})` }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f2e1b] to-[#050505]" />
            )}
        </div>

        {/* Content */}
        <div className="px-8 pb-8 -mt-14">
            
            {/* Avatar + Identity */}
            <div className="flex items-start gap-5 mb-6">
                
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-28 h-28 rounded-2xl p-1.5 bg-[#0a0a0a] shadow-xl ring-1 ring-white/[0.08]">
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-xl object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2d8a55] border-[3px] border-[#0a0a0a] rounded-full shadow-[0_0_12px_rgba(45,138,85,0.5)]" title="Online"></div>
                </div>

                {/* Identity */}
                <div className="flex-1 pt-14">
                    <div className="flex items-center gap-2.5 mb-1">
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {profile.display_name}
                        </h1>
                        {profile.is_verified && (
                            <i className="fa-solid fa-circle-check text-blue-500 text-base drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"></i>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-sm text-white/40">
                        <span className="font-mono">@{profile.username}</span>
                        
                        {/* Discord Badge - Ultra Compact */}
                        <div className="flex items-center gap-1.5 bg-[#5865F2]/10 border border-[#5865F2]/20 px-2 py-0.5 rounded-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#3ba55d]"></div>
                            <span className="text-xs font-semibold text-[#5865F2]">Discord</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio */}
            {profile.bio && (
                <div className="mb-6 px-1">
                    <p className="text-sm leading-relaxed text-white/50">
                        {profile.bio}
                    </p>
                </div>
            )}

            {/* Divider */}
            <div className="h-px bg-white/[0.06] mb-6"></div>

            {/* Links */}
            <div className="space-y-2.5">
                {profile.links && profile.links.map((link: any, i: number) => (
                    <a 
                        key={i} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-between px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/10 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-base text-white/40 group-hover:text-emerald-400 group-hover:bg-white/[0.06] transition-all duration-200">
                                {link.title.toLowerCase().includes('discord') ? <i className="fa-brands fa-discord"></i> :
                                 link.title.toLowerCase().includes('twitter') || link.title.includes('x') ? <i className="fa-brands fa-x-twitter"></i> :
                                 link.title.toLowerCase().includes('github') ? <i className="fa-brands fa-github"></i> :
                                 link.title.toLowerCase().includes('youtube') ? <i className="fa-brands fa-youtube"></i> :
                                 link.title.toLowerCase().includes('instagram') ? <i className="fa-brands fa-instagram"></i> :
                                 link.title.toLowerCase().includes('spotify') ? <i className="fa-brands fa-spotify"></i> :
                                 <i className="fa-solid fa-link"></i>}
                            </div>
                            <span className="font-semibold text-sm text-white/70 group-hover:text-white transition-colors">
                                {link.title}
                            </span>
                        </div>

                        <i className="fa-solid fa-arrow-right text-xs text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-200"></i>
                    </a>
                ))}

                {(!profile.links || profile.links.length === 0) && (
                    <div className="text-center py-12 text-white/20 text-sm border border-dashed border-white/[0.06] rounded-xl">
                        No links available
                    </div>
                )}
            </div>
        </div>
      </div>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </main>
  );
}