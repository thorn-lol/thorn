import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// 1. Init Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getProfile(username: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  return profile;
}

type Props = { params: Promise<{ username: string }> };

// 2. Metadata for sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const profile = await getProfile(resolvedParams.username);
  if (!profile) return { title: "User Not Found" };
  
  return {
    title: `${profile.display_name} (@${profile.username})`,
    description: profile.bio || "Check out my bio link!",
    openGraph: {
      images: [{ url: profile.avatar_url, width: 400, height: 400 }],
    },
  };
}

// 3. The Page Component
export default async function PublicProfile({ params }: Props) {
  const resolvedParams = await params;
  const profile = await getProfile(resolvedParams.username);

  if (!profile) return notFound();

  // Determine Background: Custom Image OR Default Aurora
  const hasCustomBg = !!profile.background_url;

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0a]">
      
      {/* BACKGROUND LAYER */}
      {hasCustomBg ? (
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ 
                backgroundImage: `url(${profile.background_url})`,
                filter: 'brightness(0.7)' // Dim it slightly so text pops
            }}
        />
      ) : (
        <div className="aurora-bg" /> // Fallback to our animated gradients
      )}

      {/* THE DISCORD-STYLE CARD */}
      <div className="relative z-10 w-full max-w-[600px] bg-[#111214]/90 backdrop-blur-xl border border-white/5 rounded-[20px] overflow-hidden shadow-2xl animate-fade-in-up">
        
        {/* Banner Area */}
        <div 
            className="h-[200px] w-full bg-cover bg-center relative"
            style={{ 
                backgroundColor: profile.banner_url ? 'transparent' : '#5865F2', // Fallback color
                backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : 'none'
            }}
        >
            {/* If no banner image, show a subtle gradient */}
            {!profile.banner_url && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-50" />}
        </div>

        {/* Content Area */}
        <div className="px-8 pb-8 pt-0 relative">
            
            {/* Floating Avatar (Intersects Banner) */}
            <div className="relative -mt-[70px] mb-4 flex justify-between items-end">
                <div className="relative group">
                     {/* The Avatar itself */}
                    <img 
                        src={profile.avatar_url} 
                        alt="Avatar" 
                        className="w-[140px] h-[140px] rounded-full border-[8px] border-[#111214] bg-[#111214] object-cover"
                    />
                    {/* Status Dot (Optional - Visual only for now) */}
                    <div className="absolute bottom-5 right-2 w-7 h-7 bg-green-500 border-[5px] border-[#111214] rounded-full" title="Online"></div>
                </div>

                {/* Optional: Social Badges top right of content? Or keep simple */}
            </div>

            {/* Name Block */}
            <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        {profile.display_name}
                    </h1>
                    {/* VERIFIED BADGE */}
                    {profile.is_verified && (
                        <div className="bg-[#5865F2] text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]" title="Verified">
                            <i className="fa-solid fa-check"></i>
                        </div>
                    )}
                </div>
                <p className="text-gray-400 font-medium">@{profile.username}</p>
            </div>

            {/* Divider */}
            <div className="h-[1px] w-full bg-white/10 mb-6" />

            {/* Bio */}
            {profile.bio && (
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">About Me</h3>
                    <p className="text-gray-300 leading-relaxed text-[15px] whitespace-pre-wrap">
                        {profile.bio}
                    </p>
                </div>
            )}

            {/* Links Section */}
            {profile.links && profile.links.length > 0 && (
                <div className="space-y-3">
                    {profile.links.map((link: any, i: number) => (
                        <a 
                            key={i} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-4 bg-[#2b2d31]/50 hover:bg-[#2b2d31] border border-transparent hover:border-white/10 rounded-xl transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                {/* Icon Logic */}
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 group-hover:text-white transition">
                                    {link.title.toLowerCase().includes('discord') ? <i className="fa-brands fa-discord text-xl"></i> :
                                     link.title.toLowerCase().includes('twitter') ? <i className="fa-brands fa-twitter text-xl"></i> :
                                     link.title.toLowerCase().includes('x') ? <i className="fa-brands fa-x-twitter text-xl"></i> :
                                     link.title.toLowerCase().includes('instagram') ? <i className="fa-brands fa-instagram text-xl"></i> :
                                     link.title.toLowerCase().includes('youtube') ? <i className="fa-brands fa-youtube text-xl"></i> :
                                     <i className="fa-solid fa-link text-xl"></i>}
                                </div>
                                <span className="font-semibold text-gray-200 group-hover:text-white">{link.title}</span>
                            </div>
                            <i className="fa-solid fa-arrow-up-right-from-square text-gray-600 group-hover:text-white transition text-xs"></i>
                        </a>
                    ))}
                </div>
            )}
        </div>
      </div>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </main>
  );
}