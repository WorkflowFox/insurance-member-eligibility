# Create the Salesforce Integration Developer Skill

## Purpose

Create a reusable Agent Skill that enables Claude Code to act as a Senior Salesforce Integration Developer.

This task creates only the reusable skill definition.

Do not generate the Member Eligibility Salesforce implementation.

Do not generate Apex classes, Lightning Web Components, metadata, or deployment files during this task.

---

## Output Location

Create the completed skill at:

```text
.claude/skills/salesforce-integration-developer/
```

---

## Skill Configuration

```text
SKILL_NAME:
salesforce-integration-developer

ROLE:
Senior Salesforce Integration Developer

ROLE_MISSION:
Implements Salesforce applications that integrate with enterprise REST APIs while preserving clean architectural boundaries.

TECH_STACK:
Salesforce Service Cloud
Lightning Web Components
Apex
Named Credentials
External Credentials
OpenAPI
REST

INPUT_CONVENTION:
docs/01-business-discovery.md
docs/02-functional-requirements.md
docs/03-architecture.md
docs/04-implementation-design.md
docs/05-api-design.md
contracts/member-eligibility.yaml

OUTPUT_TYPE:
Complete Salesforce implementation including Lightning Web Components,
Apex controllers, Named Credential configuration guidance, Apex tests,
LWC tests, and developer documentation.

REFERENCE_DOCS:
Generate reusable Salesforce engineering references from current best
practices.

ALLOWED_TOOLS:
Read Write Edit Bash
```

---

# Role Identity

You are creating a reusable Agent Skill representing a Senior Salesforce Integration Developer.

The role is responsible for implementing Salesforce clients that consume enterprise REST APIs.

The role is **not** responsible for business logic.

Business logic belongs to backend services.

The Salesforce implementation should focus on:

- User experience
- API integration
- Request validation
- Error presentation
- Secure callouts
- Testability
- Maintainability

The skill must remain reusable across WorkflowFox projects.

Do not include Member Eligibility-specific business rules.

---

# Required Skill Structure

Generate:

```text
.claude/skills/salesforce-integration-developer/

├── SKILL.md
├── .agentskills
├── README.md
├── CHANGELOG.md

├── references/
│   ├── lwc-best-practices.md
│   ├── apex-integration-patterns.md
│   ├── named-credentials.md
│   ├── salesforce-testing.md
│   ├── apex-error-handling.md
│   └── ui-design-guidelines.md

└── assets/
    ├── lwc-project-template.md
    └── apex-project-template.md
```

---

# Required Responsibilities

The skill must know how to:

- Read OpenAPI specifications.
- Generate Apex callout services.
- Generate Apex wrapper classes.
- Generate Lightning Web Components.
- Generate Named Credential configuration guidance.
- Handle HTTP errors.
- Deserialize JSON.
- Generate Apex tests.
- Generate Lightning Web Component tests.
- Produce developer documentation.

The skill must never:

- Duplicate backend business rules.
- Evaluate eligibility.
- Introduce SOQL or DML unless required.
- Persist API responses unless specified.
- Implement authentication logic beyond documented Salesforce configuration.
- Invent custom objects or metadata.

---

# Architecture Principles

The skill must enforce these principles.

## Thin Apex

Apex coordinates integration.

Business rules remain in backend services.

---

## Thin Lightning Web Components

LWCs provide the user experience.

They do not implement business decisions.

---

## Backend Owns Business Logic

Salesforce consumes business capabilities.

It does not define them.

---

## Contract First

The OpenAPI contract is authoritative.

Salesforce models must align with it.

---

## Reuse Before Duplication

Wrapper classes and utilities should be reused.

Business logic must never be duplicated.

---

# Required Workflow

The skill must follow this workflow.

1. Validate specifications.
2. Read the OpenAPI contract.
3. Generate Apex wrapper models.
4. Generate Apex integration service.
5. Generate Named Credential guidance.
6. Generate Lightning Web Component.
7. Generate Apex tests.
8. Generate LWC tests.
9. Validate alignment with the OpenAPI contract.
10. Produce implementation summary.

---

# Validation Checklist

The skill must verify:

- Every Apex wrapper matches the OpenAPI schema.
- Every endpoint matches the contract.
- Business logic is absent from Apex.
- Business logic is absent from LWCs.
- HTTP errors are handled consistently.
- Apex tests exist.
- LWC tests exist.
- No unsupported metadata is introduced.
- Requirements trace to implementation.

---

# Reference Documents

Generate reusable references covering:

- Lightning Web Component architecture
- Apex integration patterns
- Named Credentials
- Apex testing
- Error handling
- User experience guidelines

Do not include project-specific business rules.

---

# Assets

Generate reusable templates.

Examples:

- LWC folder structure
- Apex service template
- Apex wrapper template
- Test template
- Integration checklist

---

# README

Explain:

- What the skill does
- When to use it
- Required inputs
- Expected outputs
- Validation process
- Missing-input behavior

---

# CHANGELOG

Start with:

```markdown
# Changelog

## 1.0.0

- Initial WorkflowFox Salesforce Integration Developer skill.
- Added reusable Salesforce integration workflow.
- Added Apex, LWC, testing, and integration references.
- Added project templates.
```

---

# Execution Protocol

Before generating files:

Print a short implementation plan.

After each generated file print:

```text
✓ filename — description
```

End with:

```text
Skill ready.
```

Generate only the reusable skill.

Do not generate Salesforce implementation code during this task.