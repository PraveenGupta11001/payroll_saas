import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import API from "../api/api";
import toast from "react-hot-toast";
import { 
  CreditCard, Search, Calendar, Download, Calculator, 
  User, IndianRupee, Info, CheckCircle, ArrowRight, Table, Layers
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Payroll() {
  const { org } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employee_id: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [view, setView] = useState("calculator"); // calculator, bulk

  const fetchEmployees = async () => {
    if (!org) return;
    try {
      const res = await API.get("/employees/");
      setEmployees(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSummary = async () => {
    if (!org) return;
    try {
      const res = await API.get(`/payroll/summary/?month=${form.month}&year=${form.year}`);
      setSummary(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchEmployees();
    fetchSummary();
  }, [org, form.month, form.year]);

  const fetchPayroll = async () => {
    if (!form.employee_id) return toast.error("Select an employee");
    setLoading(true);
    try {
      const res = await API.get(
        `/payroll/calculate/${form.employee_id}?month=${form.month}&year=${form.year}`
      );
      setResult(res.data);
      toast.success("Payroll calculated");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Payroll Engine</h1>
          <p className="text-muted-foreground font-medium">Process disbursements for <span className="text-primary font-bold">{org?.name}</span>'s active workforce.</p>
        </div>
        <div className="flex bg-secondary/30 p-1 rounded-xl border border-border mt-4">
           <button 
             onClick={() => setView("calculator")}
             className={cn("px-5 py-2 rounded-lg text-xs font-black uppercase transition-all tracking-widest", view === "calculator" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary")}
           >
             Calculator
           </button>
           <button 
             onClick={() => setView("summary")}
             className={cn("px-5 py-2 rounded-lg text-xs font-black uppercase transition-all tracking-widest", view === "summary" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary")}
           >
             Monthly Summary
           </button>
        </div>
      </div>

      {/* Global Month/Year Filter */}
      <div className="glass p-5 rounded-2xl flex flex-wrap gap-6 items-center border border-white/5 bg-gradient-to-tr from-white/[0.02] to-transparent shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-inner">
             <Calendar size={18} />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Disbursement Period</p>
             <h4 className="text-sm font-black">Active Payroll Cycle</h4>
          </div>
        </div>
        <div className="h-10 w-px bg-border hidden sm:block"></div>
        <div className="flex gap-2">
          <select 
            value={form.month} 
            onChange={e => setForm({...form, month: Number(e.target.value)})}
            className="bg-secondary/50 border border-border px-4 py-2.5 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>
            ))}
          </select>
          <select 
            value={form.year} 
            onChange={e => setForm({...form, year: Number(e.target.value)})}
            className="bg-secondary/50 border border-border px-4 py-2.5 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {view === "calculator" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          {/* Form Side */}
          <div className="glass-card p-6 h-fit space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 blur-3xl rounded-full"></div>
            <h3 className="text-lg font-black flex items-center gap-2">
              <Calculator size={18} className="text-primary" /> Single Calculation
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">Target Employee</label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <select 
                    className="w-full bg-secondary/50 border border-border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-black shadow-inner appearance-none transition-all cursor-pointer"
                    value={form.employee_id}
                    onChange={e => setForm({...form, employee_id: e.target.value})}
                   >
                    <option value="">Search team member...</option>
                    {employees.map(e => <option key={e.id} value={e.id} className="bg-background">{e.name} ({e.role})</option>)}
                   </select>
                </div>
              </div>

              <button 
                onClick={fetchPayroll}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black p-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                {loading ? <div className="w-5 h-5 border-3 border-primary-foreground border-t-transparent rounded-full animate-spin"></div> : <>Process Payslip <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>

          {/* Result Side */}
          <div className="lg:col-span-2">
            {result ? (
               <div className="glass-card p-10 border-primary/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary"></div>
                  <div className="flex justify-between items-start mb-10">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-primary/30 group">
                           <User size={32} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                           <h2 className="text-3xl font-black tracking-tight mb-1">{result.employee_name}</h2>
                           <div className="flex items-center gap-2">
                             <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{form.month}/{form.year} Cycle</div>
                             <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500">Verified ID #{result.employee_id}</div>
                           </div>
                        </div>
                     </div>
                     <button className="bg-secondary/50 hover:bg-primary hover:text-white p-3 rounded-2xl transition-all text-muted-foreground border border-border flex items-center gap-2 group shadow-lg">
                        <Download size={20} className="group-hover:translate-y-0.5 transition-transform" /> <span className="text-xs font-black">PDF</span>
                     </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-10">
                     <div className="p-4 bg-secondary/20 rounded-2xl border border-border/50 group hover:border-primary/20 transition-all">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2">Ledger Status</p>
                        <div className="flex items-center gap-1.5 text-emerald-500 font-black text-sm">
                           <CheckCircle size={14} strokeWidth={3} /> Reconciled
                        </div>
                     </div>
                     <div className="p-4 bg-secondary/20 rounded-2xl border border-border/50 group hover:border-primary/20 transition-all">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2">Activity Count</p>
                        <p className="text-xl font-black text-foreground">{result.present_days} <span className="text-xs font-bold text-muted-foreground uppercase">Log-ins</span></p>
                     </div>
                     <div className="p-4 bg-secondary/20 rounded-2xl border border-border/50 group hover:border-primary/20 transition-all">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2">Exemptions</p>
                        <p className="text-xl font-black text-rose-500">{result.absent_days} <span className="text-xs font-bold text-muted-foreground uppercase text-rose-500/50">Absences</span></p>
                     </div>
                  </div>

                  <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-transparent shadow-inner">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                        <IndianRupee size={150} />
                     </div>
                     <h4 className="text-xs font-black mb-6 flex items-center gap-2 tracking-tight text-white/40 uppercase">
                        <Calculator size={16} className="text-primary" /> Net Disbursement
                     </h4>
                     <div className="flex items-end gap-3 mb-6">
                        <span className="text-4xl font-black text-primary/50 mb-1">₹</span>
                        <h1 className="text-7xl font-black tracking-tighter text-foreground drop-shadow-2xl">{result.calculated_salary.toLocaleString()}</h1>
                        <span className="text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em] border-l border-border pl-3 ml-2">Total Amount</span>
                     </div>
                     <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 w-fit rounded-xl border border-primary/20">
                        <div className="p-1 bg-primary rounded-md"><Layers size={10} className="text-white" /></div>
                        <code className="text-[10px] font-black text-primary tracking-widest">CALC: PRCNT_DAYS * DAILY_RATE</code>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="glass-card h-full flex flex-col items-center justify-center p-24 text-center border-dashed border-border/50 bg-transparent opacity-60">
                  <div className="w-20 h-20 bg-secondary/30 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-4 ring-white/5">
                     <Search size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="font-black text-xl text-foreground mb-2">No Employee Selected</h3>
                  <p className="text-sm text-muted-foreground font-medium max-w-xs leading-relaxed">Choose a team member from the left panel to execute their payroll calculation for this month.</p>
               </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
           {summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="glass-card p-6 flex items-center gap-5 bg-gradient-to-tr from-primary/10 to-transparent shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-xl shadow-primary/10"><Users size={24} /></div>
                    <div><p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Active Team</p><h4 className="text-2xl font-black tracking-tight">{summary.total_employees} Members</h4></div>
                 </div>
                 <div className="glass-card p-6 flex items-center gap-5 bg-gradient-to-tr from-emerald-500/10 to-transparent shadow-xl border-emerald-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10"><IndianRupee size={24} /></div>
                    <div><p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Payout</p><h4 className="text-2xl font-black tracking-tight">₹{summary.total_disbursement.toLocaleString()}</h4></div>
                 </div>
                 <div className="glass-card p-6 flex items-center gap-5 bg-gradient-to-tr from-indigo-500/10 to-transparent shadow-xl border-indigo-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10"><Layers size={24} /></div>
                    <div><p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Average / Cap</p><h4 className="text-2xl font-black tracking-tight">₹{(summary.total_disbursement / summary.total_employees || 0).toFixed(0)}</h4></div>
                 </div>
              </div>
           )}

           <div className="glass-card overflow-hidden shadow-2xl border-white/5">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                 <h3 className="font-black text-lg tracking-tight">Monthly Ledger Summary</h3>
                 <div className="flex items-center gap-2 px-3 py-1 bg-secondary p-2 rounded-lg border border-border text-xs font-black text-muted-foreground">
                    <Table size={14} /> Organization View
                 </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-secondary/20 text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground border-b border-white/5">
                         <th className="px-8 py-5">Employee Name</th>
                         <th className="px-8 py-5">Activity Index</th>
                         <th className="px-8 py-5">Net Payable</th>
                         <th className="px-8 py-5 text-right">Verification</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {summary?.records.length > 0 ? summary.records.map(record => (
                         <tr key={record.employee_id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-black text-primary group-hover:bg-primary group-hover:text-white transition-all uppercase">{record.employee_name.charAt(0)}</div>
                                  <span className="font-black text-sm group-hover:text-primary transition-colors">{record.employee_name}</span>
                               </div>
                            </td>
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="flex-1 max-w-[100px] h-1.5 bg-secondary rounded-full overflow-hidden">
                                     <div className="h-full bg-primary" style={{width: `${(record.present_days / 30) * 100}%`}}></div>
                                  </div>
                                  <span className="text-[10px] font-black bg-secondary/50 px-2 py-1 rounded-md border border-border text-muted-foreground whitespace-nowrap">{record.present_days} / 30 Days</span>
                               </div>
                            </td>
                            <td className="px-8 py-5 font-black text-md">₹{record.calculated_salary.toLocaleString()}</td>
                            <td className="px-8 py-5 text-right">
                               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all ring-offset-background group-hover:ring-2 ring-emerald-500/20">
                                  <CheckCircle size={14} strokeWidth={3} /> Verified
                               </div>
                            </td>
                         </tr>
                      )) : (
                        <tr>
                           <td colSpan="4" className="px-8 py-20 text-center text-muted-foreground italic font-black opacity-30 tracking-widest text-lg">No disbursements indexed.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}