# Generate the Member Eligibility Deployment Diagram

## Purpose

Create the deployment architecture for the validated WorkflowFox Member Eligibility reference implementation.

This is the final architecture diagram.

The deployment diagram must represent only the implemented Version 1 solution.

Do not invent future infrastructure.

Do not redesign the architecture.

Do not modify application code.

---

## Inputs

Read

- showcase/architecture/01-system-context.md
- showcase/architecture/02-container-diagram.md
- showcase/architecture/03-sequence-diagram.md
- docs/03-architecture.md
- docs/06-end-to-end-architecture.md
- engineering-journal/03-fastapi-generation.md
- engineering-journal/04-salesforce-generation.md
- engineering-journal/06-salesforce-ui-polish.md
- README.md

---

## Output

Create

showcase/architecture/04-deployment-diagram.md

---

## Audience

Enterprise Architects

Infrastructure Architects

Solution Architects

Engineering Managers

---

## Goal

Show where every runtime component executes.

Represent only the validated deployment.

The deployment should clearly distinguish:

Salesforce Platform

Developer Machine

Runtime Communication

---

## Runtime Environment

Represent three deployment boundaries.

### Salesforce Cloud

Contains

- Provider Relations Application
- Lightning Web Component
- Apex Controller
- Apex Integration Service
- Named Credential

---

### Internet

Contains

HTTPS Communication

Do not represent Cloudflare Tunnel.

Treat the communication simply as HTTPS.

---

### Developer Machine

Contains

FastAPI

Eligibility Service

Synthetic Member Repository

Synthetic Coverage Repository

JSON Data

Swagger

---

## Flow

Representative

↓

Salesforce

↓

HTTPS

↓

FastAPI

↓

Eligibility Service

↓

Repositories

↓

JSON Data

↓

Response

↓

Salesforce

↓

Representative

---

## Exclude

Do NOT include

Cloudflare Tunnel

Docker

Kubernetes

Terraform

AWS

Azure

Redis

Kafka

Databases

Monitoring

Authentication

Future deployment

Anything not implemented in Version 1

---

## Required Document Structure

# Deployment Diagram

## Purpose

## Runtime Environment

## Mermaid Diagram

## Deployment Responsibilities

## Deployment Assumptions

## Version 1 Scope

## Future Evolution

## Key Takeaway

---

## Mermaid

Use flowchart.

Group runtime components into

Salesforce Cloud

Internet

Developer Machine

Keep the diagram simple.

Readable on GitHub.

---

## Deployment Responsibilities

Provide

| Runtime | Responsibility |

Include every deployment boundary.

---

## Future Evolution

Clearly separate future work.

Examples

Production Cloud Deployment

Authentication

Managed Database

Observability

Container Platform

These should NOT appear in the deployment diagram.

Only mention them here.

---

## Engineering Journal

Create

engineering-journal/11-deployment-diagram.md

Document

Purpose

Deployment decisions

What was intentionally excluded

Assumptions

Lessons learned

Validation

---

## Validation

Before finishing

Verify Mermaid renders.

Verify every runtime component exists.

Verify deployment reflects the validated implementation.

Verify no future infrastructure appears.

Verify Cloudflare Tunnel is excluded.

Begin with a concise implementation plan.