# Static ETF Tool Data

This folder contains the manually maintained datasets used by the three ETF tools.

The site must work without a live API. Every dataset should include a clear `dataAsOf` date and, when available, a human-readable source note.

## Planned files

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

## `etfs.json`

Fixed screener universe of 339 core ETFs, derived from the client's 342-record list after excluding TBT, TMF, and TMV.

Required record fields:

- `ticker`
- `name`
- `category`
- `dividendYield`
- `expenseRatio`
- `aum`
- `dataAsOf`

Optional fields may be added only when they are consistently available across the dataset.

## Holdings files

Used by the SCHD vs VYMI overlap tool.

Required top-level fields:

- `fund`
- `dataAsOf`
- `source`
- `holdings`

Each holding should contain:

- `ticker`
- `name`
- `weight`

Weights should use percentage points, for example `4.25` means 4.25%.

## Price files

Used by the backtester for SCHD, JEPI, VYMI, and VOO.

Required top-level fields:

- `fund`
- `dataAsOf`
- `source`
- `frequency`
- `series`

Each series record should contain:

- `date` in `YYYY-MM-DD` format
- `value`

The selected value must be documented as either total-return data or price-return data. The backtester must not mix the two without clearly labeling the result.

## Data rules

- Do not add live API calls for the initial release.
- Do not silently mix dates or data sources.
- Keep the original source and data-as-of date with every refresh.
- Validate ticker names, percentages, dates, and missing values before release.
- Update the client-facing data-as-of label whenever the dataset changes.

## Current status

The folder defines the data contract and preserves the client-provided source list. The live core dataset contains 339 ETFs after the approved exclusions; holdings and price datasets remain separate static snapshots.
