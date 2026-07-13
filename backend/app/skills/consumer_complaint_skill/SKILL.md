---
id: consumer_complaint_skill
name: Consumer Rights & Complaints
description: Guides citizens on filing complaints against defective goods or deficient services before the Consumer Forum.
triggers:
  - consumer complaint
  - consumer forum
  - consumer court
  - defective product
  - refund deny
  - unfair trade
  - e-daakhil
  - shopkeeper fraud
positive_examples:
  - "Amazon delivered a broken phone and is refusing refund."
  - "How to file a case in the District Consumer Commission?"
  - "Airline canceled my ticket and won't compensate."
negative_examples:
  - "My relative is arrested by the police."
  - "I need an employment contract format."
---

# Consumer Rights & Complaints

## Description
Guides citizens on filing complaints against defective goods or deficient services before the Consumer Forum.

## Trigger Keywords & Triggers
The skill triggers when the query contains words like: consumer complaint, consumer forum, consumer court, defective product, refund deny, unfair trade, e-daakhil, shopkeeper fraud.

### Positive Examples
  - "Amazon delivered a broken phone and is refusing refund."
  - "How to file a case in the District Consumer Commission?"
  - "Airline canceled my ticket and won't compensate."

### Negative Examples
  - "My relative is arrested by the police."
  - "I need an employment contract format."

## Workflow Steps
1. Identify if the user is a 'Consumer' under the Act (purchased goods/services for personal use).
2. Draft a formal grievance letter to the seller/merchant giving 15 days to resolve.
3. If unresolved, determine jurisdiction (District: up to ₹50 Lakh, State: ₹50 Lakh - ₹2 Crore).
4. Register on the e-Daakhil portal (edaakhil.nic.in).
5. Draft the petition explaining the deficiency, attach proof (bill, emails, photographs), and file.

## Risk Detection Logic
Check for: Commercial use exclusion, limitation period (must file within 2 years of cause of action), and lack of purchase bill or invoice.

## Output Format
Provide: Legal rights summary, draft pre-litigation notice, and e-Daakhil filing checklist.

## References Structure
- Consumer Protection Act, 2019 - Section 2(7) (Definition)
- Consumer Protection Act, 2019 - Section 34 (Jurisdiction)
- Limitation Act - Section 69

## Assets Structure
- Pre-litigation Notice to Seller
- Consumer Court Petition template
- e-Daakhil user guide checklist
