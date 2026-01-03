import os

class Settings:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
