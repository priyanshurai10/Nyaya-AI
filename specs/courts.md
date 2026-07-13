# Courts Specification

## Feature Description
The Court Discovery feature allows citizens to locate the nearest judicial forums matching their resolved geolocation parameters. It dynamically computes haversine distances and groups results into search tiers, listing Lower, Civil, District, Sessions, Family, Consumer, Labour, High Courts, and the Supreme Court of India.

## User Flow
1. **Location Triggers**:
   - Location is detected or entered.
2. **Database Proximity Search**:
   - Backend queries courts within the resolved state.
3. **Haversine Distance Sorting**:
   - Backend calculates distance between user lat/lon and each court.
4. **Tiers Categorization**:
   - Level 1 (0-50 km), Level 2 (50-100 km), Level 3 (100-200 km), Level 4 (State-wide).
5. **Interactive Mapping**:
   - Coordinates are plotted as pins on the Google Maps UI. Clicking a court displays details, presiding judge logs, and directional routes.

## Business Rules
- **Zero Static Mock Courts**: Remove all hardcoded dummy courts. If the database has no records for the user's state, seed them dynamically using reverse-geocoded location coordinates.
- **Judge Search Integrity**: When a court card is selected, the frontend must fire a query to dynamically load the active Presiding Judge details rather than displaying static placeholders.

## Validation Rules
- Supported court types: `lower`, `civil`, `district`, `sessions`, `family`, `consumer`, `labour`, `high`, `supreme`.
- Calculated distances must be floating-point numbers in kilometers.

## Error Handling
- **No Nearby Courts Found**: If no courts exist within 200 km, list the state's High Court (Level 4 state fallback) and the Supreme Court of India (National fallback).
- **API Disconnected**: Display: *"Court discovery service is currently offline. Showing local bookmarks."*

## Database Requirements
- Table: `courts`
  - `id`: String (Primary Key)
  - `name`: String
  - `court_type`: String
  - `address`: String
  - `latitude`: Float
  - `longitude`: Float
  - `state`: String
  - `district`: String
  - `pincode`: String
  - `working_hours`: String
  - `contact_number`: String
  - `website`: String
  - `judge_info`: String
  - `jurisdiction`: Text
  - `image_url`: String
- Table: `judges`
  - `id`: String (Primary Key)
  - `name`: String
  - `photo_url`: String
  - `court_id`: String (ForeignKey)
  - `designation`: String
  - `bio`: Text

## API Requirements
- `POST /api/v1/navigation/courts/search`: Accepts coordinate payload, returns nearest categorized courts.
- `POST /api/v1/navigation/courts/seed`: Populates missing default courts safely.
- `POST /api/v1/navigation/judges/search`: Fetches active judge profile for a specified court.

## Edge Cases
- **State Borders**: A user in Noida (UP) must see East Delhi District courts if they fall within Level 1 distance (haversine sorting is agnostic of state lines for levels 1-3, and enforces state boundary filters only at Level 4).

## Acceptance Criteria
- [x] No hardcoded Delhi courts are rendered for a user in Pune or Bihar.
- [x] Map markers and Sidebar detail cards are synchronized instantly.

---

## BDD Test Cases

### Court Discovery Proximity Scenario
```gherkin
Given user coordinates are set to Bhabua, Bihar (25.0470, 83.6145)
When the court discovery engine processes proximity matching
Then Bhabua District Court should be categorized under Level 1 (0-50 km)
And Patna High Court should be categorized under Level 3 or 4 (State-wide)
And Supreme Court of India should be displayed as the national fallback
```

### No Nearby Courts Scenario
```gherkin
Given user is in a remote location with no courts within 100 km
When proximity search is executed
Then the system should fall back to Level 4 (State-wide)
And list the state's official High Court
```
