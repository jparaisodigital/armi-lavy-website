# Armi L. Lavy Website — ETF Tools Roadmap

## Project direction

Add three static, educational ETF tools to the existing website:

1. **Tool #2 — Overlap:** SCHD vs VYMI
2. **Tool #4 — Screener:** fixed universe of 339 ETFs
3. **Tool #5 — Backtester:** SCHD, JEPI, and VYMI vs VOO

The tools will use manually maintained local data files and browser-side JavaScript. They will not use live market APIs, user accounts, a database, or a server-side calculation engine.

## Existing project foundation

- Static HTML/CSS/JavaScript website
- Main tools page: `tools.html`
- Existing tool logic: `tools.js` and `calculator.js`
- Existing styling: `style.css` and `theme.css`
- Existing Cloudflare Worker is for financial news only and is not required for these ETF tools

## Scope and deliverables

### Tool #2 — Overlap: SCHD vs VYMI

Display a clear comparison of the two fixed ETFs using a manually prepared holdings snapshot.

Initial output:

- Shared holdings
- Approximate overlap percentage
- Holdings weights for each fund
- Optional sector or geography summary if the source data supports it
- Data-as-of date
- Educational disclaimer

The comparison is fixed to SCHD and VYMI for the first release. Adding arbitrary tickers is outside the initial scope.

### Tool #4 — Screener: 339 ETFs

Display a searchable and filterable table using the client-provided 342-record list, excluding TBT, TMF, and TMV as leveraged/inverse tactical ETFs. The live core universe contains 339 ETFs.

Initial fields:

- Ticker
- Fund name
- ETF category or strategy
- Dividend yield
- Expense ratio
- Assets under management, when available
- Data-as-of date

Initial interactions:

- Search by ticker or fund name
- Filter by category or strategy
- Filter or sort by available metrics
- Reset filters
- Responsive table layout

The universe remains fixed at 339 core ETFs unless a separate scope change is approved.

### Tool #5 — Backtester: dividend ETFs vs VOO

Compare the fixed funds SCHD, JEPI, VYMI, and VOO using manually prepared historical data.

Initial output:

- Portfolio growth chart
- Ending value
- Total return
- Annualized return, if the dataset supports it
- Dividend or income summary, if available
- Basic comparison table
- Selected date range and assumptions
- Educational disclaimer

Initial assumptions should be explicit and consistent, including starting amount, contribution setting, dividend reinvestment, date range, and whether the data is total-return or price-return data.

## Static data plan

Use local JSON or CSV files committed with the website. Suggested organization:

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

Every dataset must include a visible `dataAsOf` date and a source note where practical.

## Update policy

- No automatic updates
- No live prices
- Manual refresh by the developer when requested
- Recommended normal cadence: quarterly or as-needed
- The ₱700 update fee covers a data refresh for the existing tools and fields only
- New ETFs, new metrics, new filters, redesigns, or new calculations are separate scope

## Implementation phases

### Phase 1 — Confirm data and formulas

- Confirm the client-provided 342-record list and the three approved exclusions
- Confirm source and format of holdings data
- Confirm source and frequency of historical data
- Confirm overlap formula
- Confirm screener fields and filter behavior
- Confirm backtester assumptions and return methodology

### Phase 2 — Prepare static datasets

- Create the ETF universe dataset
- Create SCHD and VYMI holdings snapshots
- Create historical datasets for SCHD, JEPI, VYMI, and VOO
- Validate dates, ticker names, weights, missing values, and units
- Add source and data-as-of metadata

### Phase 3 — Build the three tools

- Add the tool sections to `tools.html`
- Add data loading and calculations to a dedicated JavaScript module or clearly separated sections
- Reuse the existing visual language and responsive styles
- Add loading, empty, and invalid-data states
- Add plain-language explanations and disclaimers

### Phase 4 — Verify

- Test desktop and mobile layouts
- Test search, filters, reset behavior, and chart rendering
- Test calculations against hand-checked examples
- Test missing or incomplete data behavior
- Check that existing tools still work
- Check console errors and broken links

### Phase 5 — Prepare handoff

- Record the final dataset dates
- Record update instructions
- Record the formulas and assumptions
- Confirm the client-facing limitations of static data

## Acceptance criteria

- All three tools are accessible from the existing Tools page
- No external API is required for normal use
- The page works from the deployed static site
- SCHD vs VYMI overlap produces a repeatable result from the included snapshot
- The screener loads all 339 core ETF records and supports the agreed filters
- The backtester compares SCHD, JEPI, VYMI, and VOO using the agreed dataset and assumptions
- Every tool shows a data-as-of date and educational disclaimer
- Existing calculator, goal planner, and safety checklist remain functional
- The site remains usable on mobile screens

## Out of scope for the initial ₱8,000 implementation

- Live market data
- Paid data APIs
- Daily or monthly automatic syncing
- Login, saved portfolios, or user accounts
- Arbitrary ticker lookup
- Real-time quotes
- Tax-aware performance calculations
- Personalized investment advice
- Guaranteed data completeness or accuracy beyond the stated snapshot date

## Commercial scope note

This roadmap defines a static educational toolkit. The one-time implementation fee covers the agreed fixed tools and fixed datasets. Future ₱700 updates should be limited to refreshing existing data files and metadata. Any change to functionality or scope should be quoted separately.
