import uuid
from sqlalchemy.orm import Session
from database import SessionLocal
from models.tenant import Tenant

def seed_default_tenant():
    with SessionLocal() as db:
        tenant = db.query(Tenant).filter(Tenant.slug == "default-tenant").first()
        if not tenant:
            tenant = Tenant(
                id=uuid.UUID("d0b1a2c3-e4f5-4a5b-8c9d-d0e1f2a3b4c5"),
                name="Default Tenant",
                slug="default-tenant"
            )
            db.add(tenant)
            db.commit()
            print(f"Created default tenant: {tenant.id}")
        else:
            print(f"Default tenant already exists: {tenant.id}")

if __name__ == "__main__":
    seed_default_tenant()
