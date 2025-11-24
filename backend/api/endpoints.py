from fastapi import APIRouter, UploadFile, File, HTTPException
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
        llm_response = llm_service.process_text(transcription_text)
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
