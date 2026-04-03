import { useState, useEffect } from "react";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Attendance() {
  const [records, setRecords] = useState([
    { employee_id: "", date: "", status: "Present" }
  ]);
  const [attendance, setAttendance] = useState([]);
 
  const fetchAttendance = async () => {
    const res = await API.get("/attendance");
    setAttendance(res.data);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const addRow = () => {
    setRecords([...records, { employee_id: "", date: "", status: "Present" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...records];
    updated[index][field] = value;
    setRecords(updated);
  };

  const submitBulk = async () => {
    
    if (!records[0].employee_id || !records[0].date || !records[0].status) {
      return toast.error("All fields required");
    }

    await API.post("/attendance/bulk", { records });
    toast.success("Attendance records submitted");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Bulk Attendance</h1>

      {records.map((r, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            placeholder="Employee ID"
            className="border p-2"
            type="number"
            onChange={(e) => handleChange(i, "employee_id", Number(e.target.value))}
          />
          <input
            type="date"
            className="border p-2"
            onChange={(e) => handleChange(i, "date", e.target.value)}
          />
          <select
            className="border p-2"
            onChange={(e) => handleChange(i, "status", e.target.value)}
          >
            <option>Present</option>
            <option>Absent</option>
          </select>
        </div>
      ))}

      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mr-2" onClick={addRow} >
        Add Row
      </button>

      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2" onClick={submitBulk} >
        Submit
      </button>

      <div className="mt-6 space-y-2">
        {attendance.map((record) => (
          <div key={record.id} className="border p-3">
            <p>Employee: {record.employee_id}</p>
            <p><b>{record.employee_name}</b></p>
            <p>{record.date}</p>
            <p>{record.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}