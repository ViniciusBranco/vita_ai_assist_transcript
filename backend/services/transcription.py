from faster_whisper import WhisperModel
import os
import torch

class TranscriptionService:
    def __init__(self, model_size="small", device="cuda", compute_type=None):
        self.model_size = model_size
        self.device = device if torch.cuda.is_available() else "cpu"
        # Auto-select compute type based on device
        if compute_type is None:
            self.compute_type = "float16" if self.device == "cuda" else "int8"
        else:
            self.compute_type = compute_type
        self.model = None

    def load_model(self):
        if self.model is None:
            print(f"Loading Whisper model: {self.model_size} on {self.device}...")
            self.model = WhisperModel(self.model_size, device=self.device, compute_type=self.compute_type)
            print("Whisper model loaded.")

    def unload_model(self):
        if self.model is not None:
            print("Unloading Whisper model...")
            del self.model
            self.model = None
            if self.device == "cuda":
                torch.cuda.empty_cache()
            print("Whisper model unloaded.")

    def transcribe(self, audio_path: str):
        self.load_model()
        try:
            segments, info = self.model.transcribe(audio_path, beam_size=5)
            
            print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

            transcription = []
            for segment in segments:
                transcription.append(segment.text)
                print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))
            
            full_text = " ".join(transcription)
            return full_text
        finally:
            # Optional: Unload model after transcription to save VRAM for LLM
            # For now, we will keep it loaded unless we hit memory issues, 
            # but the method is here if we need to enforce strict VRAM management.
            # self.unload_model() 
            pass
