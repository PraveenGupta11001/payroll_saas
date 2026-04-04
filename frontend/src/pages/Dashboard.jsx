import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import API from "../api/api";
import { 
  Users, CalendarCheck, Clock, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import { cn } from "../lib/utils";

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <div className="glass-card p-6 flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className={cn("p-2 rounded-lg bg-opacity-20", color)}>
        <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-').replace('-opacity-20', ''))} />
      </div>
      <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
        <MoreHorizontal size={14} />
      </button>
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="flex items-center gap-2 mt-1">
        <h3 className="text-3xl font-black tracking-tight">{value}</h3>
        {trend && (
          <span className={cn(
            "flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-md",
            trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          )}>
            {trend === 'up' ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { org } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (org) {
      fetchStats();
    }
  }, [org]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get("/dashboard/stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-black animate-pulse text-[10px] uppercase tracking-widest">Aggregating Workspace Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass p-10 border border-white/5 bg-gradient-to-br from-primary/10 via-background to-indigo-900/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
               <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">Active Workspace</div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-3 leading-none">{org?.name} Overview</h1>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">Welcome back to your command center. Real-time workforce metrics and payroll distributions are calculated for your <span className="text-primary font-bold">Organization</span>.</p>
          </div>
          <div className="hidden lg:block w-40 h-40 bg-primary/20 hover:bg-primary/30 transition-all blur-3xl absolute -right-8 -top-8 rounded-full"></div>
          <TrendingUp className="w-32 h-32 text-primary/5 absolute -right-4 -bottom-8 rotate-12 group-hover:rotate-6 transition-transform" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Workforce" 
          value={stats.total_employees} 
          icon={Users} 
          trend="up" 
          trendValue="12%" 
          color="bg-blue-500/20" 
        />
        <StatCard 
          title="Active Today" 
          value={stats.present_today} 
          icon={CalendarCheck} 
          trend="up" 
          trendValue="4%" 
          color="bg-emerald-500/20" 
        />
        <StatCard 
          title="Missed Logs" 
          value={stats.absent_today} 
          icon={Clock} 
          trend="down" 
          trendValue="2%" 
          color="bg-rose-500/20" 
        />
        <StatCard 
          title="Internal Leaves" 
          value={stats.pending_leaves} 
          icon={CreditCard} 
          color="bg-amber-500/20" 
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Trend Area Chart */}
        <div className="lg:col-span-2 glass-card p-8 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black tracking-tight">Productivity Trends</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Daily Log-in Activity (Last 7 Days)</p>
            </div>
            <div className="px-3 py-1.5 bg-secondary/50 border border-border rounded-xl text-[10px] uppercase font-black tracking-widest text-primary shadow-inner">
               Live Report
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.attendance_trend}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217.2 91.2% 59.8%)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(217.2 91.2% 59.8%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}}
                  dy={20}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(10, 15, 30, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(20px)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="present" 
                  stroke="hsl(217.2 91.2% 59.8%)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPresent)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Stats Pie Chart */}
        <div className="glass-card p-8 relative group overflow-hidden">
          <h3 className="text-xl font-black mb-1 tracking-tight">Workforce Split</h3>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-10">Department Distribution</p>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.department_stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={2000}
                >
                  {stats.department_stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={[
                      'hsl(217.2 91.2% 59.8%)', 
                      'hsl(250 91.2% 59.8%)', 
                      'hsl(280 91.2% 59.8%)', 
                      'hsl(310 91.2% 59.8%)',
                      'hsl(180 91.2% 59.8%)'
                    ][index % 5]} className="stroke-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(10, 15, 30, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">Total</p>
              <h4 className="text-3xl font-black tracking-tight">{stats.total_employees}</h4>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {stats.department_stats.slice(0, 4).map((dept, index) => (
              <div key={dept.name} className="flex items-center justify-between text-[10px] px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{backgroundColor: [
                      'hsl(217.2 91.2% 59.8%)', 
                      'hsl(250 91.2% 59.8%)', 
                      'hsl(280 91.2% 59.8%)', 
                      'hsl(310 91.2% 59.8%)'
                  ][index % 4]}}></div>
                  <span className="font-black uppercase tracking-widest">{dept.name}</span>
                </div>
                <span className="text-muted-foreground font-black">{dept.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
