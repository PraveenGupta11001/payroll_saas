import { useState } from "react";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Payroll() {
  const [form, setForm] = useState({
    employee_id: "",
    month: "",
    year: ""
  });

  const [result, setResult] = useState(null);

  const fetchPayroll = async () => {
    if (!form.employee_id || !form.month || !form.year) {
      return toast.error("All fields required");
    }

    if (form.month < 1 || form.month > 12) {
      return toast.error("Month must be between 1 and 12");
    }
    if (form.year < 2000 || form.year > 2100) {
      return toast.error("Year must be between 2000 and 2100");
    }

    const res = await API.get(
      `/payroll/${form.employee_id}?month=${form.month}&year=${form.year}`
    );

    setResult(res.data);
    toast.success("Payroll calculated");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payroll</h1>

      <div className="space-y-2 mb-6">
        <input
          placeholder="Employee ID"
          className="border p-2 w-full"
          type="number"
          onChange={(e) =>
            setForm({ ...form, employee_id: e.target.value })
          }
        />

        <input
          placeholder="Month (1-12)"
          className="border p-2 w-full"
          type="number"
          onChange={(e) =>
            setForm({ ...form, month: e.target.value })
          }
        />

        <input
          placeholder="Year (2000-2100)"
          className="border p-2 w-full"
          type="number"
          min="2000"
          max="2100"
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