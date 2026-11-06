# Armi L. Lavy Website — ETF Tools Current Scope

## Project direction

Maintain three static educational ETF tools on the existing website:

1. **Overlap:** SCHD vs VYMI
2. **Screener:** fixed universe of 339 ETFs
3. **Backtester:** SCHD, JEPI, and VYMI vs VOO

The site remains fully static. Data is stored locally in committed JSON/CSV files and processed in browser-side JavaScript.

No live market API, database, login system, or server-side calculation engine is required.

## Existing implementation

The project already includes:
- `tools.html`
- `tools.js`
- `calculator.js`
- `style.css`
- `theme.css`
- local ETF datasets and supporting research files
- Cloudflare Pages deployment

Existing calculator, planner, glossary, and other site features must remain functional.

## Tool #2 — SCHD vs VYMI Overlap

Fixed comparison only.

Display:
- shared holdings
- approximate overlap percentage
- holdings weights
- data-as-of date
- source note
- educational disclaimer

Optional sector/geography breakdown may be shown only if the local dataset supports it.

Do not add arbitrary ticker comparison unless separately approved.

## Tool #4 — ETF Screener

Use the approved 339-ETF core universe.

Original client list: 342 records.

Excluded:
- TBT
- TMF
- TMV

Initial fields:
- ticker
- fund name
- category / strategy
- dividend yield
- expense ratio
- AUM where available
- data-as-of date

Required interactions:
- search by ticker or fund name
- category / strategy filtering
- sorting/filtering by available metrics
- reset filters
- responsive table behavior

Do not expand the ETF universe without a scope change.

## Tool #5 — Backtester

Fixed comparison universe:
- SCHD
- JEPI
- VYMI
- VOO

Display:
- portfolio growth chart
- ending value
- total return
- annualized return when supported
- dividend/income summary when supported
- comparison table
- selected date range
- assumptions
- educational disclaimer

Assumptions must remain explicit and consistent:
- starting amount
- contribution behavior
- dividend reinvestment
- selected date range
- price-return vs total-return methodology

## Static data requirements

Preferred structure:

```text
data/
  etfs.json
  holdings/
    schd.json
    vymi.json
  prices/
    schd.json
    jepi.json
    vymi.json
    voo.json
```

Every production dataset should include:
- `dataAsOf`
- source note where practical
- consistent units and ticker names

## Maintenance model

- no automatic market-data updates
- no real-time quotes
- refresh manually when requested
- normal refresh cadence: quarterly or as needed
- refreshes should preserve the existing tool structure and fields unless a separate scope change is approved
- new ETFs, metrics, filters, calculations, or redesigns are separate scope

## Acceptance criteria

- all three ETF tools are accessible from `tools.html`
- all tools work on the static deployed site
- no external API is required for normal use
- overlap output is repeatable from the included snapshot
- screener loads all 339 approved ETFs
- backtester compares SCHD, JEPI, VYMI, and VOO correctly
- every tool shows data-as-of information and an educational disclaimer
- mobile layout remains usable
- no existing calculator, planner, glossary, or site interaction is broken
- no console errors or broken production links

## Out of scope

- live market data
- paid APIs
- automatic syncing
- user accounts
- saved portfolios
- arbitrary ticker lookup
- real-time prices
- tax-aware performance calculations
- personalized investment advice
- guaranteed completeness beyond the stated snapshot date

## Important implementation guardrails

Do not:
- replace static data with live APIs
- expand the 339-ETF universe without approval
- change backtester methodology silently
- commit temporary research files, backups, raw scraped assets, `tmp/`, or `__pycache__/` without review
- break existing tools or current site styling

Prefer targeted changes and reuse the existing visual language and responsive structure.