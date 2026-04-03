from pydantic import BaseModel, field_validator
from datetime import date
from typing import List
from enum import Enum


# ENUMS
class AttendanceStatus(str, Enum):
    present = "Present"
    absent = "Absent"


class LeaveStatus(str, Enum):
    pending = "Pending"
    approved = "Approved"
    rejected = "Rejected"


class EmployeeCreate(BaseModel):
    name: str
    role: str
    salary_type: str
    salary_amount: float


class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: AttendanceStatus


class BulkAttendanceCreate(BaseModel):
    records: List[AttendanceCreate]


class LeaveCreate(BaseModel):
    employee_id: int
    start_date: date
    end_date: date
    reason: str


class LeaveUpdateStatus(BaseModel):
    status: LeaveStatus