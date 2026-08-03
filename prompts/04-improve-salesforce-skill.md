# Improve the Salesforce Integration Developer Skill

Use the `salesforce-integration-developer` skill.

Read:

- `.claude/skills/salesforce-integration-developer/SKILL.md`
- all files under `.claude/skills/salesforce-integration-developer/references/`
- all files under `.claude/skills/salesforce-integration-developer/assets/`
- `engineering-journal/04-salesforce-generation.md`

## Task

Improve the reusable Salesforce Integration Developer skill using only
the reusable lessons captured during the Member Eligibility generation.

Do not modify the Member Eligibility Salesforce implementation.

Do not add Member Eligibility-specific fields, classes, business rules,
or endpoint details to the reusable skill.

Update the skill to include these reusable controls and lessons:

1. Execution modes:
   - Metadata Only
   - Connected Validation
   - Deployment

2. Default behavior:
   - Metadata Only
   - Never authenticate, connect, deploy, retrieve, or modify an org
     unless the invocation explicitly authorizes Connected Validation
     or Deployment mode.

3. Connected-mode safety:
   - Require an explicit authorized org alias.
   - Pass `--target-org` or `-o` on every Salesforce CLI command.
   - Never rely on the default org.
   - Never target another authenticated org.

4. Salesforce source structure:
   - Apex classes must remain directly under the metadata `classes/`
     directory.
   - Do not create unsupported nested Apex directories.

5. LWC Jest handling:
   - Exclude `__tests__` from metadata deployment using `.forceignore`.
   - Document potential ESM/CommonJS resolution issues involving
     `sfdx-lwc-jest` and `@lwc/engine-dom`.
   - Prefer explicit validation comparisons such as
     `reportValidity() === false` when base-component Jest stubs can
     return `undefined`.

6. Named Credentials:
   - Document the `No Authentication` option when the contract defines
     no authentication scheme.
   - Never invent OAuth, JWT, API keys, External Credential principals,
     or security metadata.

7. Local tooling:
   - Warn against running Node/Jest workloads inside actively
     synchronized cloud-storage directories when file-I/O hangs occur.
   - Recommend a local non-synchronized workspace for validation.

8. Validation evidence:
   - Distinguish static review, local tests, org compilation, org tests,
     and deployment.
   - Never describe one validation type as another.

9. Engineering journal:
   - Require every project invocation to create or update an engineering
     journal containing generated files, decisions, actual validation
     evidence, defects found, corrections, assumptions, and reusable
     lessons.

Update the skill version from `1.0.0` to `1.1.0`.

Update `CHANGELOG.md`.

Keep `SKILL.md` under 500 lines and move detailed guidance into the
appropriate reference files.

Before editing, present a concise plan.

After editing:

- list every file changed,
- explain why it changed,
- verify that the skill remains project-independent,
- report any validation performed.

Do not modify files outside:

`.claude/skills/salesforce-integration-developer/`