"""
main.py — FastAPI application entry point.

Exposes the /chat endpoint that receives user questions, routes them
through the hybrid knowledge system, and returns LLM-generated answers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

import router
import local_knowledge
import llm_service
import cache


# ============================================================
# LIFESPAN — Load knowledge base on startup
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load local knowledge base when the app starts."""
    print("[main] Loading local knowledge base...")
    local_knowledge.load_all()
    print("[main] Chatbot API ready!")
    yield
    print("[main] Shutting down...")


# ============================================================
# APP INITIALIZATION
# ============================================================

app = FastAPI(
    title="USD Hybrid Knowledge Chatbot API",
    description="Chatbot API for Universitas Sanata Dharma using Groq LLM with hybrid local + web knowledge.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow requests from the frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class ChatRequest(BaseModel):
    """Incoming chat request."""
    question: str


class ChatResponse(BaseModel):
    """Outgoing chat response."""
    answer: str
    intent: str
    sources: list[str]


# ============================================================
# ENDPOINTS
# ============================================================

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint.

    Flow:
    1. Classify user intent (local / web / hybrid)
    2. Gather context from appropriate sources
    3. Send context + question to LLM
    4. Return structured response
    """
    question = request.question.strip()

    if not question:
        return ChatResponse(
            answer="Silakan masukkan pertanyaan terlebih dahulu.",
            intent="none",
            sources=[],
        )

    # Step 1: Route the query
    intent = router.classify(question)
    print(f"[main] Question: '{question}' → Intent: {intent.value}")

    # Step 2: Gather context — ALWAYS try local first, then web as supplement
    context_parts = []
    sources = []

    # Always search local knowledge base first (it may have the answer
    # even if the router classified the intent as WEB, e.g. stored announcements)
    local_ctx = local_knowledge.search(question)
    if local_ctx:
        context_parts.append(f"=== Data Lokal (Knowledge Base) ===\n{local_ctx}")
        sources.append("knowledge_base")

    # Add web content if:
    # - Intent is explicitly WEB (dynamic info requested), OR
    # - Intent is HYBRID but local KB found nothing (supplement with web)
    # Skip web fetch if local KB already has data and intent is LOCAL or HYBRID
    # This reduces noise from generic web pages polluting the LLM context.
    if intent == router.Intent.WEB or (not context_parts):
        web_ctx = web_fetcher.fetch_all_sources()
        if web_ctx:
            context_parts.append(web_ctx)
            sources.append("website_usd")

    # Build final context
    if context_parts:
        context = "\n\n".join(context_parts)
    else:
        context = "Tidak ada data tersedia dari sumber manapun."

    # Step 3: Ask LLM
    answer = llm_service.ask(question, context)

    # Step 4: Return response
    return ChatResponse(
        answer=answer,
        intent=intent.value,
        sources=sources,
    )


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "model": llm_service.MODEL,
        "topics_loaded": len(local_knowledge.get_all_topics()),
    }


@app.get("/debug/cache")
async def debug_cache():
    """Debug endpoint to inspect cache status."""
    return cache.info()


@app.get("/debug/topics")
async def debug_topics():
    """Debug endpoint to list all loaded knowledge topics."""
    return {
        "topics": local_knowledge.get_all_topics(),
        "total": len(local_knowledge.get_all_topics()),
    }


@app.post("/cache/clear")
async def clear_cache():
    """Clear the web content cache."""
    cache.clear()
    return {"message": "Cache cleared successfully"}
