from pydantic import BaseModel
from typing import Dict, Any, Optional

class AIUsageMetadata(BaseModel):
    prompt_tokens: int
    candidate_tokens: int
    total_tokens: int

class AIUnifiedResponse(BaseModel):
    content: Dict[str, Any]
    usage: AIUsageMetadata
    raw_response: Optional[str] = None
