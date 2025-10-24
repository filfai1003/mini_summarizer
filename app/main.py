from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import SummarizeRequest, SummarizeResponse, HealthResponse
import os
import logging
from typing import Optional, Tuple

from openai import OpenAI

app = FastAPI(title="Summarizer API", version="build-0.0.1")

# Logger setup
logger = logging.getLogger("mini_summarizer")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

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


def _classify_llm_error(exc: Exception) -> Tuple[int, str]:
    """Return an (http_status_code, user_friendly_message) for common LLM errors.

    This keeps internal exception details out of HTTP responses while providing
    an appropriate status code.
    """
    err_str = str(exc).lower()

    status = None
    for attr in ("status_code", "http_status", "code", "status"):
        if hasattr(exc, attr):
            try:
                status = int(getattr(exc, attr))
                break
            except Exception:
                continue

    if status == 401 or "invalid_api_key" in err_str or "authentication" in err_str:
        return 401, "Authentication with the LLM failed. Check OPENAI_API_KEY."

    if status == 429 or "rate limit" in err_str or "429" in err_str or "insufficient_quota" in err_str or "quota" in err_str:
        return 429, "Rate limit or quota exceeded for the LLM. Please try again later."

    if status in (502, 503, 504) or "service unavailable" in err_str or "timeout" in err_str:
        return 503, "LLM service is temporarily unavailable. Try again later."

    if status == 400 or "invalid_request" in err_str or "invalid" in err_str:
        return 400, "Invalid request sent to the LLM. Check input parameters."

    return 502, "Unexpected error while contacting the LLM."



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
        text = payload.text or ""
        words = text.split()
        mock = " ".join(words[:30])
        if len(words) > 30:
            mock = mock + "..."
        return SummarizeResponse(summary=f"[MOCK] {mock}", model_used="mock")

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
        status_code, detail = _classify_llm_error(e)
        raise HTTPException(status_code=status_code, detail=detail)
