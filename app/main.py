from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import SummarizeRequest, SummarizeResponse, HealthResponse
import os
from typing import Optional

from openai import OpenAI

app = FastAPI(title="Summarizer API", version="build-0.0.1")

# Allow requests from local frontend dev servers
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    # If no OpenAI key is present, return a mock summary so frontend can be tested
    if client is None:
        text = payload.text or ""
        words = text.split()
        mock = " ".join(words[:30])
        if len(words) > 30:
            mock = mock + "..."
        return SummarizeResponse(summary=f"[MOCK] {mock}", model_used="mock")

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
        err_str = str(e).lower()
        if "insufficient_quota" in err_str or "429" in err_str or "quota" in err_str:
            return SummarizeResponse(summary=f"Quota exceeded, give money to OpenAI!", model_used="mock")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")
