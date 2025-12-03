from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
import httpx
import os
from pathlib import Path
import uuid
import traceback

router = APIRouter()

# WAHA service URL (internal docker network)
WAHA_BASE_URL = os.getenv("WAHA_BASE_URL", "http://waha:3000")

@router.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Receive Webhook events from WAHA (WhatsApp HTTP API).
    """
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # WAHA default event structure
    event = data.get("event")
    payload = data.get("payload", {})

    if event == "message":
        # Check if message has media (audio/voice)
        msg_type = payload.get("type")
        if not msg_type and "_data" in payload:
             msg_type = payload["_data"].get("type")

        has_media = payload.get("hasMedia", False)

        # Log for debugging
        # print(f"Received message event. Type: {msg_type}, HasMedia: {has_media}")

        if has_media and (msg_type == "ptt" or msg_type == "audio"):
            # It is an audio message
            message_id = payload.get("id")
            # In some WAHA versions id is a dict or string. 
            if isinstance(message_id, dict):
                message_id = message_id.get("_serialized")
            
            if message_id:
                # Check for explicit mediaUrl (useful for testing/simulation)
                media_url = payload.get("mediaUrl")
                chat_id = payload.get("from")
                background_tasks.add_task(handle_audio_message, message_id, media_url, chat_id)
        else:
            # Text message or other media
            # body = payload.get("body")
            # print(f"Received text/other message: {body}")
            pass

    return {"status": "success"}

async def handle_audio_message(message_id: str, media_url: str = None, chat_id: str = None):
    """
    Download audio from WAHA and start transcription pipeline.
    """
    try:
        print(f"Processing audio for message: {message_id}")
        
        # 1. Determine URL and Auth
        headers = {}
        download_url = ""

        # Cenário Simulação (Bypass)
        if media_url and media_url.startswith("http"):
            print(f"Simulation Mode: Using provided mediaUrl: {media_url}")
            download_url = media_url
            # No headers for simulation
        else:
            # Cenário Produção (WAHA)
            # URL: http://waha:3000/api/files/{message_id}
            download_url = f"{WAHA_BASE_URL}/api/files/{message_id}"
            
            # Autenticação Obrigatória
            api_key = os.getenv("WAHA_API_KEY")
            if api_key:
                headers["X-Api-Key"] = api_key
            
            print(f"Downloading from WAHA: {download_url}")
        
        async with httpx.AsyncClient() as client:
            # Download
            response = await client.get(download_url, headers=headers, timeout=60.0)
            response.raise_for_status()
            
            # 2. Save to temp file
            upload_dir = Path("temp")
            upload_dir.mkdir(exist_ok=True)
            
            # Try to guess extension from content-type
            content_type = response.headers.get("content-type", "")
            ext = ".ogg" # WhatsApp voice notes are usually OGG/Opus
            if "mp3" in content_type:
                ext = ".mp3"
            elif "wav" in content_type:
                ext = ".wav"
                
            filename = f"{uuid.uuid4()}{ext}"
            file_path = upload_dir / filename
            
            with open(file_path, "wb") as f:
                f.write(response.content)
            
            print(f"Audio saved to {file_path}")
            
            # 3. Call LangGraph Orchestrator
            # The agent graph includes the TranscriptionService node.
            print(f"Invoking Agent for {file_path}")
            
            from agent.graph import app as agent_app
            
            inputs = {"audio_path": str(file_path.absolute())}
            
            # Run the graph
            result = agent_app.invoke(inputs)
            
            messages = result.get("messages", [])
            error = result.get("error")
            
            if error:
                print(f"Agent finished with ERROR: {error}")
            else:
                print(f"Agent finished successfully.")
                if messages:
                    # Extract the final response from the agent
                    last_msg = messages[-1]
                    final_text = last_msg.content
                    print(f"Final Response: {final_text[:100]}...")
                    
                    # 4. Send Response back to WhatsApp
                    if chat_id:
                        try:
                            await send_whatsapp_message(chat_id, final_text)
                        except Exception as send_err:
                             print(f"Warning: Failed to send WhatsApp response (likely invalid test number): {send_err}")
                    else:
                        print("Warning: No chat_id provided, cannot send response.")
            
            # Cleanup temp file (Optional, but good practice if not needed anymore)
            # os.remove(file_path) 
                
    except Exception as e:
        print(f"Error processing audio message {message_id}: {e}")
        traceback.print_exc()

async def send_whatsapp_message(chat_id: str, text: str):
    """
    Send text message via WAHA.
    """
    url = f"{WAHA_BASE_URL}/api/sendText"
    headers = {"Content-Type": "application/json"}
    api_key = os.getenv("WAHA_API_KEY")
    if api_key:
        headers["X-Api-Key"] = api_key
        
    payload = {
        "session": "default",
        "chatId": chat_id,
        "text": text
    }
    
    print(f"Sending response to {chat_id}...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)
            response.raise_for_status()
            print(f"Message sent successfully: {response.json()}")
        except Exception as e:
            print(f"Failed to send WhatsApp message: {e}")
