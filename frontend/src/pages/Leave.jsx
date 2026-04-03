import { useEffect, useState } from "react";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    reason: ""
  });

  const fetchLeaves = async () => {
    const res = await API.get("/leave/");
    setLeaves(res.data);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const applyLeave = async (e) => {
    e.preventDefault();

    if (!form.employee_id || !form.start_date || !form.end_date) {
      return toast.error("All fields required");
    }

    await API.post("/leave/apply", {
      ...form,
      employee_id: Number(form.employee_id)
    });

    toast.success("Leave applied");
    fetchLeaves();
  };

  const updateStatus = async (id, status) => {
    await API.put(`/leave/${id}`, { status });
    fetchLeaves();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leave Management</h1>

      <form onSubmit={applyLeave} className="space-y-2 mb-6">
        <input
          placeholder="Employee ID"
          className="border p-2 w-full"
          value={form.employee_id}
          type="number"
          onChange={(e) =>
            setForm({ ...form, employee_id: e.target.value })
          }
        />

        <input
          type="date"
          className="border p-2 w-full"
          value={form.start_date}
          onChange={(e) =>
            setForm({ ...form, start_date: e.target.value })
          }
        />

        <input
          type="date"
          className="border p-2 w-full"
          value={form.end_date}
          onChange={(e) =>
            setForm({ ...form, end_date: e.target.value })
          }
        />

        <input
          placeholder="Reason"
          className="border p-2 w-full"
          value={form.reason}
          onChange={(e) =>
            setForm({ ...form, reason: e.target.value })
          }
        />

        <button className="bg-blue-500 text-white px-4 py-2">
          Apply Leave
        </button>
      </form>

      <div className="space-y-2">
        {leaves.map((l) => (
          <div key={l.id} className="border p-3">
            <p>Employee: {l.employee_id}</p>
            <p>{l.start_date} → {l.end_date}</p>
            <p>Status: {l.status}</p>

            {l.status === "Pending" && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => updateStatus(l.id, "Approved")}
                  className="bg-green-500 text-white px-2 py-1"
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(l.id, "Rejected")}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}