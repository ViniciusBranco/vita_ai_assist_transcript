import os
import traceback
from typing import TypedDict, Optional, List, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage, BaseMessage
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent

from services.transcription import TranscriptionService
from agent.tools import save_anamnese, save_evolucao
from agent.tools import save_anamnese, save_evolucao
from core.audit import AgentAuditLogger
from core.context import transcription_context

# --- Configuration ---
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
MODEL_NAME = os.getenv("OLLAMA_MODEL", "llama3.2")

# --- Services ---
transcription_service = TranscriptionService(model_size="small")

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

    # Define Tools
    tools = [save_anamnese, save_evolucao]

    # System Prompt
    system_prompt = """Você é um assistente médico AI especialista em estruturação de dados.
    
    SUA MISSÃO:
    1. Ler a transcrição COMPLETA primeiro.
    2. Identificar TODOS os procedimentos realizados e TODAS as observações.
    3. Identificar se há histórico clínico (Anamnese) ou procedimentos atuais (Evolução).
    
    AGREGAÇÃO OBRIGATÓRIA:
    - NÃO chame a ferramenta repetidamente para cada frase.
    - Agrupe TODOS os procedimentos em uma ÚNICA lista e chame `save_evolucao` UMA VEZ.
    - Exemplo ERRADO: Chamar `save_evolucao` para "Anestesia", depois chamar de novo para "Restauração".
    - Exemplo CORRETO: Chamar `save_evolucao` uma vez com procedimentos=["Anestesia", "Restauração"].
    
    SEPARAÇÃO DE INTENÇÃO:
    - Se houver histórico antigo (queixa, doença prévia) -> Use `save_anamnese`.
    - Se houver procedimentos de hoje -> Use `save_evolucao`.
    - Se houver ambos, chame ambas as ferramentas, mas UMA VEZ CADA.
    
    CASOS NÃO CLÍNICOS (Conversa, Dúvida, Ruído, Testes):
    - Se o texto for apenas uma saudação ("Oi", "Bom dia"), uma dúvida geral, ou ruído sem dados médicos.
    - Se for um TESTE DE SOM (ex: "Um, dois, três, testando", "Alô som", "Testando microfone").
    - AÇÃO: NÃO CHAME NENHUMA FERRAMENTA.
    - Apenas responda educadamente com texto final.
    - Exemplo para teste: "Parece que este é um áudio de teste. Por favor, envie um relato clínico para eu processar."
    - Exemplo para saudação: "Olá! Estou pronto para registrar o prontuário. Pode ditar."
    
    CRITÉRIO DE SEGURANÇA:
    - Para chamar `save_anamnese` ou `save_evolucao`, o texto DEVE conter menções explícitas a:
      - Sintomas (dor, febre, inchaço...)
      - Doenças ou condições
      - Dentes ou regiões da boca
      - Procedimentos (restauração, limpeza, extração...)
      - Medicamentos
    
    REGRA CRÍTICA: Se houver dados clínicos, você É OBRIGADO a chamar a ferramenta.
    """

    # Create React Agent (LangGraph prebuilt)
    # This creates a compiled graph that handles the tool calling loop
    agent_runnable = create_react_agent(llm, tools, state_modifier=system_prompt)

    try:
        # Invoke Agent
        # The input to the react agent is the state (or dict with messages)
        # It returns the final state
        print("--- Invoking Agent Runnable ---")
        
        # Inject Audit Logger
        audit_logger = AgentAuditLogger()
        
        result = agent_runnable.invoke(
            {"messages": messages},
            config={"callbacks": [audit_logger]}
        )
        print("--- Agent Runnable Finished ---")
        
        # result["messages"] contains the full history including tool calls and final response
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
