# Security and privacy

Life Compass is a local-first application. HealthKit / Health Connect access is
read-only, camera preview is not saved, and the application does not provide a
cloud sync service. These statements describe the current implementation and
are not a promise of medical, legal, or security advice.

## Do not publish sensitive material

Never commit or attach any of the following:

- API keys, passwords, access tokens, private keys, cookies, or credentials
- populated `.env` files or connection strings
- health data, device data, local databases, or user backup files
- AI Memory, private notes, local machine paths, or other unpublished context

When reporting a bug, replace personal or health-related values with synthetic
examples and include only the smallest reproducible context.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting or security advisory flow
for this repository when it is available. Do not disclose an exploitable issue
or sensitive evidence in a public issue. If private reporting is unavailable,
open a minimal issue that asks the maintainer to enable a private channel and
does not include exploit details or private data.
