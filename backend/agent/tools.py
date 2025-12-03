from langchain_core.tools import tool
from agent.schemas import AnamneseSchema, EvolucaoSchema
from database import SessionLocal
from models import MedicalRecord, Appointment, Patient
import datetime

@tool
def save_anamnese(data: AnamneseSchema) -> str:
    """
    Salva uma ficha de Anamnese no banco de dados.
    Use esta ferramenta quando o texto for identificado como uma Anamnese (queixa, histórico, sintomas).
    """
    print(f"--- TOOL: Saving Anamnese ---")
    print(f"Data: {data}")
    
    try:
        db = SessionLocal()
        
        # Create dummy patient/appointment if not exists (for MVP/PoC)
        # In a real scenario, we would link to an existing appointment based on context
        patient = db.query(Patient).filter(Patient.phone == "5511999999999").first()
        if not patient:
            patient = Patient(name="Paciente Teste", phone="5511999999999")
            db.add(patient)
            db.commit()
            db.refresh(patient)
            
        appointment = Appointment(patient_id=patient.id, date_time=datetime.datetime.now(), status="completed")
        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        record = MedicalRecord(
            appointment_id=appointment.id,
            record_type="anamnese", 
            structured_content=data.model_dump(), # Pydantic v2
            full_transcription="Transcrição salva via tool" # We should pass this if possible, or update later
        )
        db.add(record)
        
        try:
            db.commit()
            print(f"✅ DB COMMIT SUCCESS: Anamnese ID {record.id} saved for Patient {patient.name}")
            return f"Anamnese salva com sucesso. ID: {record.id}"
        except Exception as commit_error:
            db.rollback()
            print(f"❌ DB COMMIT ERROR: {commit_error}")
            return f"Erro crítico ao persistir no banco: {str(commit_error)}"

    except Exception as e:
        print(f"Error saving anamnese: {e}")
        return f"Erro ao salvar anamnese: {str(e)}"
    finally:
        db.close()

@tool
def save_evolucao(data: EvolucaoSchema) -> str:
    """
    Salva uma ficha de Evolução Clínica no banco de dados.
    Use esta ferramenta quando o texto for identificado como uma Evolução (procedimento realizado, dentes tratados).
    """
    print(f"--- TOOL: Saving Evolucao ---")
    print(f"Data: {data}")
    
    try:
        db = SessionLocal()
        
        # Create dummy patient/appointment if not exists (for MVP/PoC)
        patient = db.query(Patient).filter(Patient.phone == "5511999999999").first()
        if not patient:
            patient = Patient(name="Paciente Teste", phone="5511999999999")
            db.add(patient)
            db.commit()
            db.refresh(patient)
            
        appointment = Appointment(patient_id=patient.id, date_time=datetime.datetime.now(), status="completed")
        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        record = MedicalRecord(
            appointment_id=appointment.id,
            record_type="evolucao", 
            structured_content=data.model_dump(),
            full_transcription="Transcrição salva via tool"
        )
        db.add(record)
        
        try:
            db.commit()
            print(f"✅ DB COMMIT SUCCESS: Evolucao ID {record.id} saved for Patient {patient.name}")
            return f"Evolução salva com sucesso. ID: {record.id}"
        except Exception as commit_error:
            db.rollback()
            print(f"❌ DB COMMIT ERROR: {commit_error}")
            return f"Erro crítico ao persistir no banco: {str(commit_error)}"

    except Exception as e:
        print(f"Error saving evolucao: {e}")
        return f"Erro ao salvar evolução: {str(e)}"
    finally:
        db.close()

@tool
def handle_inquiry(response: str) -> str:
    """
    Responde a uma dúvida ou comando do usuário que não seja um registro clínico.
    """
    print(f"--- TOOL: Handling Inquiry ---")
    print(f"Response: {response}")
    return "Resposta enviada ao usuário."
