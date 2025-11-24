import sys
import os

# Add backend directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.transcription import TranscriptionService
from services.llm import LLMService

def test_whisper():
    print("Testing Whisper Model Loading...")
    try:
        service = TranscriptionService(model_size="tiny") # Use tiny for quick check
        service.load_model()
        print("✅ Whisper Model loaded successfully.")
        service.unload_model()
    except Exception as e:
        print(f"❌ Whisper Model failed to load: {e}")

def test_llm():
    print("\nTesting LLM Connection (Ollama)...")
    try:
        service = LLMService()
        response = service.process_text("Hello, are you there?", prompt="Answer with 'Yes'.")
        print(f"LLM Response: {response}")
        if response:
            print("✅ LLM Connection successful.")
        else:
            print("❌ LLM returned empty response.")
    except Exception as e:
        print(f"❌ LLM Connection failed: {e}")

if __name__ == "__main__":
    print("Starting Service Verification...")
    test_whisper()
    test_llm()
    print("\nVerification Complete.")
