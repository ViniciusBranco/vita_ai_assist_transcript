import os

class Settings:
    # API Domain
    API_DOMAIN = os.getenv("API_DOMAIN", "api-vita.story2scale.me")
    
    # AI Providers
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", GEMINI_API_KEY)
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL_NAME = os.getenv("OPENAI_MODEL_NAME", "gpt-4o-mini")
    GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "GEMINI")
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@db:5432/vita_ai_db")
    
    # External Services
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
    
    # Costs
    USD_BRL_RATE = float(os.getenv("USD_BRL_RATE", "5.5"))

settings = Settings()
