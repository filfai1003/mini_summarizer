from fastapi import FastAPI, HTTPException
from app.models import SummarizeRequest, SummarizeResponse, HealthResponse
import os
from typing import Optional

# OpenAI SDK (>=1.0)
from openai import OpenAI

app = FastAPI(title="Summarizer API", version="0.1.0")


@app.get("/", tags=["info"])
def root():
    """Basic API information and useful links."""
    return {
        "name": app.title,
        "version": app.version,
        "health": "/health",
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json",
    }

def get_client() -> Optional[OpenAI]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    return OpenAI(api_key=api_key)



@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok")

@app.post("/summarize", response_model=SummarizeResponse)
def summarize(payload: SummarizeRequest):
    """
    Summarize the provided text using a large language model (OpenAI).

    The endpoint expects a JSON payload described by `SummarizeRequest`.
    Returns a `SummarizeResponse` containing the generated summary and the
    model used.
    """
    client = get_client()
    if client is None:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not found. Set the environment variable.")

    # Simple but effective system prompt for generic summarization
    system_prompt = (
        "You are a concise, faithful summarizer. "
        "Return a short, self-contained summary capturing key points."
    )
    user_prompt = (
        f"Summarize the following text in {payload.language or 'English'}.\n\n"
        f"Length: {payload.length or 'short'}.\n"
        f"Text:\n{payload.text}"
    )

    try:
        # Recommended model: gpt-4o-mini or a similar cost/latency efficient model
        resp = client.chat.completions.create(
            model=payload.model or "gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
        )
        summary = resp.choices[0].message.content.strip()
        return SummarizeResponse(summary=summary, model_used=payload.model or "gpt-4o-mini")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")
