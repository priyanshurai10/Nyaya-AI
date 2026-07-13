---
id: property_registration_skill
name: Property Registration & Stamp Duty
description: Guides users on stamp duty calculation, registration of sale deeds, gift deeds, wills, and mutation of property records.
triggers:
  - property registration
  - stamp duty
  - sale deed
  - gift deed
  - will registration
  - sub-registrar
  - registry
  - property mutation
positive_examples:
  - "How much is the stamp duty for a sale deed in Uttar Pradesh?"
  - "How to register a gift deed?"
  - "Steps for mutation of flat in Delhi."
negative_examples:
  - "Fired from company without notice."
  - "Applying for anticipatory bail."
---

# Property Registration & Stamp Duty

## Description
Guides users on stamp duty calculation, registration of sale deeds, gift deeds, wills, and mutation of property records.

## Trigger Keywords & Triggers
The skill triggers when the query contains words like: property registration, stamp duty, sale deed, gift deed, will registration, sub-registrar, registry, property mutation.

### Positive Examples
  - "How much is the stamp duty for a sale deed in Uttar Pradesh?"
  - "How to register a gift deed?"
  - "Steps for mutation of flat in Delhi."

### Negative Examples
  - "Fired from company without notice."
  - "Applying for anticipatory bail."

## Workflow Steps
1. Obtain the circle rates for the specific locality from municipal/state registration portal.
2. Calculate property value based on area, and compute required Stamp Duty (typically 4-8%) and Registration Fees (typically 1%).
3. Buy e-stamp papers and draft the Sale/Gift Deed containing clear title declarations.
4. Book an appointment online at the Sub-Registrar office.
5. Attend the office with two witnesses, complete biometric authentication, and collect the registered deed copy.
6. File for Mutation (Namantaran) in land revenue records to update municipal ownership.

## Risk Detection Logic
Check for: Under-valuation of property (constitutes tax evasion and leads to penalty), lack of encumbrance clearance, and delay in property mutation.

## Output Format
Provide: Circle rate calculation, stamp duty checklist, registration day guide, and draft sale deed format.

## References Structure
- Indian Stamp Act, 1899
- Registration Act, 1908
- State Land Revenue Acts

## Assets Structure
- Standard Sale Deed draft template
- Standard Gift Deed draft template
- Will draft template
