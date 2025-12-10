from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Body
from typing import Dict, Any, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from database import get_db
from models import MedicalRecord, Appointment, Patient
import shutil
import os
from pathlib import Path
import uuid
import datetime

router = APIRouter()

UPLOAD_DIR = Path("temp")

@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """
    Upload an audio file to the server.
    The file is saved temporarily in the 'temp' directory.
    Supports: .mp3, .wav, .ogg (WhatsApp), .m4a, .flac, .webm
    """
    # Validate file extension
    ALLOWED_EXTENSIONS = {".mp3", ".wav", ".ogg", ".m4a", ".flac", ".webm", ".opus"}
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file format. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    # Generate a unique filename to avoid collisions
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    # --- Integration Start ---
    from services.transcription import TranscriptionService
    from services.llm import LLMService

    # Initialize services (In a real app, these should be dependencies or singletons)
    # Note: Initializing here for simplicity as per current task scope.
    transcription_service = TranscriptionService()
    llm_service = LLMService()

    # 1. Transcribe
    try:
        transcription_text = transcription_service.transcribe(str(file_path))
    except Exception as e:
        return {"filename": unique_filename, "error": f"Transcription failed: {e}"}

    # 2. Process with LLM
    try:
        prompt = """Você recebeu um texto pós-consulta odontológica, transcrito diretamente do áudio. 
        Seu objetivo é corrigir eventuais erros de português do Brasil e acentuação.
        Mantenha o conteúdo o mais próximo possível do texto original. 
        Não dê instruções ou explicações adicionais.
        Forneça apenas o texto corrigido.
        """
        llm_response = llm_service.process_text(transcription_text, prompt)
    except Exception as e:
        llm_response = f"LLM processing failed: {e}"

    # Cleanup (Optional: remove file after processing)
    # os.remove(file_path)

    return {
        "filename": unique_filename,
        "file_path": str(file_path),
        "transcription": transcription_text,
        "llm_analysis": llm_response
    }

@router.get("/medical-records")
def list_medical_records(db: Session = Depends(get_db)):
    """
    List all medical records, ordered by creation date (newest first).
    Includes Patient Name via JOIN.
    """
    records = db.query(MedicalRecord).options(
        joinedload(MedicalRecord.appointment).joinedload(Appointment.patient)
    ).order_by(MedicalRecord.created_at.desc()).all()
    
    return [
        {
            "id": rec.id,
            "record_type": rec.record_type,
            "patient_name": rec.appointment.patient.name if rec.appointment and rec.appointment.patient else "Desconhecido",
            "patient_id": rec.appointment.patient_id if rec.appointment else None,
            "created_at": rec.created_at,
            "structured_content": rec.structured_content,
            # "full_transcription": rec.full_transcription # Optional, omitting for list view
        }
        for rec in records
    ]

@router.get("/medical-records/{record_id}")
def get_medical_record(record_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific medical record by ID.
    Includes Patient details.
    """
    record = db.query(MedicalRecord).options(
        joinedload(MedicalRecord.appointment).joinedload(Appointment.patient)
    ).filter(MedicalRecord.id == record_id).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    patient_data = None
    if record.appointment and record.appointment.patient:
        p = record.appointment.patient
        age = None
        if p.birth_date:
            today = datetime.date.today()
            # Calculate age
            age = today.year - p.birth_date.year - ((today.month, today.day) < (p.birth_date.month, p.birth_date.day))
            
        patient_data = {
            "id": p.id,
            "name": p.name,
            "phone": p.phone,
            "cpf": p.cpf,
            "age": age
        }

    return {
        "id": record.id,
        "record_type": record.record_type,
        "patient": patient_data,
        "structured_content": record.structured_content,
        "full_transcription": record.full_transcription,
        "created_at": record.created_at
    }

@router.get("/patients")
def list_patients(db: Session = Depends(get_db)):
    """
    Lista todos os pacientes cadastrados.
    """
    patients = db.query(Patient).order_by(Patient.name).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "cpf": p.cpf,
            "phone": p.phone,
            "birth_date": p.birth_date
        }
        for p in patients
    ]

@router.post("/patients")
def create_patient(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Cria um novo paciente.
    Obrigatório: nome, cpf.
    Opcional: phone, birth_date.
    """
    name = payload.get("name")
    cpf = payload.get("cpf")
    
    if not name or not cpf:
         raise HTTPException(status_code=400, detail="Name and CPF are required")

    # Clean CPF
    clean_cpf = ''.join(filter(str.isdigit, cpf))
    if not clean_cpf:
        raise HTTPException(status_code=400, detail="Invalid CPF format")

    # Check for existing CPF
    existing = db.query(Patient).filter(Patient.cpf == clean_cpf).first()
    if existing:
        raise HTTPException(status_code=400, detail="CPF already registered")

    # Create Patient
    patient = Patient(
        name=name, 
        cpf=clean_cpf, 
        phone=payload.get("phone"),
        aliases=payload.get("aliases", [])
    )

    if "birth_date" in payload and payload["birth_date"]:
        try:
             patient.birth_date = datetime.datetime.strptime(payload["birth_date"], "%Y-%m-%d")
        except ValueError:
             raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    try:
        db.add(patient)
        db.commit()
        db.refresh(patient)
        return {
            "id": patient.id,
            "name": patient.name,
            "cpf": patient.cpf,
            "created_at": patient.created_at
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create patient: {str(e)}")

@router.get("/patients/{patient_id}")
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """
    Busca detalhes de um paciente específico.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {
        "id": patient.id,
        "name": patient.name,
        "cpf": patient.cpf,
        "phone": patient.phone,
        "aliases": patient.aliases,
        "birth_date": patient.birth_date,
        "created_at": patient.created_at
    }

@router.put("/patients/{patient_id}")
def update_patient(patient_id: int, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Atualiza dados de cadastro do paciente.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if "name" in payload:
        patient.name = payload["name"]
    if "cpf" in payload:
        # If updating CPF, ensure uniqueness (unless it's the same CPF)
        new_cpf_raw = payload["cpf"]
        if new_cpf_raw:
            new_clean_cpf = ''.join(filter(str.isdigit, new_cpf_raw))
            if new_clean_cpf != patient.cpf:
                 existing = db.query(Patient).filter(Patient.cpf == new_clean_cpf).first()
                 if existing:
                     raise HTTPException(status_code=400, detail="CPF already registered to another patient")
                 patient.cpf = new_clean_cpf
        else:
            # Setting CPF to None? Maybe not allowed if we want strictness, but let's allow cleaning it if needed
            # But earlier we said CPF is mandatory for new patients. 
            pass

    if "phone" in payload:
        patient.phone = payload["phone"]
    if "aliases" in payload:
        patient.aliases = payload["aliases"]
    if "birth_date" in payload:
        # Assumes format "YYYY-MM-DD"
        try:
            bdate = payload["birth_date"]
            if bdate:
                patient.birth_date = datetime.datetime.strptime(bdate, "%Y-%m-%d")
            else:
                patient.birth_date = None
        except ValueError:
             raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    try:
        db.add(patient)
        db.commit()
        db.refresh(patient)
        return {
            "id": patient.id,
            "name": patient.name,
            "cpf": patient.cpf,
            "phone": patient.phone,
            "birth_date": patient.birth_date,
            "status": "updated"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update patient: {str(e)}")

@router.get("/patients/{patient_id}/full-history")
def get_patient_history(patient_id: int, db: Session = Depends(get_db)):
    """
    Retrieve full medical history for a specific patient.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Fetch all records for this patient
    records = db.query(MedicalRecord).join(Appointment).filter(
        Appointment.patient_id == patient_id
    ).order_by(MedicalRecord.created_at.desc()).all()

    history = []
    for rec in records:
        # Create a summary from structured content
        summary = ""
        if rec.structured_content:
            if rec.record_type == "evolucao":
                obs = rec.structured_content.get("observacoes", "")
                procs = rec.structured_content.get("procedimentos", [])
                if isinstance(procs, list):
                    procs = ", ".join(procs)
                summary = f"{procs} - {obs}"[:100] + "..." if obs else f"{procs}"
            elif rec.record_type == "anamnese":
                qp = rec.structured_content.get("queixa_principal", "")
                summary = f"Queixa: {qp}"[:100] + "..." if qp else "Anamnese realizada"
        
        history.append({
            "id": rec.id,
            "record_type": rec.record_type,
            "date": rec.created_at,
            "summary": summary,
            "structured_content": rec.structured_content # Sending full content just in case
        })

    return {
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "phone": patient.phone,
            "cpf": patient.cpf
            # "age": ... (could calculate if needed)
        },
        "history": history
    }

@router.put("/medical-records/{record_id}")
def update_medical_record(
    record_id: int, 
    payload: Dict[str, Any] = Body(...), 
    db: Session = Depends(get_db)
):
    """
    Update the structured content of a medical record.
    Also allows updating patient details (name, age).
    Payload format:
    {
        "structured_content": { ... },
        "patient": { "name": "...", "age": ... }
    }
    """
    record = db.query(MedicalRecord).options(
        joinedload(MedicalRecord.appointment).joinedload(Appointment.patient)
    ).filter(MedicalRecord.id == record_id).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    print(f"--- DEBUG: PUT /medical-records/{record_id} ---")
    print(f"--- DEBUG: Payload keys: {payload.keys()} ---")
    # print(f"--- DEBUG: Full Payload: {payload} ---") 
    
    # Extract data
    # Support both wrapped and legacy flat formats
    # Extract data
    # Support both wrapped and legacy flat formats
    # Heuristic: If 'structured_content' OR 'patient' key exists, it's the new format.
    if "structured_content" in payload or "patient" in payload:
        structured_content = payload.get("structured_content")
        patient_data = payload.get("patient")
    else:
        # Legacy flat format (whole payload IS the structured content)
        structured_content = payload
        patient_data = None
        
    # Update structured content (only if provided)
    if structured_content is not None:
        record.structured_content = structured_content
    
    # Update Patient Data
    patient_updated = False
    patient_ref = None
    
    print(f"--- DEBUG: Checking patient update conditions ---")
    print(f"--- DEBUG: patient_data present? {bool(patient_data)} ---")
    print(f"--- DEBUG: record.appointment present? {bool(record.appointment)} ---")
    if record.appointment:
        print(f"--- DEBUG: record.appointment.patient present? {bool(record.appointment.patient)} ---")

    if patient_data and record.appointment and record.appointment.patient:
        patient = record.appointment.patient
        patient_ref = patient
        
        print(f"--- DEBUG: Updating patient {patient.id} ---")
        print(f"--- DEBUG: Payload patient_data: {patient_data} ---")
        
        if "name" in patient_data and patient_data["name"]:
            print(f"--- DEBUG: Changing name from '{patient.name}' to '{patient_data['name']}' ---")
            patient.name = patient_data["name"]
            db.add(patient)
            patient_updated = True
            
        if "age" in patient_data and patient_data["age"]:
            try:
                age = int(patient_data["age"])
                today = datetime.date.today()
                # Approximate birth date (Jan 1st of calculated year)
                birth_year = today.year - age
                patient.birth_date = datetime.date(birth_year, 1, 1)
                db.add(patient)
                patient_updated = True
            except (ValueError, TypeError):
                pass # Ignore invalid age
    
    try:
        db.commit()
        db.refresh(record)
        if patient_updated and patient_ref:
            db.refresh(patient_ref)
            print(f"--- DEBUG: Patient refreshed. New name: {patient_ref.name} ---")
    except Exception as e:
        db.rollback()
        print(f"--- DEBUG: Error updating record: {e} ---")
        raise HTTPException(status_code=500, detail=f"Failed to update record: {str(e)}")
        
    # Prepare updated patient data for response
    updated_patient_data = None
    if record.appointment and record.appointment.patient:
        p = record.appointment.patient
        age = None
        if p.birth_date:
            today = datetime.date.today()
            age = today.year - p.birth_date.year - ((today.month, today.day) < (p.birth_date.month, p.birth_date.day))
        
        updated_patient_data = {
            "id": p.id,
            "name": p.name,
            "phone": p.phone,
            "age": age
        }

    return {
        "id": record.id,
        "patient": updated_patient_data,
        "structured_content": record.structured_content,
        "full_transcription": record.full_transcription,
        "created_at": record.created_at,
        "status": "updated"
    }
