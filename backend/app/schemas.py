from pydantic import BaseModel, EmailStr, field_validator
from datetime import date, datetime
from typing import List, Optional
from enum import Enum


# ── Auth ──────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ── Organization ──────────────────────────────────────────
class OrgCreate(BaseModel):
    name: str


class OrgOut(BaseModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class OrgMemberCreate(BaseModel):
    user_email: str
    role: str  # OWNER, MANAGER, EDITOR


class OrgMemberOut(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrgWithRole(BaseModel):
    id: int
    name: str
    role: str
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Department ────────────────────────────────────────────
class DepartmentCreate(BaseModel):
    name: str


class DepartmentOut(BaseModel):
    id: int
    name: str
    org_id: int

    class Config:
        from_attributes = True


# ── Enums ─────────────────────────────────────────────────
class AttendanceStatus(str, Enum):
    present = "Present"
    absent = "Absent"
    half_day = "Half-Day"


class LeaveStatus(str, Enum):
    pending = "Pending"
    approved = "Approved"
    rejected = "Rejected"


# ── Employee ──────────────────────────────────────────────
class EmployeeCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    department_id: Optional[int] = None
    salary_type: str
    salary_amount: float
    join_date: Optional[date] = None
    status: Optional[str] = "Active"


class EmployeeOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    role: str
    department_id: Optional[int]
    org_id: int
    salary_type: str
    salary_amount: float
    join_date: Optional[date]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Attendance ────────────────────────────────────────────
class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: AttendanceStatus


class BulkAttendanceCreate(BaseModel):
    records: List[AttendanceCreate]


class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    status: str
    employee_name: Optional[str] = None

    class Config:
        from_attributes = True


# ── Leave ─────────────────────────────────────────────────
class LeaveCreate(BaseModel):
    employee_id: int
    start_date: date
    end_date: date
    reason: str


class LeaveUpdateStatus(BaseModel):
    status: LeaveStatus


class LeaveOut(BaseModel):
    id: int
    employee_id: int
    start_date: date
    end_date: date
    reason: Optional[str]
    status: str
    employee_name: Optional[str] = None

    class Config:
        from_attributes = True