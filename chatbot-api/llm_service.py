"""
llm_service.py — Groq API integration for LLM responses.

Sends structured context + user question to Groq's llama3-8b-8192 model.
Includes guardrail system prompt to prevent hallucination.
"""

import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# CONFIGURATION
# ============================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = "llama-3.1-8b-instant"
TEMPERATURE = 0
MAX_TOKENS = 1024

# ============================================================
# SYSTEM PROMPT — Anti-hallucination guardrail
# ============================================================

SYSTEM_PROMPT = """Kamu adalah asisten AI resmi untuk Universitas Sanata Dharma (USD) dan Himpunan Mahasiswa Informatika (HMIF USD).

ATURAN KETAT:
1. Jawab HANYA berdasarkan konteks yang diberikan di bawah ini.
2. JANGAN mengarang, mengasumsikan, atau menambahkan informasi yang TIDAK ada di konteks.
3. Jika informasi tidak ditemukan dalam konteks, jawab PERSIS:
   "Data tidak ditemukan dalam sumber resmi USD."
4. Gunakan bahasa Indonesia yang ramah dan santai.
5. Jika konteks berisi data dari website, sebutkan bahwa info berasal dari sumber online resmi USD.
6. Jawab secara ringkas, jelas, dan terstruktur (gunakan poin jika perlu).

PENTING: Kamu TIDAK boleh menjawab pertanyaan di luar konteks yang diberikan, meskipun kamu tahu jawabannya."""


def ask(question: str, context: str) -> str:
    """
    Send a question + context to Groq LLM and return the response.

    Args:
        question: The user's question.
        context: Relevant knowledge context (from local KB or web scraping).

    Returns:
        The LLM's response text.
    """
    if not GROQ_API_KEY:
        return "Error: GROQ_API_KEY belum dikonfigurasi. Silakan isi di file .env"

    # Build the user message with injected context
    user_message = f"""Konteks yang tersedia:
---
{context}
---

Pertanyaan pengguna: {question}

Jawab berdasarkan konteks di atas saja. Jika tidak ditemukan, katakan: "Data tidak ditemukan dalam sumber resmi USD."
"""

    try:
        client = Groq(api_key=GROQ_API_KEY)

        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
        )

        response = completion.choices[0].message.content
        return response.strip() if response else "Data tidak ditemukan dalam sumber resmi USD."

    except Exception as e:
        print(f"[llm_service] ERROR: {e}")
        error_str = str(e).lower()
        if "401" in error_str or "auth" in error_str:
            return "Error: API Key Groq tidak valid. Periksa konfigurasi GROQ_API_KEY."
        if "429" in error_str or "rate" in error_str:
            return "Terlalu banyak permintaan ke server AI. Mohon tunggu sebentar dan coba lagi."
        return "Terjadi kesalahan saat menghubungi server AI. Silakan coba lagi nanti."
