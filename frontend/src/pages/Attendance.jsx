import { useState } from "react";
import API from "../api/api";

export default function Attendance() {
  const [records, setRecords] = useState([
    { employee_id: "", date: "", status: "Present" }
  ]);

  const addRow = () => {
    setRecords([...records, { employee_id: "", date: "", status: "Present" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...records];
    updated[index][field] = value;
    setRecords(updated);
  };

  const submitBulk = async () => {
    await API.post("/attendance/bulk", { records });
    alert("Submitted");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Bulk Attendance</h1>

      {records.map((r, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            placeholder="Employee ID"
            className="border p-2"
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

      <button onClick={addRow} className="bg-gray-500 text-white px-3 py-1 mr-2">
        Add Row
      </button>

      <button onClick={submitBulk} className="bg-blue-500 text-white px-3 py-1">
        Submit
      </button>
    </div>
  );
}