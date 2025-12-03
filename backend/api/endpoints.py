from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Body
from typing import Dict, Any
from sqlalchemy.orm import Session
from database import get_db
from models import MedicalRecord
import shutil
import os
from pathlib import Path
import uuid

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

@router.get("/medical-records/{record_id}")
def get_medical_record(record_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific medical record by ID.
    """
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    return {
        "id": record.id,
        "structured_content": record.structured_content,
        "full_transcription": record.full_transcription,
        "created_at": record.created_at
    }

@router.put("/medical-records/{record_id}")
def update_medical_record(
    record_id: int, 
    payload: Dict[str, Any] = Body(...), 
    db: Session = Depends(get_db)
):
    """
    Update the structured content of a medical record.
    Used when the doctor edits the record in the frontend.
    """
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    # Update structured content
    # The frontend sends the updated JSON structure
    record.structured_content = payload
    
    try:
        db.commit()
        db.refresh(record)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update record: {str(e)}")
        
    return {
        "id": record.id,
        "structured_content": record.structured_content,
        "full_transcription": record.full_transcription,
        "created_at": record.created_at,
        "status": "updated"
    }
