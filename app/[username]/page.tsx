import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// 1. Initialize Supabase
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

type Props = {
  params: Promise<{ username: string }>
}

// ADD THIS FUNCTION
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const profile = await getProfile(resolvedParams.username);

  if (!profile) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${profile.display_name} (@${profile.username})`,
    description: profile.bio || "Check out my bio link!",
    openGraph: {
      title: `${profile.display_name} (@${profile.username})`,
      description: profile.bio || "Check out my bio link!",
      images: [
        {
          url: profile.avatar_url,
          width: 400,
          height: 400,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary", // Makes it a small neat card like Twitter/Discord profiles
      title: profile.display_name,
      description: profile.bio,
      images: [profile.avatar_url],
    },
  };
}

export default async function PublicProfile({ params }: Props) {
  // 3. THE FIX: Await the params object before using it
  const resolvedParams = await params;
  const username = resolvedParams.username;
  
  const profile = await getProfile(username);

  // If user doesn't exist, show 404
  if (!profile) {
    return notFound();
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-black text-white font-sans">
      
      {/* Dynamic Background */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ backgroundColor: profile.theme === 'dark' ? '#5865F2' : '#ffffff' }}
      ></div>

      {/* Profile Card */}
      <div className="z-10 w-full max-w-md p-6 flex flex-col items-center gap-6">
        
        {/* Avatar */}
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-1000"></div>
            <img 
              src={profile.avatar_url} 
              alt={profile.display_name} 
              className="relative w-32 h-32 rounded-full border-4 border-black object-cover"
            />
        </div>

        {/* Identity */}
        <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                {profile.display_name}
            </h1>
            <p className="text-gray-500 font-mono text-sm">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
            <p className="text-center text-gray-300 max-w-xs leading-relaxed glass-panel p-4 rounded-xl text-sm border border-white/5 bg-white/5 backdrop-blur-sm">
                "{profile.bio}"
            </p>
        )}

{/* Links Section */}
<div className="w-full flex flex-col gap-3 mt-4">
    
    {/* Dynamic Link Mapping */}
    {profile.links && profile.links.map((link: any, index: number) => (
        <a 
            key={index} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" // Security best practice
            className="glass-button"
        >
            {/* Logic to choose icon based on title (Simple version) */}
            {link.title.toLowerCase().includes('discord') ? <i className="fa-brands fa-discord text-xl"></i> :
             link.title.toLowerCase().includes('instagram') ? <i className="fa-brands fa-instagram text-xl"></i> :
             link.title.toLowerCase().includes('twitter') || link.title.includes('x') ? <i className="fa-brands fa-twitter text-xl"></i> :
             link.title.toLowerCase().includes('youtube') ? <i className="fa-brands fa-youtube text-xl"></i> :
             <i className="fa-solid fa-link text-xl"></i>} 
            
            <span>{link.title}</span>
        </a>
    ))}

    {/* Fallback if no links exist */}
    {(!profile.links || profile.links.length === 0) && (
        <p className="text-gray-500 text-sm text-center">No links added yet.</p>
    )}

</div>

      </div>

      <style>{`
        .glass-button {
            display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 16px;
            background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px); border-radius: 16px; color: white; text-decoration: none;
            transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .glass-button:hover {
            transform: translateY(-2px); background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </main>
  );
}