import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import API from "../api/api";
import toast from "react-hot-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  Download, FileText, Calendar, Filter, PieChart as PieIcon, 
  Table, ChevronRight, CheckCircle, Database
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Reports() {
  const { org } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [summary, setSummary] = useState(null);

  const fetchSummary = async () => {
    if (!org) return;
    try {
      setLoading(true);
      const res = await API.get(`/payroll/summary/?month=${form.month}&year=${form.year}`);
      setSummary(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch report summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [org, form.month, form.year]);

  const downloadCSV = async () => {
    if (!org) return;
    try {
      const res = await API.get(`/reports/payroll-export/?month=${form.month}&year=${form.year}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll_report_${org.id}_${form.month}_${form.year}.csv`);
      document.body.appendChild(link);
      link.click();
      toast.success("Report downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download report");
    }
  };

  const chartData = summary?.records.map(r => ({
     name: r.employee_name,
     salary: r.calculated_salary
  })) || [];

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Organization Analytics</h1>
          <p className="text-muted-foreground font-medium">Export payroll data and visualize disbursement distribution for <span className="text-primary font-bold">{org?.name}</span>.</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 group"
        >
          <Download size={20} className="group-hover:translate-y-0.5 transition-transform" /> Export CSV Report
        </button>
      </div>

      {/* Modern Filter Card */}
      <div className="glass p-6 rounded-3xl border border-white/5 bg-gradient-to-tr from-white/[0.02] to-transparent shadow-2xl flex flex-wrap gap-8 items-center">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner"><Calendar size={24} /></div>
           <div>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-1">Archived Period</p>
              <h4 className="text-sm font-black text-foreground">Select Month & Year</h4>
           </div>
        </div>
        
        <div className="h-12 w-px bg-border hidden sm:block"></div>

        <div className="flex gap-3">
          <select 
            value={form.month} 
            onChange={e => setForm({...form, month: Number(e.target.value)})}
            className="bg-secondary/50 border border-border px-5 py-3 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-primary/20 shadow-inner appearance-none min-w-[140px]"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>
            ))}
          </select>
          <select 
            value={form.year} 
            onChange={e => setForm({...form, year: Number(e.target.value)})}
            className="bg-secondary/50 border border-border px-5 py-3 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-primary/20 shadow-inner appearance-none min-w-[100px]"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 uppercase tracking-widest uppercase">
           <CheckCircle size={14} strokeWidth={3} /> System Audited
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Salary Chart */}
        <div className="glass-card p-10 shadow-2xl relative overflow-hidden group border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <PieIcon size={160} />
          </div>
          <div className="flex items-center justify-between mb-10">
             <div>
               <h3 className="text-xl font-black tracking-tight">Disbursement Insights</h3>
               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Salary Payout Comparison (Top 8)</p>
             </div>
             <div className="p-3 bg-secondary/50 rounded-2xl border border-border text-muted-foreground"><Filter size={16} /></div>
          </div>
          
          <div className="h-80 w-full mt-4">
             {loading ? (
                <div className="h-full w-full bg-white/5 animate-pulse rounded-3xl"></div>
             ) : chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900}}
                      width={100}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.02)'}}
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 15, 30, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        backdropFilter: 'blur(20px)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="salary" radius={[0, 8, 8, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(217.2 91.2% ${65 - (index * 5)}%)`} />
                      ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm font-black opacity-30 tracking-widest uppercase">Insufficient data for visualization.</div>
             )}
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="glass-card shadow-2xl p-0 flex flex-col overflow-hidden border-white/5">
           <div className="p-8 border-b border-border flex items-center justify-between bg-white/[0.01]">
              <div>
                <h3 className="text-xl font-black tracking-tight">Period Ledger Breakdown</h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Raw payout data for internal audits</p>
              </div>
              <Table size={24} className="text-muted-foreground/20" />
           </div>
           
           <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-secondary/30 text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground border-b border-border">
                       <th className="px-8 py-5">Verified Employee</th>
                       <th className="px-8 py-5 text-right">Settlement Amount</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {summary?.records.length > 0 ? summary.records.slice(0, 10).map((r, i) => (
                       <tr key={i} className="hover:bg-white/[0.02] transition-all group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary group-hover:text-white transition-all">{r.employee_name.charAt(0)}</div>
                                <div>
                                   <p className="font-black text-sm group-hover:text-primary transition-colors">{r.employee_name}</p>
                                   <div className="flex items-center gap-1.5 text-[10px] uppercase font-black text-emerald-500 mt-1 opacity-70">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Scanned
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-xl">
                             <span className="text-muted-foreground font-bold text-xs mr-2 opacity-50">₹</span>{r.calculated_salary.toLocaleString()}
                          </td>
                       </tr>
                    )) : (
                       <tr><td colSpan="2" className="px-8 py-24 text-center text-muted-foreground italic font-black uppercase tracking-widest text-lg opacity-20">No disbursement records archived.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
           <div className="p-6 bg-secondary/10 border-t border-border mt-auto">
              <button className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all group">
                 View Historical Ledger <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>

      {/* Feature Highlight Card */}
      <div className="glass-card p-10 border-primary/20 bg-gradient-to-tr from-primary/10 via-transparent to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-center justify-between gap-10 group relative overflow-hidden">
         <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full"></div>
         <div className="max-w-2xl relative z-10">
            <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/30 mb-8 group-hover:scale-110 transition-transform">
               <Database size={28} />
            </div>
            <h2 className="text-3xl font-black mb-4 leading-tight tracking-tighter uppercase whitespace-nowrap">Immutable Ledger Management</h2>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-xl">
              All payroll transactions are securely hashed and partitioned by your organization ID in our PostgreSQL ledger. Generate deep-linkable reports for tax auditing, investment presentations, or internal performance reviews with a single click.
            </p>
         </div>
         <div className="flex flex-wrap gap-4 justify-center md:justify-end relative z-10">
            <div className="glass p-5 rounded-3xl border border-white/5 text-center min-w-[140px] shadow-xl hover:translate-y-[-5px] transition-transform">
               <h4 className="text-2xl font-black text-primary mb-1">JSON</h4>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">API Format</p>
            </div>
            <div className="glass p-5 rounded-3xl border border-white/5 text-center min-w-[140px] shadow-xl hover:translate-y-[-5px] transition-transform border-emerald-500/10">
               <h4 className="text-2xl font-black text-emerald-500 mb-1">CSV</h4>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Spreadsheet</p>
            </div>
            <div className="glass p-5 rounded-3xl border border-white/5 text-center min-w-[140px] shadow-xl opacity-40 grayscale scale-95">
               <h4 className="text-2xl font-black text-rose-500 mb-1">PDF</h4>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Upcoming</p>
            </div>
         </div>
      </div>
    </div>
  );
}
