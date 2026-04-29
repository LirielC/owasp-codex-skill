# Security Review Report Template

Use this structure for final answers unless the user requests a different format.

## Findings

List confirmed findings first, ordered by severity.

For each finding:

```markdown
### [Severity] Short Title

- OWASP: Axx:YYYY Category
- Evidence: `path/to/file.ext:line`
- Affected flow: concise description of the entry point, trust boundary, and sink/security decision
- Impact: what an attacker can do and under what role/conditions
- Exploit scenario: concrete, minimal scenario showing why the issue is reachable
- Remediation: specific code/config/design change
- Confidence: High/Medium/Low, with the reason if not High
```

## Coverage

Summarize what was reviewed:
- Entry points and routes/controllers.
- Auth/authz paths.
- Input-to-sink paths.
- Config/deployment/dependencies.
- Tests or commands run.

## No Finding Areas

Mention only meaningful checks that reduce uncertainty, such as "admin routes use shared policy middleware and representative routes were traced."

## Residual Risk

State what was not verified:
- Runtime secrets/configuration.
- Infrastructure policies.
- Dynamic behavior not covered by tests.
- Dependency advisories unavailable because dependencies were not installed or network access was not available.
