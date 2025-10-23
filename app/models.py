from pydantic import BaseModel, Field
from typing import Optional, Literal

class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=20, description="Text to summarize")
    language: Optional[str] = Field(None, description="Target language for the summary (e.g. English, French, Italian)")
    length: Optional[Literal["short", "medium", "long"]] = "short"
    model: Optional[str] = Field(None, description="LLM model name (e.g. gpt-4o-mini)")

class SummarizeResponse(BaseModel):
    summary: str
    model_used: str

class HealthResponse(BaseModel):
    status: str
