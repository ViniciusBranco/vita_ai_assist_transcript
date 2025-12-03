from contextvars import ContextVar

# Context variable to store the full transcription text during the request lifecycle
transcription_context: ContextVar[str] = ContextVar("transcription_context", default="")
