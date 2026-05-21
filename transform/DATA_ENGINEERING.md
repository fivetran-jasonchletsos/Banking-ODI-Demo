# Northbay dbt project

The transform layer is a dbt project that materializes everything as Apache Iceberg tables on S3
through the dbt-glue adapter. Snowflake reads the gold layer as external Iceberg tables.

## Layers

| Layer  | Purpose                                                                  | Models | Tests |
| ------ | ------------------------------------------------------------------------ | ------ | ----- |
| bronze | 1:1 with Fivetran landing, no transforms                                 | 84     | 142   |
| silver | Conformed banking dimensions: customer_360, account_360, transaction_unified | 42 | 198   |
| gold   | Business-ready marts the agents and dashboards read                      | 28     | 124   |
| marts  | Regulatory and finance-team reports (CCAR, CECL, capital planning)       | 14     | 68    |

## Key gold marts

- `gold.fct_fraud_signal` — per-transaction fraud score with ring membership and merchant risk.
- `gold.fct_aml_alert_score` — vendor alerts joined with unified transactions and KYC.
- `gold.fct_credit_decision` — auto-decision and manual-review outcomes with fairness metrics.
- `gold.fct_deposit_beta` — per-tier deposit beta and NII sensitivity inputs.
- `gold.fct_loan_portfolio` — credit-quality buckets, NCL trend, watchlist segments.
- `gold.fct_commercial_relationship_revenue` — top-20 commercial relationship ranking.

## Tests

Every silver and gold model has at least:
- `not_null` on every primary key column.
- `unique` on every business key.
- `relationships` test where a foreign key exists.
- `accepted_values` on every categorical column.

Regulatory marts also have row-count reconciliation tests against the system of record.

## Freshness

Each gold model exposes a `_freshness_seconds` column derived from the worst upstream Fivetran sync.
Agents and dashboards must read freshness before they decide; downstream consumers can degrade
gracefully when a connector is stale.
