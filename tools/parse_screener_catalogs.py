from pathlib import Path
import csv
import re

base = Path("data/raw/screener")
output = base / "issuer-candidates.csv"
rows = []

def add_row(issuer, ticker, name, expense, source_file):
    ticker = ticker.strip().upper()
    name = re.sub(r"\s+", " ", name).strip()

    if not ticker or not name:
        return

    if ticker in {"ETF", "FUND", "NAME", "SYMBOL"}:
        return

    rows.append({
        "issuer": issuer,
        "ticker": ticker,
        "name": name,
        "expenseRatio": expense,
        "sourceFile": source_file
    })

ishares_pattern = re.compile(
    r"^(?P<name>.+?)\s+(?P<ticker>[A-Z][A-Z0-9]{1,5})\s+(?P<expense>\d+\.\d{2})$"
)

for line in (base / "ishares-product-list.txt").read_text(
    encoding="utf-8", errors="replace"
).splitlines():
    line = line.strip()
    match = ishares_pattern.match(line)

    if match:
        add_row(
            "iShares",
            match.group("ticker"),
            match.group("name"),
            match.group("expense"),
            "ishares-product-list.pdf"
        )

spdr_pattern = re.compile(
    r"^\s*(?P<ticker>[A-Z0-9]{2,5})\s+(?P<rest>.+?)\s+(?P<expense>\d+\.\d{2})$"
)

for line in (base / "spdr-etf-listing.txt").read_text(
    encoding="utf-8", errors="replace"
).splitlines():
    match = spdr_pattern.match(line)

    if match:
        name = re.sub(r"^[^A-Za-z]+", "", match.group("rest"))

        add_row(
            "State Street SPDR",
            match.group("ticker"),
            name,
            match.group("expense"),
            "spdr-etf-listing.pdf"
        )

unique = {}
for row in rows:
    unique.setdefault(row["ticker"], row)

with output.open("w", newline="", encoding="utf-8") as stream:
    writer = csv.DictWriter(
        stream,
        fieldnames=["issuer", "ticker", "name", "expenseRatio", "sourceFile"]
    )
    writer.writeheader()
    writer.writerows(sorted(unique.values(), key=lambda row: row["ticker"]))

print(f"Raw candidates: {len(rows)}")
print(f"Unique ticker candidates: {len(unique)}")
print(output)
