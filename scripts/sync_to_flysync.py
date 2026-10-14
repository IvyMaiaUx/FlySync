"""Script de sincronização executável a partir da pasta do front-end FlySync.
Lê o banco de dados do scraper Monitor-Milhas e envia as ofertas para o Supabase.
"""

from __future__ import annotations

import argparse
import os
import sqlite3
import sys
from datetime import date
from pathlib import Path
import requests

DEFAULT_DB_PATH = Path(r"C:\Users\Ivy Maia\Downloads\Monitor-Milhas-20261014T153844Z-1-001\Monitor-Milhas\data\opportunities.db")
DEFAULT_SUPABASE_URL = "https://kcbuuwftyoyqisltqcuh.supabase.co"
DEFAULT_SUPABASE_KEY = "sb_publishable_v6ZQ0_gJJsPKpfZQuFhO6A_7SiJENV-"


def resolve_booking_url(program: str, origin: str, dest: str) -> str:
    prog = (program or "").lower()
    if "smiles" in prog:
        return f"https://www.smiles.com.br/passagens-aereas/{origin.lower()}-para-{dest.lower()}"
    if "fleyn" in prog or "latam" in prog:
        return f"https://www.latamairlines.com/br/pt/ofertas-voos?origin={origin.upper()}&dest={dest.upper()}"
    if "azul" in prog:
        return "https://www.voeazul.com.br/br/pt/resgate-pontos"
    return "https://www.smiles.com.br"


def sync_all(include_past: bool = False, limit: int | None = None) -> int:
    db_path = DEFAULT_DB_PATH
    if not db_path.exists():
        print(f"[-] Banco de dados do Scraper não encontrado em: {db_path}", file=sys.stderr)
        return 1

    print(f"[+] Conectando ao banco SQLite: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query = "SELECT * FROM opportunities ORDER BY departure_date DESC"
    if limit:
        query += f" LIMIT {limit}"

    cursor.execute(query)
    rows = cursor.fetchall()
    total = len(rows)

    today_str = date.today().isoformat()
    print(f"[+] Total de oportunidades encontradas no SQLite: {total}")

    session = requests.Session()
    session.headers.update({
        "apikey": DEFAULT_SUPABASE_KEY,
        "Authorization": f"Bearer {DEFAULT_SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    })
    endpoint = f"{DEFAULT_SUPABASE_URL}/rest/v1/rpc/sync_scraper_offer"

    success_count = 0
    skipped_count = 0
    fail_count = 0

    for idx, row in enumerate(rows, 1):
        d = dict(row)
        dep_date = str(d.get("departure_date") or "")

        if not include_past and dep_date and dep_date < today_str:
            skipped_count += 1
            continue

        payload = {
            "raw_id": d.get("raw_id") or "",
            "program": d.get("program") or "",
            "origin": (d.get("origin") or "").upper(),
            "destination": (d.get("destination") or "").upper(),
            "origin_city": d.get("origin_city") or "",
            "destination_city": d.get("destination_city") or "",
            "departure_date": dep_date,
            "cabin": d.get("cabin") or "ECONOMY",
            "price_miles": int(d.get("price_miles") or 0),
            "taxes": float(d.get("taxes") or 0.0),
            "currency": d.get("currency") or "BRL",
            "airline": str(d.get("airline") or "").strip(),
            "flight_number": d.get("flight_number"),
            "connection_count": int(d.get("connection_count") or 0),
            "booking_url": resolve_booking_url(d.get("program") or "", d.get("origin") or "", d.get("destination") or ""),
            "seats_left": int(d.get("seats_left") or 4),
        }

        try:
            resp = session.post(endpoint, json={"p_offer": payload}, timeout=15)
            if resp.status_code in (200, 201) and resp.json().get("success"):
                success_count += 1
            else:
                fail_count += 1
        except Exception as exc:
            fail_count += 1

    conn.close()
    print(f"\n[+] Resultado da sincronização:")
    print(f"    - Sucessos: {success_count}")
    print(f"    - Ignorados (voos com data passada): {skipped_count}")
    print(f"    - Falhas: {fail_count}")

    if skipped_count > 0 and success_count == 0:
        print("\n[!] Atenção: Todos os voos desse arquivo são de agosto/2026 (já passaram há 2 meses).")
        print("    Para buscar voos futuros novos e quentes, rode o scraper no terminal:")
        print("    cd \"C:\\Users\\Ivy Maia\\Downloads\\Monitor-Milhas-20261014T153844Z-1-001\\Monitor-Milhas\"")
        print("    python main.py --once\n")

    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--include-past", action="store_true", help="Inclui mesmo voos com data passada")
    parser.add_argument("--limit", type=int, help="Limita quantidade")
    args = parser.parse_args()

    sys.exit(sync_all(include_past=args.include_past, limit=args.limit))
