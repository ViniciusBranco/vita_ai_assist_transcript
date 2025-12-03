from langchain_core.tools import tool
from agent.schemas import AnamneseSchema, EvolucaoSchema
from database import SessionLocal
from models import MedicalRecord, Appointment, Patient
import datetime
from sqlalchemy.orm import Session
from core.context import transcription_context

def _get_or_create_patient(db: Session, patient_name_raw: str | None) -> int:
    """
    Busca paciente pelo nome (case-insensitive) ou cria um novo.
    Retorna o ID do paciente.
    """
    if not patient_name_raw:
        # Tenta buscar um paciente "Desconhecido" ou cria um
        unknown_name = "Paciente Desconhecido"
        patient = db.query(Patient).filter(Patient.name == unknown_name).first()
        if not patient:
            patient = Patient(name=unknown_name, phone="0000000000") # Placeholder phone
            db.add(patient)
            db.commit()
            db.refresh(patient)
        return patient.id

    # Limpeza básica do nome (remove pontuação extra, espaços)
    clean_name = patient_name_raw.strip().replace(",", "").split(" (")[0] # Ex: "Ana, 30 anos" -> "Ana"
    
    # Busca exata (poderia ser ILIKE se fosse postgres específico, mas aqui usamos python logic ou filter)
    # Usando ilike para case insensitive no Postgres
    patient = db.query(Patient).filter(Patient.name.ilike(clean_name)).first()
    
    if not patient:
        # Cria novo
        # Gera um telefone dummy único se não tivermos (em produção pegariamos do cadastro)
        import uuid
        dummy_phone = f"55{str(uuid.uuid4().int)[:9]}" 
        
        patient = Patient(name=clean_name, phone=dummy_phone)
        db.add(patient)
        db.commit()
        db.refresh(patient)
        print(f"🆕 Created new patient: {clean_name} (ID: {patient.id})")
    else:
        print(f"✅ Found existing patient: {patient.name} (ID: {patient.id})")
        
    return patient.id

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
        
        # Resolve Patient
        patient_id = _get_or_create_patient(db, data.paciente)
            
        appointment = Appointment(patient_id=patient_id, date_time=datetime.datetime.now(), status="completed")
        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        record = MedicalRecord(
            appointment_id=appointment.id,
            record_type="anamnese", 
            structured_content=data.model_dump(), # Pydantic v2
            full_transcription=transcription_context.get()
        )
        db.add(record)
        
        try:
            db.commit()
            print(f"✅ DB COMMIT SUCCESS: Anamnese ID {record.id} saved for Patient ID {patient_id}")
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
        
        # Resolve Patient
        patient_id = _get_or_create_patient(db, data.paciente)
            
        appointment = Appointment(patient_id=patient_id, date_time=datetime.datetime.now(), status="completed")
        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        record = MedicalRecord(
            appointment_id=appointment.id,
            record_type="evolucao", 
            structured_content=data.model_dump(),
            full_transcription=transcription_context.get()
        )
        db.add(record)
        
        try:
            db.commit()
            print(f"✅ DB COMMIT SUCCESS: Evolucao ID {record.id} saved for Patient ID {patient_id}")
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
