import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import API from "../api/api";
import { 
  Users, Calendar, FileText, PieChart, Info, Settings, LogOut, 
  LayoutDashboard, ChevronRight, Plus, Building2, ShieldCheck, Mail
} from "lucide-react";
import { cn } from "../lib/utils";
import toast from "react-hot-toast";

const NavItem = ({ to, icon: Icon, label, active, collapsed }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
      active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
    )}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {!collapsed && <span className="text-sm font-medium transition-all duration-300">{label}</span>}
    {collapsed && (
      <div className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-border shadow-md">
        {label}
      </div>
    )}
  </Link>
);

export const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const { logout, org, organizations, selectOrg, fetchOrganizations } = useAuth();
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      await API.post("/organizations/", { name: newOrgName });
      toast.success("Organization created!");
      setNewOrgName("");
      setShowOrgModal(false);
      fetchOrganizations(); // Refresh the list
    } catch (err) {
      toast.error("Failed to create organization");
    }
  };

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/employees", icon: Users, label: "Employees" },
    { to: "/attendance", icon: Calendar, label: "Attendance" },
    { to: "/leave", icon: Info, label: "Leaves" },
    { to: "/payroll", icon: FileText, label: "Payroll" },
    { to: "/reports", icon: PieChart, label: "Reports" },
  ];

  return (
    <>
      <aside className={cn(
        "h-screen sticky top-0 bg-background/80 backdrop-blur-xl border-r border-border transition-all duration-300 flex flex-col z-50",
        collapsed ? "w-20" : "w-64"
      )}>
        {/* Header / Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-xl shadow-primary/20 shrink-0">
            P
          </div>
          {!collapsed && (
            <div className="transition-opacity duration-300 overflow-hidden">
              <h1 className="font-black text-lg leading-none tracking-tight">Payroll SaaS</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-black">Enterprise Pro</p>
            </div>
          )}
        </div>

        {/* Organization Management */}
        <div className="p-4 space-y-4">
          <div className="px-2 flex items-center justify-between">
            {!collapsed && <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Workspace</p>}
            {!collapsed && (
              <button 
                onClick={() => setShowOrgModal(true)}
                className="p-1 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-muted-foreground"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {organizations.length > 0 ? (
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary pointer-events-none" />
                <select 
                  onChange={(e) => selectOrg(organizations.find(o => o.id.toString() === e.target.value))}
                  value={org?.id || ""}
                  className={cn(
                    "w-full bg-secondary/30 border border-border/50 rounded-xl text-xs font-bold pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer appearance-none",
                    collapsed && "hidden"
                  )}
                >
                  {organizations.map(o => (
                    <option key={o.id} value={o.id} className="bg-background">{o.name}</option>
                  ))}
                </select>
                {!collapsed && <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none rotate-90" />}
              </div>
            ) : null}

            {org && !collapsed && (
              <div className="px-2 mt-2 flex items-center gap-2">
                <div className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase font-black flex items-center gap-1.5 self-start">
                   <ShieldCheck size={10} /> {org.role}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow px-4 gap-1.5 flex flex-col overflow-y-auto">
          {!collapsed && <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-4 mb-2 px-2 leading-none">Main Menu</p>}
          {navItems.map((item) => (
            <NavItem 
              key={item.to}
              {...item}
              active={location.pathname === item.to}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-border/50 bg-secondary/10">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-black">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Create Org Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setShowOrgModal(false)}></div>
          <div className="relative glass-card p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-white/5">
            <h3 className="text-2xl font-black mb-1">Create New Workspace</h3>
            <p className="text-muted-foreground text-sm mb-6">Create a separate organization to manage payroll for a new entity or team.</p>
            
            <form onSubmit={handleCreateOrg} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Organization Name</label>
                <div className="relative">
                   <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full bg-secondary/50 border border-border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                    placeholder="e.g. Acme Corp"
                   />
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowOrgModal(false)}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-black px-4 py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black px-4 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  Create <ChevronRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
