"""
test_accuracy.py — Test script untuk verifikasi akurasi keyword matching.

Jalankan dari folder chatbot-api:
    python test_accuracy.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import local_knowledge

# ============================================================
# TEST CASES
# Format: (query, expected_file_should_match)
# ============================================================

TEST_CASES = [
    # === Fix 1: Query dibalik / variasi ===
    ("siapa yang jadi ketua hmif?",          "hmif_pengurus.txt"),
    ("ketua HMIF namanya siapa?",            "hmif_pengurus.txt"),
    ("nama ketua dari himpunan informatika", "hmif_pengurus.txt"),
    ("visi misi himpunan informatika apa?",  "hmif_profil.txt"),
    ("bagaimana visi dari hmif?",            "hmif_profil.txt"),
    ("kontak resmi hmif gimana?",            "hmif_profil.txt"),

    # === Fix 2: Pertanyaan kontekstual ===
    ("ada kegiatan apa aja di hmif?",        "hmif_proker.txt"),
    ("acara atau event apa yang diadakan?",  "hmif_proker.txt"),
    ("informasi brs genap 2025",             "pengumuman_prodi.txt"),
    ("kapan uas semester ini?",              "pengumuman_prodi.txt"),
    ("info terbaru dari prodi informatika",  "pengumuman_prodi.txt"),
    ("berita terbaru prodi usd",             "berita_prodi.txt"),
]

# ============================================================
# RUNNER
# ============================================================

def run_tests():
    print("=" * 60)
    print("TEST ACCURACY — Local Knowledge Matching")
    print("=" * 60)

    local_knowledge.load_all()
    print()

    passed = 0
    failed = 0

    for query, expected_file in TEST_CASES:
        result = local_knowledge.search(query)

        if result and expected_file.replace(".txt", "").replace("_", " ").title() in result:
            status = "PASS"
            passed += 1
        else:
            status = "FAIL"
            failed += 1

        print(f"{status} | Query: \"{query}\"")
        if status == "FAIL":
            if result:
                # Show which files were actually matched
                matched = [line for line in result.split("\n") if line.startswith("===")]
                print(f"       Expected file: {expected_file}")
                print(f"       Got matches:   {matched}")
            else:
                print(f"       Expected file: {expected_file}")
                print(f"       Got matches:   None (no match at all)")
        print()

    print("=" * 60)
    print(f"Results: {passed} passed, {failed} failed out of {len(TEST_CASES)} tests")
    print("=" * 60)

    return failed == 0


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
