import os
import traceback
from typing import TypedDict, Optional, List, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage, BaseMessage
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent

from services.transcription import TranscriptionService
from agent.tools import save_atendimento
from core.audit import AgentAuditLogger
from core.context import transcription_context

# --- Configuration ---
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
MODEL_NAME = os.getenv("OLLAMA_MODEL", "llama3.2")

# --- Services ---
transcription_service = TranscriptionService(model_size="medium")

# --- State ---
class AgentState(TypedDict):
    audio_path: str
    chat_id: Optional[str]
    transcribed_text: Optional[str]
    messages: List[BaseMessage]
    final_output: Optional[Any]
    error: Optional[str]

# --- Nodes ---

def transcriber_node(state: AgentState) -> AgentState:
    print("--- Node: Transcriber ---")
    audio_path = state.get("audio_path")
    if not audio_path or not os.path.exists(audio_path):
        return {**state, "error": "Audio file not found"}
    
    try:
        # Transcribe
        print(f"--- Transcribing audio: {audio_path} ---")
        text = transcription_service.transcribe(audio_path)
        print(f"--- Transcription complete. First 50 chars: {text[:50]}... ---")
        
        # Set context for tools to access
        transcription_context.set(text)
        
        # Convert to message for the agent
        messages = [HumanMessage(content=text)]
        return {**state, "transcribed_text": text, "messages": messages}
    except Exception as e:
        print(f"!!! Transcription Error: {e}")
        traceback.print_exc()
        return {**state, "error": f"Transcription failed: {str(e)}"}

def agent_node(state: AgentState) -> AgentState:
    print("--- Node: Agent ---")
    messages = state.get("messages")
    if not messages:
        return {**state, "error": "No messages to process"}

    # Initialize Model
    llm = ChatOllama(base_url=OLLAMA_HOST, model=MODEL_NAME)

    # Define Tools - ONLY ONE NOW
    tools = [save_atendimento]

    # System Prompt
    # System Prompt
    system_prompt = """You are an expert AI medical assistant specializing in clinical data structuring.

    YOUR MISSION:
    1. Analyze the audio transcription.
    2. Classify the attendance type (`anamnese`, `evolucao`, or `completo`).
    3. Extract ALL clinical data, strictly separating pre-existing history from current actions.
    4. Call the tool `save_atendimento` EXACTLY ONCE.

    ⚠️ CRITICAL RULES (DO NOT IGNORE):
    1. **OUTPUT LANGUAGE:** All extracted content values (names, observations, procedures, complaints) MUST remain in **Brazilian Portuguese**.
    2. **SINGLE EXECUTION:** After calling `save_atendimento` successfully, your task is COMPLETE. Reply with a short confirmation to the user and STOP. DO NOT call the tool again.
    3. **CPF EXTRACTION:** Look obsessively for 11 digits or the pattern XXX.XXX.XXX-XX. This is vital for patient identification. Extract it to `paciente.cpf`.

    CLINICAL DEFINITIONS:
    - **MEDICAL HISTORY (`anamnese.historico_medico`):** Refers to PRE-EXISTING conditions (Diabetes, Asthma, Hypertension), allergies, past surgeries, or continuous medication. Do NOT include what was done today.
    - **CHIEF COMPLAINT (`anamnese.queixa_principal`):** The reason for the CURRENT visit (e.g., "Pain in tooth 36", "Broken filling").
    - **EVOLUTION (`evolucao`):** Everything performed or observed TODAY.
        - **`procedimentos` (List):** Extract distinct technical actions here (e.g., "Anestesia", "Restauração", "Sutura"). Do NOT leave them buried in the text.
        - **`observacoes`:** Clinical findings and narrative of the visit.

    EXAMPLE OF EXPECTED JSON STRUCTURE (Tool Input):
    {
    "data": {
        "paciente": { "nome": "João Silva", "cpf": "123.456.789-00" },
        "categoria": "completo",
        "anamnese": {
        "queixa_principal": "Dor no dente 36",
        "historico_medico": "Diabético, Alérgico a Penicilina"
        },
        "evolucao": {
        "observacoes": "Paciente com dor aguda. Realizado teste de vitalidade positivo.",
        "procedimentos": ["Teste de Vitalidade", "Abertura Coronária", "Curativo de Demora"]
        }
    }
    }
    """

    # Create React Agent
    agent_runnable = create_react_agent(llm, tools, state_modifier=system_prompt)

    try:
        print("--- Invoking Agent Runnable ---")
        
        # Inject Audit Logger
        audit_logger = AgentAuditLogger()
        
        result = agent_runnable.invoke(
            {"messages": messages},
            config={"callbacks": [audit_logger]}
        )
        print("--- Agent Runnable Finished ---")
        
        return {**state, "messages": result["messages"], "final_output": result}
    except Exception as e:
        print(f"!!! Agent execution failed: {e}")
        traceback.print_exc()
        return {**state, "error": f"Agent failed: {str(e)}"}

# --- Graph Construction ---

workflow = StateGraph(AgentState)

workflow.add_node("transcriber", transcriber_node)
workflow.add_node("agent", agent_node)

workflow.set_entry_point("transcriber")

workflow.add_edge("transcriber", "agent")
workflow.add_edge("agent", END)

app = workflow.compile()
