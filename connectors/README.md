# Northbay connectors

Each Northbay source lands in Apache Iceberg on S3 through a Fivetran connector.

| Source                                       | Type                  | Cadence       | Bronze prefix                                |
| -------------------------------------------- | --------------------- | ------------- | -------------------------------------------- |
| FIS Horizon (core banking)                   | Oracle CDC            | Near real-time | `s3://northbay-odi-lake/bronze/fis_horizon/` |
| Salesforce Financial Services Cloud          | API                   | 5 min          | `s3://northbay-odi-lake/bronze/sfdc/`        |
| nCino (commercial loan origination)          | API                   | 5 min          | `s3://northbay-odi-lake/bronze/ncino/`       |
| Plaid (data aggregation)                     | API                   | Real-time webhook + 15 min reconcile | `s3://northbay-odi-lake/bronze/plaid/` |
| AML Monitoring Vendor                        | SQL Server CDC        | 5 min          | `s3://northbay-odi-lake/bronze/aml/`         |
| Visa and Mastercard merchant feeds           | SFTP                  | Hourly         | `s3://northbay-odi-lake/bronze/visa_mc/`     |
| OFAC and FinCEN watchlists                   | HTTP feed             | Hourly         | `s3://northbay-odi-lake/bronze/ofac_fincen/` |
| Branch teller logs                           | S3 file drop          | 15 min         | `s3://northbay-odi-lake/bronze/branch_ops/`  |

## Catalog

All bronze tables are registered in the AWS Glue Data Catalog as Apache Iceberg v2 tables. Table-level
access control is mapped to Northbay LDAP groups. Every read is logged for examiner audit.

## Schema evolution

Schema changes at the source are picked up automatically by Fivetran and added as new columns on the
Iceberg bronze tables. dbt silver models declare the columns they require; new columns become available
to the gold and mart layers on the next build.

## Synthetic data

All connectors and table contents in this demo are synthetic. The vendor names are real public products
referenced generically, or invented for the demo (the AML vendor is intentionally generic).
