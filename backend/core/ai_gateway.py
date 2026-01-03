import google.generativeai as genai
import json
from typing import Dict, Any
import httpx

class GeminiService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    async def process_medical_audio(self, file_content: bytes) -> Dict[str, Any]:
        prompt = """
        Transcreva este áudio médico e extraia um JSON estruturado com os seguintes campos:
        - paciente: nome completo
        - cpf: apenas números
        - procedimento: lista de strings
        - categoria: 'anamnese', 'evolucao' ou 'completo'
        - historico: resumo clínico estruturado
        JSON apenas, sem markdown block tags.
        """
        response = await self.model.generate_content_async([
            prompt,
            {"mime_type": "audio/ogg", "data": file_content}
        ])
        # Clean response text from potential markdown artifacts
        clean_json = response.text.strip().replace('```json', '').replace('```', '')
        return json.loads(clean_json)

    async def classify_tax_document(self, text_or_image: Any) -> Dict[str, Any]:
        prompt = "Atue como especialista em Carnê-Leão. Extraia: valor, data, beneficiário, categoria, dedutivel (bool). Retorne apenas JSON puro."
        response = await self.model.generate_content_async([prompt, text_or_image])
        clean_json = response.text.strip().replace('```json', '').replace('```', '')
        return json.loads(clean_json)
