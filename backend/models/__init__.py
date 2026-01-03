from database import Base
from .tenant import Tenant
from .clinical import Patient, Appointment, MedicalRecord
from .finance import FinancialDocument, Transaction, TaxAnalysis, TaxReport
