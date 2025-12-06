import requests
import sys
import os

# Configuração
BACKEND_URL = "http://localhost:8000/api/webhook/whatsapp"
HOST_FILE_SERVER = "http://host.docker.internal:9000"

# 1. Pega o nome do arquivo dos argumentos (ou usa um default)
filename = "audio_prontuario_demo_4.ogg"
if len(sys.argv) > 1:
    filename = sys.argv[1]

# 2. Monta a URL simulada
audio_url = f"{HOST_FILE_SERVER}/{filename}"

# 3. Payload simulando WAHA (GOWS Engine Structure)
payload = {
    "event": "message",
    "session": "default",
    "payload": {
        "id": f"test_msg_{filename}",
        "from": "5511999999999@c.us", # Número fake do médico
        "to": "5511888888888@c.us",   # Número fake do bot
        "hasMedia": True,
        "media": {
            "url": audio_url,
            "mimetype": "audio/ogg; codecs=opus"
        },
        "_data": {
            "mimetype": "audio/ogg; codecs=opus"
        }
    }
}

print(f"--- 🚀 Iniciando Simulação ---")
print(f"📁 Arquivo Alvo: {filename}")
print(f"🔗 URL Simulada: {audio_url}")
print(f"📡 Enviando para: {BACKEND_URL}...")

try:
    response = requests.post(BACKEND_URL, json=payload)
    print(f"\n✅ Status Code: {response.status_code}")
    print(f"📄 Response: {response.text}")
    
    if response.status_code == 200:
        print("\n👉 Sucesso! O Backend aceitou a tarefa.")
        print("👀 Acompanhe o processamento no terminal: 'docker compose logs -f backend'")
    else:
        print("\n❌ Falha na requisição.")
except Exception as e:
    print(f"\n❌ Erro de conexão: {e}")