import { useEffect, useState } from "react";
import API from "../api/api";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: "",
    role: "",
    salary_type: "Monthly",
    salary_amount: ""
  });

  const fetchEmployees = async () => {
    const res = await API.get("/employees/");
    setEmployees(res.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await API.post("/employees/", {
      ...form,
      salary_amount: Number(form.salary_amount)
    });

    setForm({ name: "", role: "", salary_type: "Monthly", salary_amount: "" });
    fetchEmployees();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employees</h1>

      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input
          placeholder="Name"
          className="border p-2 w-full"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Role"
          className="border p-2 w-full"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />

        <select
          className="border p-2 w-full"
          value={form.salary_type}
          onChange={(e) => setForm({ ...form, salary_type: e.target.value })}
        >
          <option>Monthly</option>
          <option>Daily</option>
        </select>

        <input
          placeholder="Salary"
          type="number"
          className="border p-2 w-full"
          value={form.salary_amount}
          onChange={(e) => setForm({ ...form, salary_amount: e.target.value })}
        />

        <button className="bg-blue-500 text-white px-4 py-2">
          Add Employee
        </button>
      </form>

      <div className="space-y-2">
        {employees.map((emp) => (
          <div key={emp.id} className="border p-3">
            <p><b>{emp.name}</b></p>
            <p>{emp.role}</p>
            <p>{emp.salary_type} - ₹{emp.salary_amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}