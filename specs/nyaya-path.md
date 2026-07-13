# Nyaya Path Specification

## Feature Description
Nyaya Path is a dynamic procedural guide generator that breaks down complex legal situations (such as Property disputes, Consumer disputes, Cyber fraud, Employment issues, and Family disputes) into structured, step-by-step resolution pathways with details on required documents, police reporting procedures, court filing processes, and estimated timelines.

## User Flow
1. **Category Selection**:
   - User clicks on "Nyaya Path" in the dashboard.
   - User selects their specific issue category (e.g., Cyber Crime, Consumer Negligence).
2. **Context Intake**:
   - User answers basic questions about their location, amount in dispute, and timeline of events.
3. **Pathway Generation**:
   - The engine generates a sequential timeline path.
   - System displays Level 1 (Local action), Level 2 (Filing), Level 3 (Trial) recommendations.
4. **Actionable Links**:
   - The guide embeds links to nearby courts, consumer forums, police stations, or online filing portals (e.g., e-Daakhil for Consumer, National Cyber Crime Portal).

## Business Rules
- **No Mock Directories**: The path must use the user's geolocated coordinates to resolve and recommend active local bodies (e.g., recommend the specific local DLSA center, local police station, or district consumer forum resolved by the location engine).
- **Clarity and Citations**: Actions must cite relevant legislation (e.g., Section 66D of Information Technology Act for online impersonation) rather than generic guidance.

## Validation Rules
- Intake inputs must reject HTML and script injections.
- Calculated timelines must be presented as ranges (e.g. "3 - 6 Months").

## Error Handling
- **Missing Location**: If user coordinates are not resolved, show: *"Please set your location to receive local police station and consumer forum filing addresses."*
- **Unknown Category**: If user types an unsupported scenario, fall back to a general civil or criminal pathway guide structure.

## Database Requirements
- Table: `saved_cases` (tracks cases created from paths)
- Table: `courts` (linked for filing venues)

## API Requirements
- `POST /api/v1/cases/generate-path`: Generates a custom step-by-step route map based on category and resolved user coordinates.

## Edge Cases
- **High Financial Disputes**: If a consumer dispute value exceeds ₹50 Lakhs, the pathway must dynamically recommend routing to the State Commission instead of the District Commission (Consumer Protection Act 2019 rules).

## Acceptance Criteria
- [x] Timelines and statutory citations match current Indian legal frameworks.
- [x] Steps display contact numbers and geolocations of the nearest resolved filing forums.

---

## BDD Test Cases

### Path Generation Scenario
```gherkin
Given user coordinates are geocoded to Bhabua, Bihar (25.0470, 83.6145)
And user selects the "Cyber Crime" category
When the Nyaya Path engine generates the resolution guide
Then the first step should recommend filing a complaint at the resolved Bhabua Town Police Station
And include the exact helpline number "112"
And cite Section 66D of the IT Act
```

### High-Value Consumer Dispute Scenario
```gherkin
Given user coordinates are in Kochi, Kerala
And user selects "Consumer Disputes"
And enters a dispute value of ₹75,000,000 (7.5 Crores)
When the pathway is calculated
Then the filing recommendation step must direct the user to the State Disputes Redressal Commission
And display e-Daakhil portal links
```
