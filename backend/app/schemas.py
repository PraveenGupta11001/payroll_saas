from pydantic import BaseModel
from datetime import date

class EmployeeCreate(BaseModel):
    name: str
    role: str
    salary_type: str
    salary_amount: float


class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: str

class LeaveCreate(BaseModel):
    employee_id: int
    start_date: date
    end_date: date
    reason: str