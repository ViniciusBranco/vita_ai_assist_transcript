import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from database import Base

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), index=True, nullable=True) # Temporarily nullable for migration
    name = Column(String, index=True)
    cpf = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, index=True, nullable=True)
    birth_date = Column(DateTime, nullable=True)
    aliases = Column(JSONB, default=[])
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    appointments = relationship("Appointment", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), index=True, nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    date_time = Column(DateTime)
    status = Column(String, default="scheduled")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    patient = relationship("Patient", back_populates="appointments")
    medical_records = relationship("MedicalRecord", back_populates="appointment")

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), index=True, nullable=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    record_type = Column(String)
    structured_content = Column(JSONB)
    full_transcription = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    appointment = relationship("Appointment", back_populates="medical_records")
