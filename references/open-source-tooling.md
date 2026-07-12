# Open-Source Tooling Policy

Use scanners only as supporting evidence. Confirm findings by tracing source, trust boundary, control, and sink.

## Safety gate

Before execution:

1. Confirm the executable is already installed and capture its version.
2. Inspect project-local scanner configuration before trusting it; configuration may invoke plugins, hooks, remote registries, or remote rules.
3. Ask for approval if the command needs network access, downloads a database/ruleset, reads Git history, scans outside the repository, or may expose code/results.
4. Write results inside a user-approved output directory that is excluded from commits. Never print detected secret values.
5. Use argument arrays or direct process invocation; never concatenate repository data into a shell command.

## Allowlisted tools

| Tool | Purpose | License | Default network posture | Notes |
|---|---|---|---|---|
| OpenGrep | SAST | LGPL-2.1 | Local with local rules | Use only pinned, reviewed, open-source local rules. Never use a remote rules URL implicitly. |
| Gitleaks | Secret detection | MIT | Local | Prefer working-tree scan. Git-history scanning needs explicit scope because it is slower and can surface deleted secrets. Redact secret material. |
| OSV-Scanner | Dependency vulnerabilities/licenses | Apache-2.0 | Network by default | Ask before querying OSV/deps.dev. Offline mode is acceptable when its local database is already present. |
| Trivy | Dependencies, secrets, misconfiguration, IaC | Apache-2.0 | May download databases | Pin scanners and databases in CI. Ask before downloads. Disable unused scanners. |
| Checkov | IaC and CI configuration | Apache-2.0 | Local analysis; integrations may use network | Do not enable platform upload/API integrations. |
| Syft | SBOM generation | Apache-2.0 | Local for directories | Generate SPDX or CycloneDX locally; remote image targets may use registries and credentials. |

Licenses apply to the tools, not necessarily their rule packs, databases, container images, or transitive dependencies. Verify those artifacts independently before redistributing or embedding them.

## Selection

- Application source: manual trace plus OpenGrep when reviewed local rules exist.
- Secrets: Gitleaks; report only fingerprint/rule/path/line and remediation/rotation steps.
- Lockfiles/manifests: OSV-Scanner. Confirm the affected version is reachable or deployed before assigning application severity.
- Terraform, Kubernetes, Docker, CI: Checkov or Trivy misconfiguration scanning, not both unless comparison is useful.
- Inventory or release evidence: Syft SBOM, then scan the SBOM with one vulnerability engine.

Do not run every tool by default. Avoid duplicate findings by grouping on root cause and affected component.

## Evidence lifecycle

Classify every candidate as:

- `confirmed`: reachable path and missing/ineffective control verified in code or configuration.
- `needs-validation`: plausible, but runtime/deployment/ownership information is missing.
- `dismissed`: false positive, unreachable code, test fixture, effective compensating control, or non-deployed dependency.
- `tool-error`: incomplete or invalid scan; record as a coverage limitation.

Capture tool version and sanitized invocation, but do not paste large raw reports into the final response.
