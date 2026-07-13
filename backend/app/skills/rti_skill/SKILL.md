---
id: rti_skill
name: RTI Application Filing
description: Enables citizens to file Right to Information (RTI) applications to obtain official records from government authorities.
triggers:
  - rti
  - right to information
  - rti application
  - file rti
  - public information officer
  - pio
  - government records
positive_examples:
  - "How to file an RTI to get road repair budget?"
  - "Format of RTI for checking exam copy marks."
  - "Where to submit an RTI application?"
negative_examples:
  - "Notice for cheque bounce received."
  - "How to apply for bail?"
---

# RTI Application Filing

## Description
Enables citizens to file Right to Information (RTI) applications to obtain official records from government authorities.

## Trigger Keywords & Triggers
The skill triggers when the query contains words like: rti, right to information, rti application, file rti, public information officer, pio, government records.

### Positive Examples
  - "How to file an RTI to get road repair budget?"
  - "Format of RTI for checking exam copy marks."
  - "Where to submit an RTI application?"

### Negative Examples
  - "Notice for cheque bounce received."
  - "How to apply for bail?"

## Workflow Steps
1. Identify the public authority holding the information (e.g., Municipal Corp, Board of Education).
2. Draft concise, clear questions focusing on records, documents, and logs rather than opinions.
3. Address the application to the Public Information Officer (PIO) of that department.
4. Attach the prescribed fee (usually Rs. 10 via postal order, stamp, or online payment).
5. If no response in 30 days, file the First Appeal under Section 19(1) of the RTI Act.

## Risk Detection Logic
Check for: Vague or hypothetical questions (PIO can reject), personal/private third-party information (exempt under Sec 8(1)(j)), and national security exemptions.

## Output Format
Provide: PIO address tips, fee guidelines, draft RTI questions template, and First Appeal format.

## References Structure
- Right to Information Act, 2005 - Section 6 (Filing)
- Right to Information Act, 2005 - Section 8 (Exemptions)
- RTI Act - Section 19 (Appeals)

## Assets Structure
- Standard RTI Application format
- First Appeal petition template
- Fee payment instructions card
