import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, Bell, User as UserIcon, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../AuthContext";

export const PageLayout = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, org } = useAuth();

  return (
    <div className="flex bg-background min-h-screen text-foreground font-inter">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground mr-2"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* Search Bar - Aesthetic only for now */}
            <div className="hidden md:flex items-center gap-2 bg-secondary/50 border border-border px-3 py-1.5 rounded-full text-muted-foreground focus-within:border-primary transition-all group w-64">
              <Search size={14} className="group-hover:text-primary" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none outline-none text-xs w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-secondary rounded-full transition-colors relative text-muted-foreground">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50"></span>
              </button>
              
              <div className="h-8 w-px bg-border mx-2"></div>
              
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold leading-none">{user?.full_name}</p>
                  <p className="text-[10px] text-muted-foreground opacity-70 mt-1">{org?.name || "Member"}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center border-2 border-background shadow-md shadow-primary/20">
                  <UserIcon size={18} className="text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
