"""
local_knowledge.py — Load and search the local knowledge base with per-file keyword matching.

Each data file is mapped to a set of keywords. When a user asks a question,
only the files whose keywords match the query are returned as context.
This avoids sending irrelevant data to the LLM and improves answer accuracy.

Matching uses token-based intersection so word order does not matter.
"""

import os
import re
from typing import Optional


# ============================================================
# PER-FILE KEYWORD MAPPING
# Each file in data/ is mapped to keywords that trigger its retrieval.
# Keywords can be single words OR multi-word phrases.
# Matching is token-based, so word order in the query doesn't matter.
# ============================================================

FILE_KEYWORD_MAP: dict[str, list[str]] = {
    "hmif_profil.txt": [
        # Identitas organisasi
        "hmif", "himpunan", "profil", "tentang", "visi", "misi",
        "organisasi", "kontak", "instagram", "email",
        "informatika", "fakultas", "sains", "teknologi",
        # Sinonim & variasi
        "apa", "apakah", "bagaimana", "seperti apa", "ceritakan",
        "sejarah", "latar belakang", "tujuan", "fungsi", "peran",
        "usd", "sanata dharma",
    ],
    "hmif_pengurus.txt": [
        "pengurus", "ketua", "wakil", "sekretaris", "bendahara",
        "divisi", "struktur", "koordinator", "anggota",
        "humas", "kewirausahaan", "medkominfo", "minat", "bakat",
        "psdm", "sosial", "web holder",
        # Sinonim jabatan
        "jabatan", "siapa", "posisi", "pj", "penanggung jawab",
        "nama", "pengurus aktif", "kepengurusan", "periode",
        "co", "sumber daya manusia",
        # Nama-nama pengurus
        "tio alan", "tumba", "advhenita", "elvinda",
        "yoas", "rachel", "thomas paskal", "pebrianus", "gabriella nava",
        "agustinus wisik", "wilston", "daniel joan",
    ],
    "hmif_proker.txt": [
        "program kerja", "proker", "kegiatan", "event", "hmif",
        "informatika belajar", "if 1", "if 2",
        "saos", "open source",
        "kunjungan perusahaan", "kunjungan",
        "iasd", "alumni",
        "it days", "informatika days",
        "lomba", "seminar", "workshop", "agenda",
        # Sinonim
        "ada apa", "apa saja", "rencana", "kegiatan apa", "acara",
        "plannya", "plan", "aktivitas",
    ],
    "pengumuman_prodi.txt": [
        "pengumuman", "jadwal", "uas", "ujian", "brs",
        "bimbingan rencana studi", "kuliah online", "kuliah tatap muka",
        "incasst", "expo day", "talkshow",
        "tanggal", "kapan", "deadline", "batas",
        "semester", "gasal", "genap",
        # Sinonim & variasi
        "pengumuman prodi", "info prodi", "jadwal kuliah", "jadwal ujian",
        "kalender akademik",
    ],
    "berita_prodi.txt": [
        "berita prodi", "pelatihan", "pengabdian", "magic school",
        "dosen", "guru", "timbulharjo", "informatika usd",
        "dekan", "prodi informatika usd",
        # Sinonim
        "liputan", "artikel", "news",
    ],
    "usd_profil.txt": [
        # Identitas universitas
        "universitas", "usd", "sanata dharma", "universitas sanata dharma",
        "sejarah", "berdiri", "didirikan", "pendiri", "jesuit", "serikat yesus",
        "visi", "misi", "tujuan", "filosofi", "tentang",
        # Kontak & lokasi
        "alamat", "lokasi", "kampus", "mrican", "paingan", "yogyakarta",
        "telepon", "email", "kontak",
        # Fakta umum
        "akreditasi", "fakultas", "jumlah mahasiswa", "rektor",
        "swasta", "katolik", "ptk", "perguruan tinggi",
    ],
    "usd_prodi_ti.txt": [
        # Program studi
        "teknik informatika", "prodi ti", "prodi informatika",
        "teknik", "informatika", "komputer", "program studi",
        # Kurikulum & akademik
        "kurikulum", "mata kuliah", "matkul", "sks", "semester",
        "akreditasi prodi", "gelar", "sarjana", "s1",
        # Fasilitas
        "laboratorium", "lab", "fasilitas", "ruang kuliah",
        # Sinonim
        "jurusan komputer", "jurusan informatika", "kuliah di usd",
    ],
    "usd_profil.txt": [
        # Identitas universitas
        "universitas", "usd", "sanata dharma", "universitas sanata dharma", "rektor universitas sanata dharma",
        "sejarah", "berdiri", "didirikan", "pendiri", "jesuit", "serikat yesus", "rektor sanata dharma",
        "visi", "misi", "tujuan", "filosofi", "tentang","rektor","wakil rektor","wakil rektor i","wakil rektor ii","wakil rektor iii","wakil rektor iv",
        # Kontak & lokasi
        "alamat", "lokasi", "kampus", "mrican", "paingan", "yogyakarta",
        "telepon", "email", "kontak", 
        # Fakta umum
        "akreditasi", "fakultas", "jumlah mahasiswa", "rektor",
        "swasta", "katolik", "ptk", "perguruan tinggi",
    ],
}


# ============================================================
# DATA STORAGE — loaded once at startup
# ============================================================

_file_contents: dict[str, str] = {}

# Path to the data directory
_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")


def load_all() -> None:
    """Load all .txt files from the data/ directory into memory."""
    global _file_contents
    _file_contents = {}

    if not os.path.isdir(_DATA_DIR):
        print(f"[local_knowledge] WARNING: data directory not found at {_DATA_DIR}")
        return

    for filename in os.listdir(_DATA_DIR):
        if filename.endswith(".txt"):
            filepath = os.path.join(_DATA_DIR, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        _file_contents[filename] = content
                        print(f"[local_knowledge] Loaded: {filename} ({len(content)} chars)")
            except Exception as e:
                print(f"[local_knowledge] ERROR loading {filename}: {e}")

    print(f"[local_knowledge] Total files loaded: {len(_file_contents)}")

    # Warn about files not in keyword map
    for filename in _file_contents:
        if filename not in FILE_KEYWORD_MAP:
            print(f"[local_knowledge] WARNING: {filename} has no keyword mapping — it won't be searchable!")


def _tokenize(text: str) -> set[str]:
    """
    Tokenize text into a set of lowercase words (2+ chars).
    Strips punctuation so word order and symbols don't affect matching.
    """
    return set(re.findall(r'[a-z0-9]{2,}', text.lower()))


def search(query: str) -> Optional[str]:
    """
    Search for relevant knowledge files using token-based keyword matching.

    Logic:
    1. Tokenize the query into individual words.
    2. For each file, score by: (a) multi-word phrase matches in raw query,
       and (b) token intersection between query tokens and keyword tokens.
    3. Return content from matching files, ordered by relevance score.
    4. If no keyword matches, fall back to token-based full-text search.

    Token-based matching means word ORDER in the query does NOT matter.
    "siapa ketua hmif" and "ketua hmif siapakah" both match equally well.

    Args:
        query: The user's question.

    Returns:
        Combined context string from matching files, or None if nothing matches.
    """
    query_lower = query.lower()
    query_tokens = _tokenize(query_lower)

    # Score each file
    scored_files: list[tuple[str, int]] = []

    for filename, keywords in FILE_KEYWORD_MAP.items():
        if filename not in _file_contents:
            continue

        score = 0
        for kw in keywords:
            kw_lower = kw.lower()
            if " " in kw_lower:
                # Multi-word phrase: check substring in raw query
                if kw_lower in query_lower:
                    score += 2  # Phrase match is worth more
            else:
                # Single-word keyword: token-based match (order-independent)
                kw_tokens = _tokenize(kw_lower)
                if kw_tokens & query_tokens:  # intersection
                    score += 1

        if score > 0:
            scored_files.append((filename, score))

    # Sort by score descending (most relevant first)
    scored_files.sort(key=lambda x: x[1], reverse=True)

    if scored_files:
        parts = []
        for filename, score in scored_files:
            label = filename.replace(".txt", "").replace("_", " ").title()
            parts.append(f"=== {label} (relevansi: {score}) ===\n{_file_contents[filename]}")
        print(f"[local_knowledge] Matched files: {[(f, s) for f, s in scored_files]}")
        return "\n\n".join(parts)

    # Fallback: token-based full-text search across file contents
    # Only use query tokens with 3+ chars to avoid noise
    query_tokens_long = {t for t in query_tokens if len(t) >= 3}
    fallback_matches = []

    for filename, content in _file_contents.items():
        content_tokens = _tokenize(content)
        overlap = query_tokens_long & content_tokens
        if overlap:
            fallback_matches.append((filename, len(overlap)))

    # Sort fallback by overlap size
    fallback_matches.sort(key=lambda x: x[1], reverse=True)

    if fallback_matches:
        parts = []
        for filename, _ in fallback_matches:
            label = filename.replace(".txt", "").replace("_", " ").title()
            parts.append(f"=== {label} ===\n{_file_contents[filename]}")
        print(f"[local_knowledge] Fallback matched: {[f for f, _ in fallback_matches]}")
        return "\n\n".join(parts)

    print(f"[local_knowledge] No matches found for: '{query}'")
    return None


def get_all_topics() -> list[str]:
    """Return a list of all loaded file names for debugging."""
    return list(_file_contents.keys())
