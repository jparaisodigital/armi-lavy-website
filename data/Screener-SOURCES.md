# Screener Data Sources

## Fixed universe

Target: 339 core U.S.-listed ETFs

Universe note:
- Derived from the client-provided 342-record list.
- TBT, TMF, and TMV are excluded as leveraged/inverse tactical ETFs.

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
- Keep the core ETF universe fixed at 339 records.
- Preserve source and data-as-of metadata.
- Do not add live API calls.
- Do not silently replace or remove ETFs during updates.
- New ETFs or new fields are separate scope.


## Additional issuer sources

Schwab Asset Management (SCHD):
https://www.schwabassetmanagement.com/products/schd

J.P. Morgan Asset Management (JEPI):
https://am.jpmorgan.com/us/en/asset-management/adv/products/jpmorgan-equity-premium-income-etf-46641q332

## Metric definitions

- dividendYield = 30-day SEC yield, as published by the issuer.
- If the issuer does not publish a 30-day SEC yield, set dividendYield to null. Do not substitute trailing or distribution yield.
- expenseRatio = net expense ratio as published by the issuer, in percent.
- Each metric keeps its own as-of date: yieldAsOf, expenseRatioAsOf, aumAsOf.
- The screener table labels the column "30-day SEC yield" and shows null values as "N/A".

## Source hierarchy

- Primary: official issuer pages and issuer product lists only.
- Exchange listings (Nasdaq Trader, NYSE) are used only to confirm that a ticker exists and is listed, never for yield or expense ratio.
- Third-party sites (Yahoo, MarketBeat, StockAnalysis, etc.) are not used for screener metrics.

## Captured official snapshots used in the current build

- iShares current product screener snapshot: https://www.ishares.com/us/product-screener/product-screener-v3.1.jsn?dcrPath=/templatedata/config/product-screener-v3/data/en/us-ishares/product-screener-ketto&siteEntryPassthrough=true
- USCF product pages reviewed for USO, UNG, BNO, and CPER. Their current pages did not publish a numeric total expense ratio in the captured snapshot, so those fields remain N/A:
  - https://www.uscfinvestments.com/uso
  - https://www.uscfinvestments.com/ung
  - https://www.uscfinvestments.com/bno
  - https://www.uscfinvestments.com/cper
