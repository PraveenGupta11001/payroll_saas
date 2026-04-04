import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import API from "../api/api";
import toast from "react-hot-toast";
import { 
  Users, UserPlus, Search, Filter, MoreVertical, 
  Mail, Phone, Briefcase, Calendar, DollarSign, Trash2, Edit2, ShieldAlert
} from "lucide-react";
import { cn } from "../lib/utils";

const EmployeeCard = ({ employee, onDelete }) => (
  <div className="glass-card p-6 flex flex-col gap-4 group hover:border-primary/30 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xl">
          {employee.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{employee.name}</h3>
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><Briefcase size={12}/>{employee.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
         <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"><Edit2 size={14}/></button>
         <button onClick={() => onDelete(employee.id)} className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-colors text-muted-foreground"><Trash2 size={14}/></button>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Contact</p>
        <div className="space-y-1">
          <p className="text-xs flex items-center gap-2 text-muted-foreground"><Mail size={12}/> {employee.email || 'N/A'}</p>
          <p className="text-xs flex items-center gap-2 text-muted-foreground"><Phone size={12}/> {employee.phone || 'N/A'}</p>
        </div>
      </div>
      <div className="space-y-2 text-right">
        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Payroll</p>
        <div className="space-y-1">
          <p className="text-md font-black flex items-center justify-end gap-1"><DollarSign size={14}/> {employee.salary_amount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{employee.salary_type}</p>
        </div>
      </div>
    </div>

    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
       <span className={cn(
         "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
         employee.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
       )}>
         {employee.status}
       </span>
       <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-1.5">
          <Calendar size={12}/> Joined {new Date(employee.join_date).toLocaleDateString()}
       </p>
    </div>
  </div>
);

export default function Employees() {
  const { org } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "", 
    salary_type: "Monthly", salary_amount: 0, 
    join_date: new Date().toISOString().split('T')[0],
    status: "Active"
  });

  useEffect(() => {
    if (org) {
      fetchEmployees();
    }
  }, [org]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get("/employees/");
      setEmployees(res.data);
    } catch (err) {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/employees/", form);
      toast.success("Employee added successfully");
      setShowAdd(false);
      setForm({
        name: "", email: "", phone: "", role: "", 
        salary_type: "Monthly", salary_amount: 0, 
        join_date: new Date().toISOString().split('T')[0],
        status: "Active"
      });
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add employee");
    }
  };

  const handleDelete = async (empId) => {
    if (!window.confirm("Are you sure you want to remove this employee?")) return;
    try {
      await API.delete(`/employees/${empId}`);
      toast.success("Employee removed");
      fetchEmployees();
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(query.toLowerCase()) || 
    e.role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Workforce Management</h1>
          <p className="text-muted-foreground font-medium">Manage and monitor your team members in <span className="text-primary font-bold">{org?.name}</span>.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95 group"
        >
          <UserPlus size={20} className="group-hover:rotate-12 transition-transform" /> Add New Employee
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 glass rounded-2xl border border-white/5 bg-gradient-to-tr from-white/[0.02] to-transparent">
        <div className="relative flex-grow max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <input 
             type="text" 
             placeholder="Search by name or designation..."
             className="w-full bg-secondary/50 border border-border px-10 py-3 rounded-xl text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-primary/20 transition-all"
             value={query}
             onChange={e => setQuery(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-secondary/50 border border-border rounded-xl hover:bg-primary/10 transition-colors group">
            <Filter size={18} className="text-muted-foreground group-hover:text-primary" />
          </button>
        </div>
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 glass animate-pulse rounded-2xl" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(emp => (
            <EmployeeCard key={emp.id} employee={emp} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 glass rounded-3xl border border-dashed border-border/50">
           <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground mb-4">
              <Users size={32} />
           </div>
           <h3 className="font-black text-xl mb-1">No Employees Found</h3>
           <p className="text-muted-foreground text-sm font-medium">Get started by adding your first team member.</p>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setShowAdd(false)}></div>
          <div className="relative glass-card p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-white/5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-2xl font-black">Hire New Talent</h3>
                  <p className="text-muted-foreground text-sm font-medium">Add a new member to the <span className="text-primary font-bold">{org?.name}</span> workspace.</p>
               </div>
               <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <UserPlus size={24} />
               </div>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">Full Name</label>
                    <input required className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:ring-1 focus:ring-primary font-bold text-sm shadow-inner" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">Enterprise Email</label>
                    <input className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:ring-1 focus:ring-primary font-bold text-sm shadow-inner" placeholder="john@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">Designation</label>
                    <input required className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:ring-1 focus:ring-primary font-bold text-sm shadow-inner" placeholder="Lead Architect" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">Salary Type</label>
                      <select className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:ring-1 focus:ring-primary font-bold text-sm" value={form.salary_type} onChange={e => setForm({...form, salary_type: e.target.value})}>
                        <option>Monthly</option>
                        <option>Daily</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">Compensation</label>
                      <input type="number" required className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:ring-1 focus:ring-primary font-bold text-sm shadow-inner" value={form.salary_amount} onChange={e => setForm({...form, salary_amount: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">Joining Date</label>
                    <input type="date" className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:ring-1 focus:ring-primary font-bold text-sm" value={form.join_date} onChange={e => setForm({...form, join_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">System Status</label>
                    <select className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:ring-1 focus:ring-primary font-bold text-sm" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
               </div>
              
              <div className="md:col-span-2 flex gap-3 pt-6 border-t border-border/50">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 bg-secondary text-foreground font-black px-4 py-4 rounded-2xl transition-all hover:bg-secondary/80">Cancel</button>
                <button type="submit" className="flex-[2] bg-primary text-primary-foreground font-black px-4 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">Complete Enrollment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}