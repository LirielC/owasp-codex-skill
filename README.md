# OWASP Codex Skill

A reusable Codex skill for application security reviews based on the OWASP Top 10.

This skill helps Codex review codebases, pull requests, APIs, configuration, and dependency changes with a practical secure-code-review workflow. It uses the OWASP Top 10 as the review taxonomy while still requiring concrete code evidence, affected flows, impact, and remediation guidance for every finding.

## What This Skill Does

`owasp-codex-skill` guides Codex through security reviews focused on:

- Authentication and session handling
- Authorization, access control, IDOR, BOLA, and tenant isolation
- Input handling and injection risks
- Cryptographic failures and secret handling
- Security misconfiguration
- Supply chain and dependency risks
- Software and data integrity failures
- Logging, alerting, and audit gaps
- Failure-path and exceptional-condition handling
- Insecure design and business logic weaknesses

The skill is designed for code review. It does not run intrusive tests, exploit live systems, brute force credentials, exfiltrate secrets, or perform active scanning unless a user explicitly authorizes that work in a separate task.

## OWASP Version

The default review frame is OWASP Top 10:2025.

The skill also includes a high-level mapping for OWASP Top 10:2021 so reviewers can adapt findings when a project, client, or organization still requires the 2021 taxonomy.

Official OWASP Top 10 project:

https://owasp.org/www-project-top-ten/

OWASP Top 10:2025 release page:

https://owasp.org/Top10/2025/

## Repository Structure

```text
owasp-codex-skill/
├── SKILL.md
├── agents/
│   └── openai.yaml
└── references/
    ├── owasp-top-10-review-map.md
    └── report-template.md
```

### `SKILL.md`

The main Codex skill file. It contains the trigger metadata and the core review workflow:

- Establish review scope
- Trace security-sensitive flows
- Map observations to OWASP categories
- Verify issues before reporting
- Report findings with evidence and remediation

### `agents/openai.yaml`

UI-facing metadata for environments that display skill names, descriptions, and default prompts.

### `references/owasp-top-10-review-map.md`

A compact review map for OWASP Top 10:2025 categories, including:

- What to look for
- Relevant code areas
- Common review targets
- Remediation cues
- Legacy OWASP Top 10:2021 mapping

### `references/report-template.md`

A reusable security review report structure for final output, including:

- Findings ordered by severity
- OWASP category
- Evidence
- Affected flow
- Impact
- Exploit scenario
- Remediation
- Confidence
- Coverage and residual risk

## Installation

Install the skill by cloning this repository into your Codex skills directory.

```bash
mkdir -p ~/.codex/skills
git clone https://github.com/LirielC/owasp-codex-skill.git ~/.codex/skills/owasp-codex-skill
```

If you use a custom `CODEX_HOME`, install it under that location instead:

```bash
mkdir -p "$CODEX_HOME/skills"
git clone https://github.com/LirielC/owasp-codex-skill.git "$CODEX_HOME/skills/owasp-codex-skill"
```

After installation, restart or reload your Codex session if your environment does not automatically discover newly added skills.

## Usage

Ask Codex to use the skill explicitly:

```text
Use $owasp-codex-skill to review this codebase for OWASP Top 10 security risks.
```

Other useful prompts:

```text
Use $owasp-codex-skill to review this pull request for authentication, authorization, and injection risks.
```

```text
Use $owasp-codex-skill to audit the API routes and produce a security findings report with severity, evidence, and remediation.
```

```text
Use $owasp-codex-skill to review this service against OWASP Top 10:2021 instead of 2025.
```

## Expected Output

The skill is designed to produce concise, evidence-backed findings. A typical finding should include:

- Severity
- OWASP category
- File and line evidence
- Affected flow
- Impact
- Exploit scenario
- Remediation
- Confidence level

If no confirmed issues are found, Codex should state that clearly and include the review scope plus residual risks.

## Review Philosophy

This skill prioritizes exploitability over pattern matching.

A dangerous API, framework setting, or dependency is not automatically a vulnerability. A valid finding should explain how attacker-controlled input, missing authorization, unsafe configuration, or another concrete condition reaches a security-sensitive outcome.

The skill also encourages checking for compensating controls before reporting an issue, including:

- Shared middleware
- Authorization policies
- Framework-level validation
- Database constraints
- Infrastructure restrictions
- Existing tests

## Severity Model

The skill uses a pragmatic severity model:

- Critical: unauthenticated remote compromise, broad data exposure, credential or session takeover, supply-chain execution, or production secret exposure
- High: privilege escalation, cross-user or cross-tenant access, meaningful injection impact, weak reset or session design, or SSRF to sensitive internal resources
- Medium: constrained security bypass, limited sensitive information disclosure, unsafe defaults, or missing auditability for important actions
- Low: hardening gaps, defense-in-depth improvements, low-impact leakage, or incomplete validation with effective downstream controls

Severity should be adjusted based on deployment context, attacker role, data sensitivity, and available runtime evidence.

## Scope and Limitations

This skill is not a replacement for:

- A full penetration test
- Dynamic application security testing
- Manual threat modeling with system owners
- Production infrastructure review
- Dependency advisory tooling
- Legal or compliance advice

It is a reusable review workflow for Codex. The quality of results depends on repository access, runtime context, available configuration, test coverage, and the specificity of the user request.

## Development

Validate the skill structure with the Codex skill validator:

```bash
python3 /home/arch/.codex/skills/.system/skill-creator/scripts/quick_validate.py /path/to/owasp-codex-skill
```

For this repository, from the same machine where it was created:

```bash
python3 /home/arch/.codex/skills/.system/skill-creator/scripts/quick_validate.py /home/arch/owasp-codex-skill
```

## Contributing

Contributions should keep the skill focused, reusable, and concise.

Good contributions include:

- Better OWASP category review prompts
- Clearer remediation guidance
- Improved report structure
- More accurate mappings between OWASP versions
- Reduced ambiguity in the review workflow

Avoid adding broad documentation that Codex does not need while performing a review. The skill should remain compact enough to load quickly and specific enough to guide useful security analysis.

## License

No license has been added yet. Add one before distributing or accepting external contributions if you want explicit reuse terms.
