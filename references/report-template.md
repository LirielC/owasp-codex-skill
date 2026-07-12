# Security Review Report Template

Use this structure unless the user requests another format.

## Executive summary

State the reviewed revision, scope, assessment type, and counts by status/severity. Never state that the target is secure or vulnerability-free.

## Findings

List confirmed findings first, ordered by severity and exploitability. Group duplicates by root cause.

```markdown
### SEC-001 — [Severity] Short title

- Status: Confirmed | Needs validation
- OWASP: Axx:2025 Category
- CWE: CWE-nnn (only when the mapping is defensible)
- Confidence: High | Medium | Low
- Evidence: `path/to/file.ext:line` and a concise, redacted code/config fact
- Affected component: component and entry point
- Data flow: attacker-controlled source -> transformations/controls -> sensitive sink/decision
- Preconditions: attacker role, deployment assumptions, and required state
- Impact: concrete confidentiality, integrity, or availability outcome
- Reproduction: safe, minimal local validation steps; no weaponized payloads by default
- Remediation: root-cause fix plus a regression-test invariant
- References: primary standard/advisory links only
```

Use CVSS only when the user needs it and the deployment facts are known. Include the vector, version, and assumptions; never copy a scanner score blindly.

## Dismissed candidates

Summarize meaningful false positives and compensating controls. Do not list every scanner match.

## Coverage and methodology

- Revision/commit and directories reviewed.
- Entry points, auth/authz, input-to-sink paths, configuration, dependencies, and failure paths reviewed.
- Tests and scanners run, including versions and sanitized command class.
- Tool failures, skipped tools, exclusions, and reason.

## Residual risk

State unverified runtime configuration, infrastructure, external services, business invariants, dynamic behavior, and dependency reachability.

## Quality gate

Before delivery, verify:

- Every reported issue has a location, reachable scenario, impact, and specific fix.
- Secret values and sensitive personal data are redacted.
- Scanner candidates are not presented as confirmed without manual validation.
- Severity reflects actual preconditions and compensating controls.
- Duplicate symptoms are grouped by root cause.
- Clean scans and tool failures are described accurately.
