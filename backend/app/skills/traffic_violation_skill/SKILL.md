---
id: traffic_violation_skill
name: Traffic Violations & Challan
description: Guides citizens on paying traffic challans, handling license suspensions, and contesting illegal traffic fines.
triggers:
  - traffic violation
  - challan
  - traffic fine
  - license suspend
  - speeding ticket
  - drunken driving
  - traffic police
positive_examples:
  - "I got an online speed challan from Delhi Traffic Police."
  - "How to challenge an incorrect traffic fine?"
  - "License suspended for red light jumping, what to do?"
negative_examples:
  - "How to get anticipatory bail?"
  - "RTI filing fee."
---

# Traffic Violations & Challan

## Description
Guides citizens on paying traffic challans, handling license suspensions, and contesting illegal traffic fines.

## Trigger Keywords & Triggers
The skill triggers when the query contains words like: traffic violation, challan, traffic fine, license suspend, speeding ticket, drunken driving, traffic police.

### Positive Examples
  - "I got an online speed challan from Delhi Traffic Police."
  - "How to challenge an incorrect traffic fine?"
  - "License suspended for red light jumping, what to do?"

### Negative Examples
  - "How to get anticipatory bail?"
  - "RTI filing fee."

## Workflow Steps
1. Fetch challan details using registration number on the Parivahan e-Challan website (echallan.parivahan.gov.in).
2. Verify the date, time, vehicle photo, and section under Motor Vehicles Act.
3. If correct: Pay the fine online or attend Virtual Traffic Court to pay reduced fine.
4. If incorrect or disputed: Refuse online payment and let it be sent to physical Traffic Court to contest before magistrate.
5. For license suspensions: File representation at the regional RTO.

## Risk Detection Logic
Check for: Defaulting payment (leads to court summons or vehicle block in registry), compoundable vs non-compoundable offences (drunken driving requires court appearance).

## Output Format
Provide: MV Act sections, online payment steps, contestation template, and Virtual Court guide.

## References Structure
- Motor Vehicles Act, 1988 (Amended 2019)
- Section 185 MV Act - Drunken driving
- Section 112 MV Act - Overspeeding

## Assets Structure
- Contestation letter template to Traffic ACP
-  RTO representation format for license release
