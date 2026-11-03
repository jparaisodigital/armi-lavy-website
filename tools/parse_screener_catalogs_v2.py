from pathlib import Path
import csv
import re

base = Path("data/raw/screener")
output = base / "issuer-candidates-v2.csv"
rows = []

def clean(value):
    return re.sub(r"\s+", " ", value).strip()

def add_row(issuer, ticker, name, expense, source):
    ticker = clean(ticker).upper()
    name = clean(name)

    if not ticker or not name:
        return

    blocked = {
        "ETF", "FUND", "NAME", "SYMBOL", "US", "STYLE",
        "SECTOR", "CORE", "INCOME", "FIXED", "OTHER",
        "INTERNATIONAL", "COMMODITY", "REAL", "ASSET"
    }

    if ticker in blocked:
        return

    rows.append({
        "issuer": issuer,
        "ticker": ticker,
        "name": name,
        "expenseRatio": expense,
        "sourceFile": source
    })

def is_heading(line):
    lowered = line.lower()

    return (
        lowered in {
            "fund name",
            "trading symbol",
            "expense ratio (%)",
            "ticker fund name net",
            "expense ratio (%)",
            "international stocks (continued)"
        }
        or lowered.endswith("stocks")
        or lowered.endswith("stocks (continued)")
        or lowered in {
            "us equities",
            "international equities",
            "fixed income",
            "commodities",
            "style",
            "sector",
            "geographic",
            "active funds"
        }
    )

# iShares: recover names split across multiple lines.
ishares_product = re.compile(
    r"^(.*?)([A-Z][A-Z0-9]{1,5})\s+(\d+\.\d{2})$"
)

ishares_buffer = []

for raw in (base / "ishares-product-list.txt").read_text(
    encoding="utf-8",
    errors="replace"
).splitlines():

    line = clean(raw)

    if not line or line.isdigit():
        ishares_buffer = []
        continue

    if is_heading(line):
        ishares_buffer = []
        continue

    match = ishares_product.match(line)

    if match:
        name_parts = ishares_buffer[-2:] + [match.group(1)]
        name = clean(" ".join(part for part in name_parts if part))

        add_row(
            "iShares",
            match.group(2),
            name,
            match.group(3),
            "ishares-product-list.pdf"
        )

        ishares_buffer = []
    else:
        ishares_buffer.append(line)

# SPDR: recover rows where the fund name and expense ratio are split.
spdr_start = re.compile(r"^\s*([A-Z0-9]{2,5})\s+(.+)$")
spdr_expense = re.compile(r"^\d+\.\d+$")
spdr_buffer = []

for raw in (base / "spdr-etf-listing.txt").read_text(
    encoding="utf-8",
    errors="replace"
).splitlines():

    line = clean(raw)

    if not line or line.isdigit():
        continue

    if is_heading(line):
        spdr_buffer = []
        continue

    if spdr_buffer and spdr_expense.match(line):
        first = spdr_buffer[0]
        match = spdr_start.match(first)

        if match:
            name_parts = [match.group(2)] + spdr_buffer[1:]
            name = clean(" ".join(name_parts))
            name = re.sub(r"^[^A-Za-z]+", "", name)

            add_row(
                "State Street SPDR",
                match.group(1),
                name,
                line,
                "spdr-etf-listing.pdf"
            )

        spdr_buffer = []
        continue

    same_line = re.match(
        r"^\s*([A-Z0-9]{2,5})\s+(.+?)\s+(\d+\.\d{2})$",
        line
    )

    if same_line:
        name = re.sub(r"^[^A-Za-z]+", "", same_line.group(2))

        add_row(
            "State Street SPDR",
            same_line.group(1),
            name,
            same_line.group(3),
            "spdr-etf-listing.pdf"
        )

        spdr_buffer = []
        continue

    if spdr_start.match(line):
        spdr_buffer = [line]
    elif spdr_buffer:
        spdr_buffer.append(line)

# Deduplicate by ticker.
unique = {}

for row in rows:
    unique.setdefault(row["ticker"], row)

with output.open("w", newline="", encoding="utf-8") as stream:
    writer = csv.DictWriter(
        stream,
        fieldnames=[
            "issuer",
            "ticker",
            "name",
            "expenseRatio",
            "sourceFile"
        ]
    )
    writer.writeheader()
    writer.writerows(sorted(unique.values(), key=lambda row: row["ticker"]))

print(f"Raw candidates: {len(rows)}")
print(f"Unique ticker candidates: {len(unique)}")
print(output)
