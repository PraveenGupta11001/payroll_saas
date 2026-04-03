# Payroll SaaS System

A mini full-stack SaaS application to manage employees, attendance, leave, and payroll.

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- SQLite

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Hot Toast

---

## Setup Instructions

### 🔹 Backend Setup

```bash
pip install fastapi uvicorn sqlalchemy pydantic python-dotenv
uvicorn app.main:app --reload
````

Backend runs on:

```
http://localhost:8000 (for local)
```

---

### 🔹 Frontend Setup

```bash
npx create-vite@latest frontend
cd frontend
npm install
npm install axios
npm install tailwindcss @tailwindcss/vite
npm install react-hot-toast
npm install react-icons
npm run dev
```

Frontend runs on:

```
http://localhost:5173 (for local)
```

---

## Features

* Employee Management (Create, Read, Update, Delete)
* Attendance Management (Single + Bulk, Idempotent)
* Leave Management (Apply + Approve/Reject)
* Payroll Calculation (Monthly/Daily based)
* Form validation + toast notifications
* Clean UI with Tailwind

---

## Design Decisions

* Attendance API is **idempotent** (updates instead of duplicates)
* Payroll is **calculated dynamically** (no redundant storage)
* Validation handled using **Pydantic + Enums**
* Simple architecture focused on MVP delivery

---

## API Documentation

Base URL:

```
http://localhost:8000
```

---

### Employees

#### Create Employee

```
POST /employees/
```

Request:

```json
{
  "name": "John",
  "role": "Developer",
  "salary_type": "Monthly",
  "salary_amount": 30000
}
```

---

#### Get All Employees

```
GET /employees/
```

---

#### Get Employee by ID

```
GET /employees/{id}
```

---

#### Update Employee

```
PUT /employees/{id}
```

---

#### Delete Employee

```
DELETE /employees/{id}
```

---

### Attendance

#### Mark Attendance (Create or Update)

```
POST /attendance/
```

```json
{
  "employee_id": 1,
  "date": "2026-04-03",
  "status": "Present"
}
```

---

#### Bulk Attendance

```
POST /attendance/bulk
```

```json
{
  "records": [
    {
      "employee_id": 1,
      "date": "2026-04-03",
      "status": "Present"
    }
  ]
}
```

---

#### Get All Attendance

```
GET /attendance/
```

---

#### Get Attendance by Employee

```
GET /attendance/{employee_id}
```

---

### Leave

#### Apply Leave

```
POST /leave/apply
```

```json
{
  "employee_id": 1,
  "start_date": "2026-04-01",
  "end_date": "2026-04-02",
  "reason": "Sick"
}
```

---

#### Update Leave Status

```
PUT /leave/{leave_id}
```

```json
{
  "status": "Approved"
}
```

---

#### Get All Leaves

```
GET /leave/
```

---

#### Get Leave by Employee

```
GET /leave/{employee_id}
```

---

### Payroll

#### Calculate Salary

```
GET /payroll/{employee_id}?month=4&year=2026
```

Response:

```json
{
  "employee_name": "John",
  "present_days": 20,
  "salary": 20000
}
```

---

## Frontend Structure

```
src/
├── api/
│   └── api.js
├── pages/
│   ├── Employees.jsx
│   ├── Attendance.jsx
│   ├── Leave.jsx
│   └── Payroll.jsx
├── App.jsx
└── main.jsx
```

---

## Frontend Features

* Form validation (required fields)
* Toast notifications for success/error
* Simple navigation
* API integration using Axios
* Responsive layout (basic)

---

## Limitations

* No authentication (single-user system)
* SQLite used (can be replaced with PostgreSQL in production)
* No role-based access

---

## Future Improvements

* Add authentication (JWT)
* Role-based access (Admin/User)
* Store payroll history
* Dashboard analytics
* Pagination & filters

---

## Conclusion

This project demonstrates:

* Full-stack development
* API design
* Data validation
* Real-world SaaS MVP thinking