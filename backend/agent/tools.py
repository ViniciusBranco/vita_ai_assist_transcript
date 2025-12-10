from langchain_core.tools import tool
from agent.schemas import AtendimentoSchema
from database import SessionLocal
from models import MedicalRecord, Appointment, Patient
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_
from core.context import transcription_context

def _get_or_create_patient(db: Session, patient_name_raw: str | None, cpf_raw: str | None = None) -> int:
    """
    Busca paciente pelo CPF (prioridade) ou nome, ou cria novo.
    """
    print(f"🔍 DEBUG: Resolving Patient. Name='{patient_name_raw}', CPF='{cpf_raw}'")

    # Clean CPF: Extract digits only
    clean_cpf = None
    if cpf_raw:
        digits = ''.join(filter(str.isdigit, cpf_raw))
        if digits:
            clean_cpf = digits
            print(f"   -> Cleaned CPF: {clean_cpf}")

    # 1. Busca por CPF se existir
    if clean_cpf:
        # Check specifically for CPF collision
        patient = db.query(Patient).filter(Patient.cpf == clean_cpf).first()
        if patient:
            print(f"✅ Found patient by CPF: {patient.name} (ID: {patient.id})")
            return patient.id

    # 2. Se não achou por CPF, trata nome
    if not patient_name_raw:
        unknown_name = "Paciente Não Identificado"
        # Try to find 'unknown' patient to reuse? Or create new? Usually reuse.
        # But if we have a CPF but no name? (Rare edge case)
        patient = db.query(Patient).filter(Patient.name == unknown_name).first()
        if not patient:
            patient = Patient(name=unknown_name, cpf=clean_cpf) # Use CPF if available even if name unknown
            db.add(patient)
            db.commit()
            db.refresh(patient)
        return patient.id

    clean_name = patient_name_raw.strip().replace(",", "").split(" (")[0]
    
    # 3. Busca por Nome (Potencial Homônimo) ou Alias
    # Searches matches in 'name' OR if the checked name is contained in the 'aliases' array
    # Note: JSONB contains needs exact match for elements inside the array usually, 
    # but let's assume aliases are stored as simple strings.
    # We want to check if 'clean_name' is IN aliases.
    patient = db.query(Patient).filter(
        or_(
            Patient.name.ilike(clean_name),
            Patient.aliases.contains([clean_name]) 
        )
    ).first()
    
    if not patient:
        # CRIAR NOVO PACIENTE
        print(f"🆕 Creating new patient: {clean_name} | CPF: {clean_cpf}")
        patient = Patient(name=clean_name, cpf=clean_cpf) # Explicit CPF assignment
        db.add(patient)
        db.commit()
        db.refresh(patient)
    else:
        # PACIENTE EXISTENTE (por nome), mas verificar se precisamos atualizar CPF
        # Se o paciente encontrado NÃO tem CPF, mas recebemos um CPF agora -> Atualiza.
        if clean_cpf and not patient.cpf:
             print(f"🔄 Enhancing existing patient {patient.name} with CPF {clean_cpf}")
             patient.cpf = clean_cpf
             db.add(patient)
             db.commit()
             db.refresh(patient)
        
        # Conflict Warning: Found by name, but CPF might differ? 
        # Logic above handles 'not found by CPF'. So if we are here, 
        # either clean_cpf is None OR clean_cpf is distinct from patient.cpf (if patient.cpf exists).
        # For simplicity, we assume if names match, it's the same person, unless we want strict checking.
        # We only update if missing.
             
        print(f"✅ Found existing patient by Name: {patient.name} (ID: {patient.id})")
        
    return patient.id

@tool
def save_atendimento(data: AtendimentoSchema, transcription: str = None) -> str:
    """
    SALVA UM ÚNICO ATENDIMENTO UNIFICADO.
    Salva todos os dados clínicos (Anamnese + Evolução) em um único registro.
    """
    print(f"--- TOOL: Saving Atendimento (Unified) ---")
    
    try:
        db = SessionLocal()
        
        # 1. Resolve Patient
        patient_id = _get_or_create_patient(db, data.paciente.nome, data.paciente.cpf)
            
        # 2. Cria Appointment
        appointment = Appointment(patient_id=patient_id, date_time=datetime.datetime.now(), status="completed")
        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        # 3. Salva Registro Único (Atendimento)
        # Dump completo do schema para JSON
        full_payload = data.model_dump()
        
        rec = MedicalRecord(
            appointment_id=appointment.id,
            record_type="atendimento", # Tipo Unificado
            structured_content=full_payload,
            # transcription will be updated via webhook logic or if passed explicitly
            # The user logic relies on updating it later, so we can leave None or try context if needed
            full_transcription=None 
        )
        
        db.add(rec)
        db.commit()
        db.refresh(rec)
        
        print(f"✅ Saved Unified Record ID {rec.id}")

        return f"Atendimento salvo com sucesso. ID do Registro: {rec.id}"

    except Exception as e:
        print(f"Error saving atendimento: {e}")
        return f"Erro ao salvar atendimento: {str(e)}"
    finally:
        db.close()
