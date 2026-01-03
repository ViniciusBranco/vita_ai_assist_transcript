from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from core.ai_gateway import GeminiService
from core.config import settings
from database import get_db
import httpx

import logging

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter()
gemini = GeminiService(api_key=settings.GEMINI_API_KEY)

@router.post("/chatbot-webhook")
async def chatbot_webhook(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    media_url = payload.get("media_url")
    if not media_url:
        raise HTTPException(status_code=400, detail="Missing media_url")
    
    # Download audio from Story2Scale
    async with httpx.AsyncClient() as client:
        resp = await client.get(media_url)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch audio")
        audio_content = resp.content

    # Process via Gemini
    ai_response = await gemini.process_medical_audio(audio_content)
    
    # Log usage for auditing
    logger.info(f"AI Usage for transaction: {ai_response.usage}")

    # Logic to save to medical_records (Vita.AI)
    # TODO: Implement patient resolution and record creation
    
    return {
        "status": "success", 
        "processed_data": ai_response.content,
        "usage": ai_response.usage.model_dump()
    }
