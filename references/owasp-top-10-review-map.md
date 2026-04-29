# OWASP Top 10 Review Map

Source baseline: OWASP Top 10:2025, current release page at https://owasp.org/Top10/2025/.

Use this as a review prompt map. A finding still needs code evidence, an affected path, impact, and remediation.

## A01:2025 Broken Access Control

Look for missing or inconsistent authorization checks, IDOR/BOLA, tenant boundary bypass, role confusion, admin route exposure, path traversal, CORS overexposure, and unsafe direct file/object access.

Review targets:
- Route/controller guards and middleware ordering.
- Object ownership checks before read/update/delete/export actions.
- Multi-tenant filters in queries and background jobs.
- Client-controlled role, tenant, owner, price, status, or approval fields.
- File download/upload paths and static file exposure.

Remediation cues: enforce server-side authorization at every boundary, centralize policy checks, deny by default, add tenant/owner constraints at query level, and test cross-user/cross-tenant access.

## A02:2025 Security Misconfiguration

Look for insecure defaults, verbose errors, debug mode, permissive CORS, weak headers, exposed admin/dev endpoints, default credentials, unsafe cloud/storage policies, and unprotected management interfaces.

Review targets:
- Environment-specific config, Docker/Kubernetes/IaC, reverse proxy config, framework security settings.
- CORS, CSP, HSTS, cookie attributes, CSRF settings.
- Error handlers and stack traces.
- Public buckets, public admin panels, metrics, health checks, actuator/debug endpoints.

Remediation cues: harden production defaults, separate dev/prod config, fail closed, restrict admin surfaces, set secure headers/cookies, and codify config checks in CI.

## A03:2025 Software Supply Chain Failures

Look for vulnerable/outdated dependencies, unpinned packages, insecure build scripts, dependency confusion risk, untrusted CI actions, unsigned downloads, plugin loading, and generated artifacts committed from unknown sources.

Review targets:
- Package manifests, lockfiles, Docker base images, CI workflows, install/build scripts.
- Dynamic download-and-execute patterns.
- Package source configuration and private registry use.
- Third-party scripts loaded in web pages.

Remediation cues: pin and lock dependencies, use trusted registries, verify checksums/signatures, minimize CI secrets, review transitive risk, generate SBOMs, and patch or remove vulnerable packages.

## A04:2025 Cryptographic Failures

Look for plaintext secrets/data, weak password hashing, custom crypto, weak randomness, broken token signing, missing TLS validation, hardcoded keys, long-lived tokens, and sensitive data in logs or URLs.

Review targets:
- Password storage, token generation/validation, encryption helpers, key management, TLS client options.
- Sensitive data models and serialization.
- Logging, analytics, URLs, browser storage, backups.

Remediation cues: use vetted libraries, strong password hashing, authenticated encryption, secure random sources, short token lifetime with rotation, secret managers, and data minimization.

## A05:2025 Injection

Look for SQL/NoSQL/LDAP/command/template/header/path injection, unsafe expression evaluation, unsafe deserialization inputs, and query builders bypassed by string concatenation.

Review targets:
- Input-to-sink paths from requests, webhooks, queues, files, and admin tools.
- ORM raw queries, shell commands, template rendering, dynamic code/eval, regex construction, and search/filter DSLs.
- Sanitization that happens after interpretation or only on the client.

Remediation cues: use parameterized APIs, allowlists, safe encoders, structured parsers, sandboxing where needed, and tests proving malicious input remains data.

## A06:2025 Insecure Design

Look for missing threat modeling outcomes, business logic bypass, rate-limit gaps, unsafe workflows, weak approval/authorization design, race conditions, insecure recovery, and missing abuse-case controls.

Review targets:
- Password reset, invite, payment, approval, refund, coupon, quota, and privilege-change flows.
- State transitions and optimistic concurrency.
- Rate limits, replay prevention, idempotency, and anti-automation controls.

Remediation cues: define abuse cases, enforce state machines server-side, add rate limits and replay protection, require step-up auth for sensitive actions, and add security invariants to tests.

## A07:2025 Authentication Failures

Look for weak credential handling, session fixation, missing MFA where required, broken reset flows, token replay, insecure cookies, predictable credentials, insufficient lockout/rate limiting, and auth bypass through alternate routes.

Review targets:
- Login, logout, registration, reset, email/phone verification, SSO/OAuth/OIDC, API keys, refresh tokens.
- Session cookie flags, token storage, revocation, rotation, expiry, audience/issuer validation.
- Auth middleware exclusions and public route lists.

Remediation cues: use proven auth libraries, verify token claims strictly, rotate/revoke sessions, secure cookies, protect reset flows, and rate-limit credential endpoints.

## A08:2025 Software or Data Integrity Failures

Look for unsafe deserialization, insecure update mechanisms, unsigned webhooks, trust in client-side state, tamperable JWT/session data, unsafe feature flags, and missing integrity checks for imports/exports.

Review targets:
- Deserializers, JWT/session handling, webhook verification, update/download code, migration/import tools, cache trust boundaries.
- Client-controlled hidden fields, local storage, signed URLs, and feature gates.

Remediation cues: verify signatures, use integrity-protected formats, avoid unsafe deserializers, validate webhook timestamps and signatures, and keep authority server-side.

## A09:2025 Security Logging and Alerting Failures

Look for missing audit events, no alerting for authz/authn failures, sensitive data in logs, unstructured security logs, swallowed exceptions, and no correlation IDs for incident response.

Review targets:
- Login failures, password resets, privilege changes, admin actions, payment/security setting changes, data exports, webhook failures.
- Error handlers and background job failure handling.
- Log redaction and retention.

Remediation cues: log security-relevant events with context, redact secrets/PII, add alerts for suspicious patterns, preserve correlation IDs, and test audit coverage.

## A10:2025 Mishandling of Exceptional Conditions

Look for fail-open error handling, exception paths that skip authz/validation/cleanup, partial transaction commits, retry loops causing duplicate side effects, leaked stack traces, and inconsistent state after failures.

Review targets:
- `catch`/`except` blocks, fallback paths, retries, queue workers, payment/order flows, file processing, transactions, cleanup handlers.
- Circuit breakers, timeouts, and error mapping to HTTP responses.

Remediation cues: fail closed for security decisions, use transactions/idempotency, avoid swallowing exceptions, return generic errors to users, log actionable details internally, and test failure paths.

## Legacy 2021 Mapping

If the requested standard is OWASP Top 10:2021, use this high-level mapping:

- 2025 A01 Broken Access Control -> 2021 A01 Broken Access Control.
- 2025 A02 Security Misconfiguration -> 2021 A05 Security Misconfiguration.
- 2025 A03 Software Supply Chain Failures -> 2021 A06 Vulnerable and Outdated Components plus 2021 A08 Software and Data Integrity Failures.
- 2025 A04 Cryptographic Failures -> 2021 A02 Cryptographic Failures.
- 2025 A05 Injection -> 2021 A03 Injection.
- 2025 A06 Insecure Design -> 2021 A04 Insecure Design.
- 2025 A07 Authentication Failures -> 2021 A07 Identification and Authentication Failures.
- 2025 A08 Software or Data Integrity Failures -> 2021 A08 Software and Data Integrity Failures.
- 2025 A09 Security Logging and Alerting Failures -> 2021 A09 Security Logging and Monitoring Failures.
- 2025 A10 Mishandling of Exceptional Conditions -> document separately or map to the most relevant 2021 category based on root cause.
