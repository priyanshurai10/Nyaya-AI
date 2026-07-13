---
id: rent_agreement_skill
name: Rent Agreement Analysis
description: Reviews rent agreements and leases, identifies unfavorable clauses, and assesses tenant security deposits.
triggers:
  - rent agreement
  - lease
  - tenant agreement
  - security deposit
  - kirayanama
  - lease deed
  - rent clause
positive_examples:
  - "Check my rent agreement for hidden charges."
  - "Is a 3-month security deposit standard in Delhi?"
  - "What happens if my lease agreement is not registered?"
negative_examples:
  - "My wife has filed for divorce."
  - "How to apply for an online passport?"
---

# Rent Agreement Analysis

## Description
Reviews rent agreements and leases, identifies unfavorable clauses, and assesses tenant security deposits.

## Trigger Keywords & Triggers
The skill triggers when the query contains words like: rent agreement, lease, tenant agreement, security deposit, kirayanama, lease deed, rent clause.

### Positive Examples
  - "Check my rent agreement for hidden charges."
  - "Is a 3-month security deposit standard in Delhi?"
  - "What happens if my lease agreement is not registered?"

### Negative Examples
  - "My wife has filed for divorce."
  - "How to apply for an online passport?"

## Workflow Steps
1. Identify parties (Lessor/Landlord and Lessee/Tenant) and property details.
2. Verify rent amount, payment due dates, and escalation clauses.
3. Check security deposit amount and refund terms.
4. Identify eviction triggers, notice periods, and lock-in duration.
5. Advise on registration (mandatory for leases exceeding 11 months under Registration Act, 1908).

## Risk Detection Logic
Check for: High security deposit (above state standard), lack of eviction notice period, high late-payment interest, and unregistered lease exceeding 11 months.

## Output Format
Provide: Summary of lease terms, risk score (0-100), flagged clauses list, and negotiation guidelines.

## References Structure
- Section 107 Transfer of Property Act - Registration requirement
- Model Tenancy Act, 2021 - Security deposit cap
- State Rent Control Acts

## Assets Structure
- Standard Rent Agreement template
- Security Deposit Demand template
- Termination Notice template
