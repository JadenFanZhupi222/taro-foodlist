# Production Rollout Safety Design

## Goal

Make the database-hardening release safe to run against the production CloudBase environment, remove the two retired unauthenticated functions, and add local checks that catch packaging and audit regressions before deployment.

## Chosen approach

Use a manually triggered GitHub Actions workflow protected by the GitHub `production` Environment. Ordinary branch pushes continue to run normal tests and builds, but never mutate production data or deploy production functions.

Alternatives considered:

- Keep the feature-branch push trigger and add path or commit-message conditions. This remains easy to trigger accidentally and is rejected.
- Trigger automatically after merge to `master`. This is acceptable for routine application deployment, but not for a one-time workflow that backs up, repairs, and migrates production data.

## Workflow design

The database-hardening workflow will expose `workflow_dispatch` only and require an explicit confirmation input. The production job will declare `environment: production`, allowing repository owners to configure required reviewers and environment-scoped secrets in GitHub.

Before any remote mutation, the workflow will:

1. Check out the selected commit and install pinned deployment tooling.
2. Validate that every function scheduled for deployment can install its declared dependencies and load its entry module in a clean environment.
3. Back up and audit production data, then upload the encrypted backup.
4. Quarantine active orphan relations and verify the database again.
5. Provision transaction-lock collections and run the existing transaction smoke checks.
6. Deploy the eight hardened functions with rollback to the verified release on failure.
7. Delete the retired `get-user-info` and `reorder-daily-menu` functions explicitly, treating deletion failure as a failed rollout.

The workflow will print the target CloudBase environment, selected commit, and rollback commit before deployment without printing secrets.

## Code and packaging corrections

`create-family` and `join-family` will declare `@cloudbase/node-sdk`, matching what their entry modules import. A repository test will inspect all functions selected by the rollout and fail when an entry module imports an undeclared package.

The database audit will consider only active (`deleted !== true`) recipe relations when detecting duplicate active relationships. Orphan reporting will retain deleted-state information, while only active orphans can block rollout or enter quarantine.

The H5 output configuration will use keys supported by the current Taro/Vite configuration type. Third-party declaration conflicts are outside this release; the project-owned configuration error will be removed and the existing production build remains the primary compile gate.

## Testing

Changes will follow test-first development:

- A workflow source test will fail while push triggers, missing production environment protection, missing confirmation, or missing retired-function deletion remain.
- A packaging test will fail while rollout functions import undeclared runtime packages.
- Audit tests will cover active duplicates, soft-deleted duplicates, and active orphan handling.
- Existing backend and UI suites, `git diff --check`, and the WeChat production build must pass before the branch is considered ready.

Because CloudBase production credentials are unavailable locally, actual deletion and deployment are verified by the protected manual workflow rather than executed during development.

## Scope boundaries

This change does not run the production workflow, create GitHub Environment settings, commit the local WeChat base-library version bump, or redesign all transaction cloud functions. GitHub Environment reviewers and secrets must be configured in repository settings before the first manual rollout.
