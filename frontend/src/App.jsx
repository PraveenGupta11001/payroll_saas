import { useState } from "react";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("employees");

  return (
    <div>
      <nav className="flex gap-4 p-4 bg-gray-200">
        <button onClick={() => setPage("employees")}>Employees</button>
        <button onClick={() => setPage("attendance")}>Attendance</button>
        <button onClick={() => setPage("leave")}>Leave</button>
        <button onClick={() => setPage("payroll")}>Payroll</button>
      </nav>

      {page === "employees" && <Employees />}
      {page === "attendance" && <Attendance />}
      {page === "leave" && <Leave />}
      {page === "payroll" && <Payroll />}
    </div>
  );
}