import requests
import sys

# URL do seu backend local
URL = "http://localhost:8000/api/webhook/whatsapp"

# URL do arquivo de áudio simulado
# Assumindo que você rodou 'python -m http.server 9000' na raiz do projeto
# host.docker.internal permite que o container acesse o host
AUDIO_URL = "http://host.docker.internal:9000/audio_prontuario.ogg"

# Payload simulando o formato que o WAHA envia
payload = {
    "event": "message",
    "payload": {
        "id": "test_msg_simulation_001",
        "from": "5511999999999@c.us",
        "to": "5511888888888@c.us",
        "body": "",
        "type": "ptt", # ptt = push to talk (voice note)
        "hasMedia": True,
        "mediaUrl": AUDIO_URL, # Campo extra que adicionamos suporte no backend para testes
        "_data": {
            "mimetype": "audio/ogg; codecs=opus"
        }
    }
}

print(f"--- Iniciando Simulação de Webhook ---")
print(f"Alvo: {URL}")
print(f"Audio URL (Simulada): {AUDIO_URL}")
print(f"Payload: {payload}")

try:
    response = requests.post(URL, json=payload)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        print("\nSucesso! Verifique os logs do container 'backend' para ver o processamento.")
    else:
        print("\nFalha na requisição.")
except Exception as e:
    print(f"\nErro ao conectar: {e}")
    print("Dica: Verifique se o backend está rodando (docker compose up).")