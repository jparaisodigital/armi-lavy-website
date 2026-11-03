# Screener Data Sources

## Fixed universe

Target: 342 U.S.-listed ETFs

The universe will be manually curated from official issuer product lists and kept fixed for the initial release.

## Primary issuer sources

Vanguard:
https://investor.vanguard.com/investment-products/list/etfs?lang=en

iShares / BlackRock:
https://www.ishares.com/us/products/etf-investments

State Street SPDR:
https://www.ssga.com/library-content/pdfs/etf/us/spdr-etf-listing.pdf

Invesco:
https://www.invesco.com/us/en/solutions/invesco-etfs.html

## Initial screener fields

- ticker
- fund name
- issuer
- category or strategy
- dividend yield
- expense ratio
- assets under management
- data-as-of date
- source URL

## Data rules

- Use official issuer information as the primary source.
- Keep the ETF universe fixed at 342 records.
- Preserve source and data-as-of metadata.
- Do not add live API calls.
- Do not silently replace or remove ETFs during updates.
- New ETFs or new fields are separate scope.
