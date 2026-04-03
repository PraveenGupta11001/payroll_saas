import { useState } from "react";
import API from "../api/api";

export default function Payroll() {
  const [form, setForm] = useState({
    employee_id: "",
    month: "",
    year: ""
  });

  const [result, setResult] = useState(null);

  const fetchPayroll = async () => {
    const res = await API.get(
      `/payroll/${form.employee_id}?month=${form.month}&year=${form.year}`
    );

    setResult(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payroll</h1>

      <div className="space-y-2 mb-6">
        <input
          placeholder="Employee ID"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({ ...form, employee_id: e.target.value })
          }
        />

        <input
          placeholder="Month (1-12)"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({ ...form, month: e.target.value })
          }
        />

        <input
          placeholder="Year"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({ ...form, year: e.target.value })
          }
        />

        <button
          onClick={fetchPayroll}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Calculate Salary
        </button>
      </div>

      {result && (
        <div className="border p-4">
          <p><b>{result.employee_name}</b></p>
          <p>Present Days: {result.present_days}</p>
          <p>Salary: ₹{result.salary}</p>
          <p>Formula: {result.formula}</p>
        </div>
      )}
    </div>
  );
}