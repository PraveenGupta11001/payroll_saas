import { useState } from "react";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import { FaMoneyCheckAlt } from "react-icons/fa";
import "./App.css";


export default function App() {
  const [page, setPage] = useState("employees");

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-blue-600 text-white p-4 flex items-center gap-2">
        <FaMoneyCheckAlt size={20} />
        <h1 className="text-lg font-semibold">Payroll SaaS</h1>
      </div>
      <nav className="flex gap-4 p-4 bg-gray-200">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2" onClick={() => setPage("employees")}>Employees</button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2" onClick={() => setPage("attendance")}>Attendance</button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2" onClick={() => setPage("leave")}>Leave</button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2" onClick={() => setPage("payroll")}>Payroll</button>
      </nav>

      {page === "employees" && <Employees />}
      {page === "attendance" && <Attendance />}
      {page === "leave" && <Leave />}
      {page === "payroll" && <Payroll />}
    </div>
  );
}