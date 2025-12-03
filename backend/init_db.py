from database import engine, Base
# Import models so they are registered with Base.metadata
from models import Patient, Appointment, MedicalRecord 

def init_models():
    print("Creating tables in database...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    init_models()
