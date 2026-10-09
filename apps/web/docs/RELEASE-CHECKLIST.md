# Release readiness: v1.0.0

The skeleton remains at v0.1.0 until the checklist is satisfied. Do not tag a release solely because CI is green.

## Stage 1: API/security hardening

- [x] Shared API client supports opt-in runtime decoders over unknown response payloads.
- [x] Upload origin allowlist and CMS example permission checks are present.
- [ ] Validate authentication, CSRF, redirects, tenancy and MinIO policy with a real Bun API.
- [ ] Review dependency audit, container security and threat model in the deployment environment.

## Stage 2: Interaction and accessibility

- [x] Unit tests cover valid and invalid API decoding.
- [ ] Test DataTable race/cancellation, SelectAjax edit resolution, keyboard Tabs, modal focus trap and FileUpload cancellation in a browser.
- [ ] Run a keyboard-only and screen-reader pass.

## Stage 3: Developer experience

- [x] `bun run make:module users` produces a typed API module scaffold without adding dependencies.
- [ ] Validate generated modules against a real backend and document CMS page conventions.

## Stage 4: Release

- [ ] Verify `bun run ci` and Playwright on the final source.
- [ ] Ensure ID/EN translations cover all existing gallery/CMS copy and error states.
- [ ] Validate production Docker image and example environment files.
- [ ] Finish changelog and release notes; tag v1.0.0 only after explicit acceptance.

Do not interpret checklist items as certification or production authorization.
