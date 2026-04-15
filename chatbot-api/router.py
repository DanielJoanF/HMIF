"""
router.py — Keyword-based query intent router.

Determines whether a user question should be answered using:
  - LOCAL knowledge base (static info: visi, misi, profil, fasilitas, etc.)
  - WEB scraping (dynamic info: pengumuman, jadwal, event terbaru, etc.)
  - BOTH (hybrid — combines local + web context)
"""

from enum import Enum


class Intent(str, Enum):
    """Classification of user question intent."""
    LOCAL = "local"       # Static info — use local knowledge base
    WEB = "web"           # Dynamic info — fetch from website
    HYBRID = "hybrid"     # Needs both sources


# ============================================================
# KEYWORD DEFINITIONS
# ============================================================

# Keywords that indicate the user is asking about STATIC information
# (answered from local knowledge base)
LOCAL_KEYWORDS = [
    # Identitas & Profil
    "visi", "misi", "sejarah", "profile", "profil", "tentang",
    "latar belakang", "tujuan", "filosofi", "sejarah", "berdiri",
    # Struktur organisasi
    "struktur", "organisasi", "divisi", "pengurus", "ketua",
    "wakil", "sekretaris", "bendahara", "anggota",
    # Akademik statis
    "kurikulum", "mata kuliah", "matkul", "semester", "sks",
    "dosen", "laboratorium", "lab", "fasilitas",
    "jurusan", "prodi", "program studi", "informatika",
    "gelar", "akreditasi", "sarjana",
    # HMIF specific
    "hmif", "himpunan", "kaderisasi", "divisi", "anggota",
    # Umum statis
    "alamat", "lokasi", "kampus", "kontak", "Sanata Dharma", "USD", "Universitas Sanata Dharma",
    "syarat", "pendaftaran masuk", "biaya", "jurusan", "prodi", "program studi", "informatika", "teknik", "komputer",
]

# Keywords that indicate the user is asking about DYNAMIC information
# (answered by fetching live website content)
WEB_KEYWORDS = [
    # Berita & pengumuman
    "pengumuman", "berita", "terbaru", "terkini", "update",
    "info terbaru", "kabar", "news",
    # Kegiatan & event
    "kegiatan", "event", "acara", "seminar", "workshop",
    "lomba", "kompetisi", "webinar",
    # Jadwal
    "jadwal", "tanggal", "kapan", "deadline", "batas waktu",
    "kalender", "agenda",
    # Pendaftaran aktif
    "pendaftaran", "registrasi", "daftar", "recruitment",
    "open recruitment", "oprec",
    # Umum dinamis
    "terbaru", "hari ini", "minggu ini", "bulan ini",
    "saat ini", "sekarang",
]


def classify(query: str) -> Intent:
    """
    Classify user query intent based on keyword matching.

    Logic:
    1. Check if query matches LOCAL keywords (static info)
    2. Check if query matches WEB keywords (dynamic info)
    3. If both match → HYBRID
    4. If neither → default to HYBRID (let both sources contribute)

    Args:
        query: The user's question.

    Returns:
        Intent enum value (LOCAL, WEB, or HYBRID).
    """
    query_lower = query.lower()

    has_local = any(kw in query_lower for kw in LOCAL_KEYWORDS)
    has_web = any(kw in query_lower for kw in WEB_KEYWORDS)

    if has_local and has_web:
        return Intent.HYBRID
    elif has_local:
        return Intent.LOCAL
    elif has_web:
        return Intent.WEB
    else:
        # Default: try both sources to maximize answer coverage
        return Intent.HYBRID


def get_matched_keywords(query: str) -> dict:
    """
    Debug helper — show which keywords were matched.

    Returns:
        Dictionary with matched local and web keywords.
    """
    query_lower = query.lower()
    return {
        "local_matches": [kw for kw in LOCAL_KEYWORDS if kw in query_lower],
        "web_matches": [kw for kw in WEB_KEYWORDS if kw in query_lower],
    }
