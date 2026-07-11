"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, Heart } from "lucide-react";

export function SearchHeader({ initialQuery = "", onSearch }: { initialQuery?: string, onSearch: (q: string) => void }) {
  const [query, setQuery] = useState(initialQuery);
  const { data: session } = useSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <div className="w-full bg-white border-b border-border shadow-sm sticky top-0 z-50 pt-3 pb-3">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-4 md:gap-6">
        
        {/* Top Row on Mobile (Logo & Auth/Menu) */}
        <div className="flex w-full md:w-auto items-center justify-between">
          <div 
            className="font-bold text-xl md:text-2xl tracking-tight text-primary flex items-center gap-2 cursor-pointer"
            onClick={() => window.location.href = "/"}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-base md:text-lg shadow-md shadow-primary/20">
              BP
            </div>
            <span>Buy Pilot</span>
          </div>

          <div className="flex md:hidden items-center gap-3">
            {session ? (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary" onClick={() => signOut()}>
                {session.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => signIn()}>Login</Button>
            )}
            <Menu className="w-6 h-6 text-foreground" />
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 w-full max-w-3xl relative">
          <div className="flex items-center w-full bg-white border border-border/80 hover:border-primary/50 shadow-sm rounded-full px-4 py-2 transition-all focus-within:shadow-md focus-within:border-primary">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="flex-1 outline-none text-foreground bg-transparent text-sm md:text-base min-w-0"
            />
            <div className="flex items-center gap-2 text-muted-foreground ml-2 shrink-0">
              <Mic className="w-4 h-4 md:w-5 md:h-5 cursor-pointer hover:text-primary transition-colors hidden sm:block" />
              <Camera className="w-4 h-4 md:w-5 md:h-5 cursor-pointer hover:text-primary transition-colors hidden sm:block" />
              <div className="w-px h-5 md:h-6 bg-border mx-1 hidden sm:block"></div>
              <button type="submit" className="text-primary hover:text-primary/80 transition-colors p-1">
                <Search className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </form>

        {/* User Profile (Desktop) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {session ? (
            <>
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-50" /> Saved
              </Button>
              <div 
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => signOut()}
                title="Logout"
              >
                {session.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </>
          ) : (
            <Button onClick={() => signIn()}>Login / Signup</Button>
          )}
        </div>

      </div>
    </div>
  );
}
