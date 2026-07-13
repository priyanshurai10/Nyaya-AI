# Advocates Specification

## Feature Description
The Advocate Discovery module allows users to search, filter, and review profiles of verified legal professionals practicing within their state, filtered dynamically by location and specializations.

## User Flow
1. **Search Query**:
   - User inputs legal topic or practice area (e.g. "Property Dispute", "Cyber Crime") and clicks search.
2. **State & Geolocation Filter**:
   - The query resolves the user's active state.
   - Advocates practicing outside the user's state are filtered out.
3. **Practice Area Match**:
   - Query filters advocates by matching tags or specialties.
4. **List & Booking Options**:
   - Matches are returned sorted by nearest distance.
   - User selects an advocate to view fees, languages spoken, and schedule appointments.

## Business Rules
- **State Isolation**: Never list advocates from other states. A user geocoded to Delhi should not see advocates practicing exclusively in Maharashtra or Bihar.
- **Practice Area Coverage**: Dynamically seeded advocates must cover all core practice areas (e.g., Property, Family, Consumer, Labour, Cyber) to avoid blank search results.
- **High-Risk Action Protection**: Advocate bookings require explicit user manual confirmation (never auto-schedule or auto-pay).

## Validation Rules
- Advocate database entries must contain verified barcodes or Bar Council registration details.
- Search queries must filter out injection scripts before querying the database.

## Error Handling
- **No Matching Advocates**: Display a clean notice: *"No advocates matching your criteria found in [State Name]. Please broaden your practice area filters."*
- **Offline Mode**: If search fails, show: *"Advocate data directory is temporarily unavailable. Please try again."*

## Database Requirements
- Table: `advocates`
  - `id`: String (Primary Key)
  - `name`: String
  - `bar_registration_number`: String
  - `state`: String
  - `practice_areas`: JSON/String
  - `experience_years`: Integer
  - `rating`: Float
  - `languages_spoken`: String
  - `consultation_fee`: Integer
  - `latitude`: Float
  - `longitude`: Float

## API Requirements
- `POST /api/v1/advocates/search`: Resolves user state and filters active advocates matching practice area tags.
- `GET /api/v1/advocates/profile/{adv_id}`: Retrieves comprehensive bio, reviews, and availability schedule.

## Edge Cases
- **No Coordinates**: If user has not detected location, fallback to the default state specified in user profile preferences.
- **Multi-State Practice**: Advocates registered in multiple states must be matched if any of their active states align with the user.

## Acceptance Criteria
- [x] Search matches are isolated strictly to the user's current geolocated state.
- [x] Seed data contains valid practice areas matching test requirements.

---

## BDD Test Cases

### Advocate Search Filtering Scenario
```gherkin
Given user coordinates are geocoded to Delhi (28.6915, 77.1724)
And user searches for "Property Lawyer"
When the search engine executes the query
Then it should filter out all advocates belonging to Maharashtra and Bihar
And return advocates located in Delhi speaking local languages (English, Hindi)
And sort results by distance
```

### Unrepresented State Search Scenario
```gherkin
Given user coordinates are in an unseeded state (e.g. Goa)
When user searches for advocates
Then the system should trigger a state-specific database seed
And return newly registered local advocates matching Goa coordinate offsets
```
