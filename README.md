# Banking-ODI-Demo — Northbay Financial

An ODI demo for banking and capital markets. Fictional top-15 US bank: $680B in assets, 14.2M retail
customers, 28K commercial relationships, 2,103 branches across 31 states. Deposits, lending, fraud,
AML, and commercial banking on Fivetran Open Data Infrastructure.

**Live**: https://fivetran-jasonchletsos.github.io/Banking-ODI-Demo/

## What this demo shows

Canonical flow:

```
[Source] → Fivetran → Iceberg (MDLS) → Snowflake / Athena / Trino → dbt Labs → React
```

- Fivetran lands every CDC row into Iceberg (MDLS) on S3 in open Apache Iceberg format — one copy
  of the bytes.
- Snowflake, Athena, and Trino read the same Iceberg bytes via external catalogs (no copies, no
  extracts).
- Fivetran Transformations triggers dbt Labs the moment the source sync finishes; bronze → silver
  → gold stays in Iceberg.
- One source of truth for the fraud desk, the AML investigator queue, the credit-risk team, and
  the commercial relationship managers.

## Stack

- React 19, Vite, Tailwind v4
- Static SPA on GitHub Pages, hash-based routing for clean deploys
- All data is synthetic JSON in `northbay-app/frontend/public/data/`

## Local development

```bash
cd northbay-app/frontend
npm install
VITE_BASE=/ npm run dev
```

## Deploy

Push to `main`. The `.github/workflows/deploy.yml` action builds and deploys to GitHub Pages.

## Synthetic data

Every number on this site is invented. Vendor names referenced in the source list are real public
products used generically, or invented (the AML vendor is intentionally generic).
