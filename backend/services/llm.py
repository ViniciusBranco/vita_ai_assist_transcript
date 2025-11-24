import os
from langchain_community.chat_models import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage

class LLMService:
    def __init__(self, model="llama3.1:8b-instruct-q4_K_S"):
        self.model_name = model
        # Use OLLAMA_HOST env var if set (for Docker), otherwise default to localhost
        ollama_host = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
        self.llm = ChatOllama(base_url=ollama_host, model=model)

    def process_text(self, text: str, prompt: str = "Summarize the following text:"):
        """
        Process the transcribed text using the LLM.
        """
        messages = [
            SystemMessage(content="You are a helpful assistant for a dental clinic."),
            HumanMessage(content=f"{prompt}\n\n{text}")
        ]
        
        try:
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"Error processing text with LLM: {e}"
