# Security review evaluation fixtures

These synthetic cases exercise the report contract without containing real secrets or weaponized payloads. Each case is JSON so automated or human forward tests can compare expected classifications without prescribing exact prose.

- `confirmed.json`: reachable IDOR, parameterized-query false positive, and synthetic secret redaction.
- `clean.json`: effective centralized authorization and no expected confirmed finding.

An evaluation passes when the reviewer identifies the expected root cause and evidence class, does not promote dismissed controls to findings, redacts synthetic secret values, and states residual scope limitations. Exact wording and severity may vary with explicitly stated assumptions.
