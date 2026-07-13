---
id: court_notice_skill
name: Court Notice & Summons Reply
description: Assists users who have received official summons or notices from civil or criminal courts to file a proper legal reply.
triggers:
  - court notice
  - summons
  - civil summons
  - criminal summons
  - appear in court
  - ex-parte
  - negotiable instruments
  - subpoena
positive_examples:
  - "I got a summons from the magistrate court for cheque bounce."
  - "What if I don't appear in court after receiving notice?"
  - "Notice for civil recovery suit appearance."
negative_examples:
  - "My UPI payment got hacked."
  - "Where to submit an RTI?"
---

# Court Notice & Summons Reply

## Description
Assists users who have received official summons or notices from civil or criminal courts to file a proper legal reply.

## Trigger Keywords & Triggers
The skill triggers when the query contains words like: court notice, summons, civil summons, criminal summons, appear in court, ex-parte, negotiable instruments, subpoena.

### Positive Examples
  - "I got a summons from the magistrate court for cheque bounce."
  - "What if I don't appear in court after receiving notice?"
  - "Notice for civil recovery suit appearance."

### Negative Examples
  - "My UPI payment got hacked."
  - "Where to submit an RTI?"

## Workflow Steps
1. Examine the summons stamp, case number, court name, and signature for validity.
2. Identify the date, time, and specific bench you must appear before.
3. Gather all evidence contesting the claims of the petition.
4. Hire an advocate or prepare to represent yourself (party-in-person).
5. Draft and file a Written Statement (Civil) or Reply Affidavit (Criminal) on the date of hearing.

## Risk Detection Logic
Check for: Inaction (leads to ex-parte decree / arrest warrant), tight timelines (usually 30 days for Written Statement), and jurisdiction discrepancies.

## Output Format
Provide: Summary of court guidelines, case details sheet, ex-parte protection warning, and Written Statement draft template.

## References Structure
- Code of Civil Procedure, 1908 - Order VIII (Written Statement)
- Section 138 Negotiable Instruments Act
- BNSS, 2023 - Section 64 (Service of Summons)

## Assets Structure
- Written Statement template
- Vakalatnama format
- Adjournment petition format
