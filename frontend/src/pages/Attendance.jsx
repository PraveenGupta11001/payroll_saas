import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import API from "../api/api";
import toast from "react-hot-toast";
import { 
  Calendar, CheckCircle2, XCircle, Clock, Save, Plus, Search, 
  History, Users, ChevronDown, Check, Info
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Attendance() {
  const { org } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("daily"); // daily or history

  const fetchEmployees = async () => {
    if (!org) return;
    try {
      const res = await API.get("/employees/");
      setEmployees(res.data);
      // Initialize daily records mapping
      const initial = {};
      res.data.forEach(emp => {
        initial[emp.id] = "Present";
      });
      setAttendanceRecords(initial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
     if (!org) return;
     try {
       const res = await API.get("/attendance/");
       setHistory(res.data);
     } catch(err) { console.error(err); }
  };

  useEffect(() => {
    fetchEmployees();
    fetchHistory();
  }, [org]);

  const toggleStatus = (id) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [id]: prev[id] === "Present" ? "Absent" : "Present"
    }));
  };

  const submitBulk = async () => {
    const payload = {
      records: Object.keys(attendanceRecords).map(id => ({
        employee_id: Number(id),
        date: date,
        status: attendanceRecords[id]
      }))
    };

    try {
      await API.post("/attendance/bulk", payload);
      toast.success("Attendance synced for " + date);
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* View Switcher Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance System</h1>
          <p className="text-sm text-muted-foreground">Log daily activity or review historical attendance records.</p>
        </div>
        <div className="flex bg-secondary/50 p-1 rounded-xl border border-border shadow-inner">
           <button 
             onClick={() => setView("daily")}
             className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", view === "daily" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary")}
           >
             Daily Entry
           </button>
           <button 
             onClick={() => setView("history")}
             className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", view === "history" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary")}
           >
             Audit Logs
           </button>
        </div>
      </div>

      {view === "daily" ? (
        <div className="space-y-4 animate-in fade-in duration-500">
          {/* Daily Control Bar */}
          <div className="glass p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-secondary/50 border border-border pl-10 pr-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                />
              </div>
              <div className="h-8 w-px bg-border hidden sm:block"></div>
              <p className="text-xs font-medium text-muted-foreground hidden sm:block">
                Marking status for <span className="text-foreground font-bold">{employees.length}</span> active team members.
              </p>
            </div>
            
            <button 
              onClick={submitBulk}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <Save size={18} /> Sync Records
            </button>
          </div>

          <div className="relative group max-w-sm mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Quick search member..."
              className="w-full bg-secondary/30 border border-border pl-10 pr-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Bulk Entry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
             {loading ? (
                Array(6).fill(0).map((_, i) => <div key={i} className="h-24 glass-card animate-pulse"></div>)
             ) : filteredEmployees.map((emp) => (
               <div 
                 key={emp.id}
                 onClick={() => toggleStatus(emp.id)}
                 className={cn(
                   "glass-card p-4 flex items-center justify-between cursor-pointer group",
                   attendanceRecords[emp.id] === "Present" ? "border-emerald-500/20" : "border-rose-500/20"
                 )}
               >
                 <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border",
                      attendanceRecords[emp.id] === "Present" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                    )}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold truncate max-w-[120px]">{emp.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{emp.role}</p>
                    </div>
                 </div>

                 <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 transition-all group-hover:scale-105",
                    attendanceRecords[emp.id] === "Present" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                 )}>
                    {attendanceRecords[emp.id] === "Present" ? <Check size={12} strokeWidth={4} /> : <XCircle size={12} />}
                    {attendanceRecords[emp.id]}
                 </div>
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="glass-card shadow-xl overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-secondary/30 text-[10px] uppercase font-bold tracking-widest text-muted-foreground border-b border-border">
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Date Logged</th>
                      <th className="px-6 py-4">Observed Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/50">
                    {history.length > 0 ? history.map((record) => (
                      <tr key={record.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-3">
                           <p className="text-sm font-bold">{record.employee_name || `ID: ${record.employee_id}`}</p>
                        </td>
                        <td className="px-6 py-3">
                           <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded w-fit border border-border">
                             <Calendar size={12} /> {record.date}
                           </div>
                        </td>
                        <td className="px-6 py-3">
                           <span className={cn(
                             "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                             record.status === "Present" ? "text-emerald-500 py-0" : "text-rose-500 py-0"
                           )}>
                             {record.status === "Present" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                             {record.status}
                           </span>
                        </td>
                        <td className="px-6 py-3 text-right text-muted-foreground">
                           <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors"><Info size={14} /></button>
                        </td>
                      </tr>
                    )).reverse().slice(0, 50) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-20 text-center text-muted-foreground italic font-medium">No records indexed yet.</td>
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