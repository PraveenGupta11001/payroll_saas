from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    role = Column(String)
    salary_type = Column(String)  # Monthly / Daily
    salary_amount = Column(Float)

    attendance = relationship("Attendance", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date)
    status = Column(String)

    employee = relationship("Employee", back_populates="attendance")


class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    reason = Column(String)
    status = Column(String, default="Pending")

    employee = relationship("Employee", back_populates="leaves")