import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import API from "../api/api";
import toast from "react-hot-toast";
import { 
  Plus, Calendar, CheckCircle, XCircle, Clock, Info, 
  Filter, Search, ArrowRight, User, MoreVertical
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Leave() {
  const { org } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("all"); // all, pending, approved
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [form, setForm] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    reason: ""
  });

  const fetchLeaves = async () => {
    if (!org) return;
    try {
      setLoading(true);
      const res = await API.get("/leave/");
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [org]);

  const applyLeave = async (e) => {
    e.preventDefault();
    try {
      await API.post("/leave/", {
        ...form,
        employee_id: Number(form.employee_id)
      });
      toast.success("Leave request submitted");
      setShowApplyModal(false);
      setForm({ employee_id: "", start_date: "", end_date: "", reason: "" });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Submission failed");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/leave/${id}/status`, { status });
      toast.success(`Leave ${status.toLowerCase()}ed`);
      fetchLeaves();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredLeaves = leaves.filter(l => {
    if (view === "all") return true;
    return l.status.toLowerCase() === view.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Leave Management</h1>
          <p className="text-muted-foreground font-medium">Administer and track time-off requests for <span className="text-primary font-bold">{org?.name}</span>.</p>
        </div>
        <button 
          onClick={() => setShowApplyModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-12 transition-transform" /> Apply New Leave
        </button>
      </div>

      <div className="flex gap-2 bg-secondary/30 p-1 rounded-xl w-fit border border-border mt-8">
         {["all", "pending", "approved", "rejected"].map((t) => (
           <button 
             key={t}
             onClick={() => setView(t)}
             className={cn("px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all", view === t ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary")}
           >
             {t}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700 mt-8">
         {loading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-64 glass-card animate-pulse"></div>)
         ) : filteredLeaves.length > 0 ? (
           filteredLeaves.map((l) => (
             <div key={l.id} className="glass-card p-6 flex flex-col justify-between border-white/5 relative group overflow-hidden hover:border-primary/30 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-1 hover:bg-white/10 rounded-md text-muted-foreground"><MoreVertical size={16} /></button>
                </div>

                <div>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xl">
                        {l.employee_name ? l.employee_name.charAt(0) : <User size={24} />}
                      </div>
                      <div>
                        <h4 className="text-md font-black tracking-tight">{l.employee_name || `ID: ${l.employee_id}`}</h4>
                        <div className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1.5 mt-1",
                          l.status === "Pending" ? "bg-amber-500/10 text-amber-500" : 
                          l.status === "Approved" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>
                          <Clock size={12} /> {l.status}
                        </div>
                      </div>
                   </div>

                   <div className="glass p-4 rounded-xl border border-white/5 mb-6">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2 px-1">
                        <span>Period</span>
                        <span className="text-primary">Action Required</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <div className="flex-1 text-xs font-black bg-secondary/50 px-3 py-2 rounded-xl border border-border text-center whitespace-nowrap">{l.start_date}</div>
                        <ArrowRight size={14} className="text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 text-xs font-black bg-secondary/50 px-3 py-2 rounded-xl border border-border text-center whitespace-nowrap">{l.end_date}</div>
                      </div>
                   </div>

                   <div className="mb-2">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1.5 ml-1">Reason</p>
                      <p className="text-xs font-bold text-foreground p-4 bg-secondary/30 rounded-2xl border border-border italic leading-relaxed text-muted-foreground">
                        "{l.reason}"
                      </p>
                   </div>
                </div>

                {l.status === "Pending" && (
                   <div className="flex gap-3 mt-8">
                      <button 
                        onClick={() => updateStatus(l.id, "Approved")}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => updateStatus(l.id, "Rejected")}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                      >
                        <XCircle size={16} /> Deny
                      </button>
                   </div>
                )}
             </div>
           )).reverse()
         ) : (
           <div className="col-span-full py-24 glass-card text-center text-muted-foreground font-black italic flex flex-col items-center justify-center border-dashed border-border/50">
              <Calendar size={48} className="mb-4 opacity-20" />
              <p>No leave requests archived under this status.</p>
           </div>
         )}
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setShowApplyModal(false)}></div>
          <div className="relative glass-card w-full max-w-lg shadow-2xl p-8 border border-white/5 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black mb-1">Time Off Request</h2>
            <p className="text-sm text-muted-foreground font-medium mb-8">Submit a leave application for a member of <span className="text-primary font-bold">{org?.name}</span>.</p>
            
            <form onSubmit={applyLeave} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">Employee ID</label>
                <input required type="number" className="w-full bg-secondary/50 border border-border p-4 rounded-2xl outline-none focus:ring-1 focus:ring-primary text-sm font-black shadow-inner" value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} placeholder="Enter system ID..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">Start Date</label>
                  <input required type="date" className="w-full bg-secondary/50 border border-border p-4 rounded-2xl outline-none focus:ring-1 focus:ring-primary text-sm font-black" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">End Date</label>
                  <input required type="date" className="w-full bg-secondary/50 border border-border p-4 rounded-2xl outline-none focus:ring-1 focus:ring-primary text-sm font-black" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">Reason / Purpose</label>
                <textarea required className="w-full bg-secondary/50 border border-border p-4 rounded-2xl outline-none focus:ring-1 focus:ring-primary text-sm min-h-[120px] shadow-inner font-bold" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Detail the necessity of this leave..." />
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-border/50">
                <button type="button" onClick={() => setShowApplyModal(false)} className="flex-1 bg-secondary text-foreground font-black p-4 rounded-2xl transition-all hover:bg-secondary/80">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-primary-foreground font-black p-4 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95">Complete Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}