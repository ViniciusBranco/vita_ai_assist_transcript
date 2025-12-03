import os
import httpx
import asyncio
import random
import traceback
from datetime import datetime

# Configuration
WAHA_BASE_URL = os.getenv("WAHA_BASE_URL", "http://waha:3000")
WAHA_API_KEY = os.getenv("WAHA_API_KEY")

def log_with_timestamp(message: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

async def send_message(chat_id: str, text: str):
    """
    Envia uma mensagem de texto para um utilizador via WAHA.
    'chat_id' deve ser o número normalizado.
    """
    # Simulate human-like delay
    tempo_de_espera = random.uniform(1.0, 3.0)
    await asyncio.sleep(tempo_de_espera)
    
    endpoint = f"{WAHA_BASE_URL}/api/sendText"
    
    # Ensure chat_id has suffix if missing (simple heuristic, though usually passed correctly)
    waha_chat_id = chat_id
    if "@" not in waha_chat_id:
        waha_chat_id = f"{chat_id}@c.us"
    
    payload = {
        "session": "default",
        "chatId": waha_chat_id,
        "text": text,
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    if WAHA_API_KEY:
        headers["X-Api-Key"] = WAHA_API_KEY

    try:
        log_with_timestamp(f"WAHA reply to: {waha_chat_id} | Message: \"{text[:100]}...\"")
        async with httpx.AsyncClient() as client:
            response = await client.post(endpoint, json=payload, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
    except httpx.RequestError as e:
        log_with_timestamp(f"ERRO ao conectar com o WAHA: {e}")
        # We don't raise here to avoid crashing the agent flow, but we log it.
        return {"error": str(e)}
    except httpx.HTTPStatusError as e:
        log_with_timestamp(f"ERRO na API do WAHA (sendText): {e.response.status_code} - {e.response.text}")
        return {"error": f"HTTP {e.response.status_code}: {e.response.text}"}
    except Exception as e:
        log_with_timestamp(f"ERRO desconhecido ao enviar mensagem WAHA: {e}")
        traceback.print_exc()
        return {"error": str(e)}
