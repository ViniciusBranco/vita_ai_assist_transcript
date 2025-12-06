from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional, Union, Any, Literal

# --- Sub-Schemas ---

class PacienteData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    nome: str = Field(..., description="Nome do paciente.")
    cpf: Optional[str] = Field(None, description="CPF do paciente (formato XXX.XXX.XXX-XX ou apenas números).")

class AnamneseData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    queixa_principal: Optional[str] = Field(None, description="Queixa principal ou motivo da consulta.")
    historico_medico: Optional[str] = Field(None, description="Histórico médico pregresso, doenças crônicas, cirurgias.")
    alergias: List[str] = Field(default_factory=list, description="Lista de alergias mencionadas.")
    medicamentos: List[str] = Field(default_factory=list, description="Lista de medicamentos em uso.")
    
    @field_validator('queixa_principal', 'historico_medico', mode='before')
    @classmethod
    def convert_list_to_string(cls, v: Any) -> Any:
        if isinstance(v, list):
            return ", ".join(map(str, v))
        return v

    @field_validator('alergias', 'medicamentos', mode='before')
    @classmethod
    def sanitize_list_fields(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if not v.strip(): return []
            return [v]
        return v

class EvolucaoData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    observacoes: str = Field(..., description="Relato clínico do atendimento, evolução do quadro. OBRIGATÓRIO.")
    procedimentos: List[str] = Field(
        default_factory=list, 
        description="Lista estrita de ações técnicas realizadas (ex: 'Anestesia', 'Sutura'). Não use frases."
    )
    proximos_passos: Optional[str] = Field(None, description="Orientações ou plano para retorno.")

    @field_validator('observacoes', 'proximos_passos', mode='before')
    @classmethod
    def convert_list_to_string(cls, v: Any) -> Any:
        if isinstance(v, list):
            return ", ".join(map(str, v))
        return v

    @field_validator('procedimentos', mode='before')
    @classmethod
    def sanitize_list_fields(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if not v.strip(): return []
            return [v]
        return v

# --- Main Schema ---

class AtendimentoSchema(BaseModel):
    """
    Schema Unificado de Atendimento (Nested).
    Captura dados estruturados em objetos dedicados.
    """
    model_config = ConfigDict(populate_by_name=True)

    paciente: PacienteData = Field(..., description="Dados do paciente (Nome e CPF).")
    categoria: Literal["anamnese", "evolucao", "completo"] = Field(..., description="Classificação do atendimento.")
    anamnese: Optional[AnamneseData] = Field(None, description="Dados de Anamnese, se houver.")
    evolucao: Optional[EvolucaoData] = Field(None, description="Dados de Evolução, se houver.")
    
class RouterOutput(BaseModel):
    intent: str = Field(description="A intenção classificada: 'atendimento' ou 'duvida_comando'.")
