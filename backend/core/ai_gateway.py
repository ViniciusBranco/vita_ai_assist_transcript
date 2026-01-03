import google.generativeai as genai
import json
from typing import Dict, Any, Optional, List, Union
from schemas.ai import AIUnifiedResponse, AIUsageMetadata
from core.config import settings

class GeminiService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        # Default model configuration
        self.model_name = "gemini-2.5-flash"

    async def generate_structured_content(
        self, 
        prompt: str, 
        media_parts: Optional[List[Any]] = None,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2
    ) -> AIUnifiedResponse:
        """
        Generic polymorphic method to handle text and multimodal inputs with telemetry.
        """
        # Initialize model with optional system instructions
        model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_instruction
        )
        
        generation_config = genai.types.GenerationConfig(
            temperature=temperature,
            response_mime_type="application/json"
        )

        content_parts = [prompt]
        if media_parts:
            content_parts.extend(media_parts)

        # Execute asynchronous call
        response = await model.generate_content_async(
            content_parts,
            generation_config=generation_config
        )

        # Extract usage metadata
        # Note: Check if usage_metadata exists and has attributes, otherwise default to 0
        prompt_tokens = response.usage_metadata.prompt_token_count if hasattr(response, 'usage_metadata') else 0
        candidate_tokens = response.usage_metadata.candidates_token_count if hasattr(response, 'usage_metadata') else 0
        total_tokens = response.usage_metadata.total_token_count if hasattr(response, 'usage_metadata') else 0

        usage = AIUsageMetadata(
            prompt_tokens=prompt_tokens,
            candidate_tokens=candidate_tokens,
            total_tokens=total_tokens
        )

        # Parse JSON content safely
        try:
            clean_text = response.text.strip().replace('```json', '').replace('```', '')
            structured_content = json.loads(clean_text)
        except json.JSONDecodeError:
            structured_content = {"error": "Failed to parse JSON", "raw": response.text}

        return AIUnifiedResponse(
            content=structured_content,
            usage=usage,
            raw_response=response.text
        )

    async def process_medical_audio(self, file_content: bytes) -> AIUnifiedResponse:
        system_prompt = "Atue como um assistente médico especialista em transcrição e estruturação de prontuários."
        user_prompt = "Analise o áudio e extraia JSON com: paciente, cpf, procedimento, categoria (anamnese/evolucao), historico."
        
        media_parts = [{"mime_type": "audio/ogg", "data": file_content}]
        
        return await self.generate_structured_content(
            prompt=user_prompt,
            media_parts=media_parts,
            system_instruction=system_prompt,
            temperature=0.1
        )

    async def classify_tax_document(self, transaction_data: dict, receipt_content: str = "") -> AIUnifiedResponse:
        system_prompt = (
            "Atue como Auditor fiscal especialista em Carnê-Leão/IRPF. "
            "Sua tarefa é analisar transações bancárias e comprovantes para determinar a dedutibilidade fiscal "
            "segundo as normas da Receita Federal do Brasil (IN RFB 1500/2014)."
        )
        
        tax_plan_of_accounts = (
            "Categorias Permitidas (Plano de Contas):\n"
            "- P10.01.001: Aluguel e Condomínio (Consultório)\n"
            "- P10.01.002: Materiais Clínicos e Insumos\n"
            "- P10.01.003: Serviços de Terceiros (Contabilidade, Softwares, Manutenção)\n"
            "- P10.01.004: Folha de Pagamento, INSS e Encargos\n"
            "- P10.01.005: Conselhos Profissionais (CRM/CRO) e Sindicatos\n"
            "- P10.01.006: Utilidades (Água, Luz, Telefone, Internet Residencial/Comercial Proporcional)\n"
            "- P10.01.007: Não Dedutível / Gastos Pessoais"
        )

        user_prompt = (
            f"Analise a seguinte transação:\n{json.dumps(transaction_data, ensure_ascii=False)}\n\n"
            f"Conteúdo do Comprovante: {receipt_content}\n\n"
            f"{tax_plan_of_accounts}\n\n"
            "Retorne um JSON com os campos: classification (Dedutível, Não Dedutível, Parcialmente Dedutível), "
            "category_code (ex: P10.01.001), category_name, justification, legal_citation, risk_level (Baixo, Médio, Alto)."
        )
        
        return await self.generate_structured_content(
            prompt=user_prompt,
            system_instruction=system_prompt,
            temperature=0.0
        )
