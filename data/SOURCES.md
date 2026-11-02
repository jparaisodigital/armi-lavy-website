# ETF Data Sources

## SCHD Holdings

Primary source:
https://www.schwabassetmanagement.com/allholdings/schd

Provider: Schwab Asset Management
Use: Full SCHD holdings and portfolio weights
Refresh: Manual snapshot
Required metadata: source URL and data-as-of date

## VYMI Holdings

Primary fund source:
https://fund-docs.vanguard.com/F4430.pdf

Regulatory holdings source:
https://www.sec.gov/data-research/sec-markets-data

Provider: Vanguard / U.S. Securities and Exchange Commission
Use: VYMI fund metadata and full portfolio holdings through Form N-PORT
Refresh: Manual snapshot
Required metadata: source URL, filing/report date, and data-as-of date

## Data handling rules

- Use issuer or SEC data as the primary source.
- Do not use aggregator sites as the primary dataset.
- Preserve the source URL and data-as-of date in each JSON file.
- Do not mix holdings from different dates in one overlap calculation.
- Exclude cash or temporary positions unless clearly labeled.
- Keep weights as percentage points, for example 4.25 means 4.25%.
