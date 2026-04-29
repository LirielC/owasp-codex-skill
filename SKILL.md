---
name: owasp-codex-skill
description: Perform application security reviews of codebases, pull requests, APIs, configuration, and dependency changes using the OWASP Top 10 as the review frame. Use when Codex is asked to audit code for security bugs, perform secure code review, identify OWASP Top 10 risks, review authentication/authorization/input handling/secrets/dependencies/configuration/logging, or produce a security findings report with evidence and remediation guidance.
---

# OWASP Codex Skill

## Overview

Use this skill to run a practical secure code review aligned to OWASP Top 10:2025. Treat OWASP as the taxonomy, not as a checklist substitute for reading the code path end to end.

## Review Workflow

1. Establish scope before judging risk:
   - Identify the app type, framework, trust boundaries, exposed entry points, auth model, data stores, external services, and deployment surface.
   - Inspect routing/controllers, middleware, authorization helpers, serializers/deserializers, ORM/query code, file upload/download paths, background jobs, config, dependency manifests, and CI/deploy files.
   - Prefer `rg`/native project tooling for discovery and use existing tests to understand intended behavior.

2. Trace security-sensitive flows:
   - Authentication: login, session/token issuance, password reset, MFA, API keys, service-to-service auth.
   - Authorization: object ownership, role/permission checks, tenant isolation, admin routes, direct object references.
   - Input to sink: request params/body/headers, webhooks, queues, file metadata, templates, SQL/NoSQL/LDAP/OS commands, SSRF-capable HTTP clients, path/file APIs.
   - Secrets and crypto: key storage, encryption mode, password hashing, TLS assumptions, randomness, token lifetime.
   - Supply chain and integrity: dependency manifests, lockfiles, build scripts, dynamic imports, update/download paths, plugin loading.
   - Logging and alerting: audit events, sensitive-data leakage, missing security events, exception handling.

3. Map observations to OWASP:
   - Read `references/owasp-top-10-review-map.md` when you need category-specific prompts, common code smells, and remediation cues.
   - Use the current OWASP Top 10:2025 categories by default. If the user or organization requires OWASP Top 10:2021, say so explicitly and map findings to that version.

4. Verify before reporting:
   - Do not report generic best practices without a concrete affected path, source location, and exploit or failure scenario.
   - Distinguish confirmed issues from plausible risks that need runtime validation.
   - Check for existing compensating controls in middleware, framework config, validators, policies, database constraints, infrastructure, and tests.
   - Avoid destructive testing. Do not exploit live systems, exfiltrate secrets, brute force credentials, or run intrusive scanners unless the user explicitly authorizes that scope.

5. Report findings in a security-review format:
   - Lead with findings ordered by severity.
   - Include file/line references, affected flow, OWASP category, exploit scenario, impact, remediation, and confidence.
   - Include "No finding" areas only when useful to show meaningful coverage.
   - Read `references/report-template.md` for the preferred report structure.

## Severity Guidance

- Critical: Remote unauthenticated compromise, broad tenant/user data access, credential/session takeover, supply-chain execution, or direct production secret exposure.
- High: Authenticated privilege escalation, IDOR across users/tenants, injection with meaningful data/control impact, weak auth reset/session design, SSRF to sensitive internal resources.
- Medium: Security control bypass with constraints, sensitive information disclosure, unsafe defaults limited by deployment context, missing auditability for important actions.
- Low: Hardening gaps, defense-in-depth improvements, low-impact leakage, incomplete validation where downstream controls prevent exploitability.

State assumptions when severity depends on deployment, data sensitivity, attacker role, or missing runtime context.

## Review Heuristics

- Prefer exploitability over pattern matching. A dangerous API is not automatically a vulnerability if inputs are controlled and authorization is enforced.
- Look for missing central controls before flagging every endpoint. If a shared middleware enforces authz, verify its coverage and bypass paths.
- Follow serialization boundaries. Mass assignment, hidden fields, over-posting, and unsafe deserialization often appear outside obvious controller logic.
- Treat dependency findings as actionable only when the vulnerable package is present in the runtime path or the upgrade is still important for policy compliance.
- When reviewing a diff, inspect enough surrounding code to understand whether the change introduces, removes, or exposes a security boundary.

## Output Requirements

Use concise, evidence-backed findings. Do not inflate issue counts with duplicates; group repeated instances by root cause and list representative locations.

When no issues are found, say that clearly and list the review scope plus residual risks, such as untested runtime configuration, missing threat model, or dependencies not installed.

## References

- `references/owasp-top-10-review-map.md`: category prompts and code-review checks for OWASP Top 10:2025.
- `references/report-template.md`: reusable output format for security review reports.
