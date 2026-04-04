from faker import Faker
from sqlalchemy.orm import Session
from .. import models
import random
from datetime import date, timedelta

fake = Faker()

def generate_dummy_data(db: Session, org_id: int, count: int = 100):
    # Verify org exists
    org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not org:
        return None

    # Get or create departments
    dept_names = ["Engineering", "HR", "Finance", "Marketing", "Sales", "Support", "Product", "Operations"]
    depts = []
    for name in dept_names:
        dept = db.query(models.Department).filter(models.Department.name == name, models.Department.org_id == org_id).first()
        if not dept:
            dept = models.Department(name=name, org_id=org_id)
            db.add(dept)
            db.commit()
            db.refresh(dept)
        depts.append(dept)

    # Generate employees
    employees = []
    for _ in range(count):
        salary_type = random.choice(["Monthly", "Daily"])
        salary_amount = random.randint(30000, 150000) if salary_type == "Monthly" else random.randint(1000, 5000)
        
        emp = models.Employee(
            name=fake.name(),
            email=fake.unique.email(),
            phone=fake.phone_number(),
            role=fake.job(),
            department_id=random.choice(depts).id,
            org_id=org_id,
            salary_type=salary_type,
            salary_amount=float(salary_amount),
            join_date=fake.date_between(start_date="-2y", end_date="today"),
            status="Active"
        )
        db.add(emp)
        employees.append(emp)
    
    db.commit()

    # Add some random attendance for the current month
    today = date.today()
    for emp in employees:
        # Mark attendance for the last 15 days
        for i in range(15):
            d = today - timedelta(days=i)
            if d.weekday() < 5: # Monday-Friday
                status = "Present" if random.random() > 0.1 else "Absent"
                att = models.Attendance(
                    employee_id=emp.id,
                    date=d,
                    status=status
                )
                db.add(att)
    
    db.commit()
    return len(employees)
