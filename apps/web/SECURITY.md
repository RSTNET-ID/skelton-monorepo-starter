# Security Policy

## Reporting a vulnerability

Do not publish exploitable security details in a public issue.

Use the repository's GitHub Security interface and private vulnerability reporting when available. If private reporting is unavailable, contact the repository maintainers through the RSTNET-ID organization before disclosing details publicly.

Include:

- affected commit/version
- impact
- reproduction steps or proof of concept
- relevant configuration
- suggested mitigation, if known

## Scope

Security-sensitive areas include CSP and response headers, environment separation, API transport helpers, authentication guidance, Docker runtime permissions, dependency supply chain, and proxy trust configuration.

Downstream applications must still perform their own threat modeling. This repository supplies a baseline; it cannot know the authorization model, tenant boundaries, data sensitivity, or deployment topology of every project created from it.
