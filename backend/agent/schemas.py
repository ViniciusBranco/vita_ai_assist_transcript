from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class AnamneseSchema(BaseModel):
    """
    Schema para dados de Anamnese (PRONT-01).
    Campos opcionais para flexibilidade no fluxo de coleta.
    """
    queixa_principal: Optional[str] = Field(None, description="A queixa principal do paciente, o motivo da consulta.")
    historia_doenca_atual: Optional[str] = Field(None, description="Histórico da doença atual, sintomas, duração, etc.")
    alergias: List[str] = Field(default_factory=list, description="Lista de alergias do paciente.")
    medicamentos: List[str] = Field(default_factory=list, description="Lista de medicamentos que o paciente utiliza.")
    historico_medico: Optional[str] = Field(None, description="Histórico médico pregresso (doenças crônicas, cirurgias, etc).")
    mode: Optional[str] = Field("simples", description="Modo de operação: 'simples' ou 'completo'.")

class EvolucaoSchema(BaseModel):
    """
    Schema para dados de Evolução (PRONT-02).
    Campos obrigatórios: observacoes e procedimentos.
    """
    model_config = ConfigDict(populate_by_name=True)

    observacoes: str = Field(..., description="Observações do profissional (texto livre).")
    procedimentos: List[str] = Field(
        ..., 
        description="Procedimentos realizados.",
        validation_alias="procedimentos_realizados"
    )
    dente: Optional[str] = Field(None, description="Dente ou região tratada (ex: 36, 14, superior direito).")
    proximos_passos: Optional[str] = Field(None, description="Planejamento para as próximas consultas.")

class ProntuarioUnificadoSchema(BaseModel):
    """
    Schema unificado para capturar Anamnese e Evolução simultaneamente.
    Útil quando o médico dita tudo em um único áudio.
    """
    anamnese: Optional[AnamneseSchema] = Field(None, description="Dados de anamnese extraídos.")
    evolucao: Optional[EvolucaoSchema] = Field(None, description="Dados de evolução extraídos.")

class RouterOutput(BaseModel):
    intent: str = Field(description="A intenção classificada: 'anamnese', 'evolucao', ou 'duvida_comando'.")
