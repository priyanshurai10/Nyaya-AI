# Location Specification

## Feature Description
The Location Engine provides universal geolocation resolution (via GPS or Manual Inputs like Pincode, City, District, and State), synchronizes location changes across pages, and acts as the location driver for finding nearby courts, advocates, legal aid clinics, consumer forums, and police stations across India.

## User Flow
1. **Detection Request**:
   - User triggers GPS detection on the interface or manually enters details (e.g. Pincode or City/District).
2. **Geocode Resolution**:
   - Coordinates (lat/lon) are resolved via Nominatim or pincode database index.
   - Hierarchy (State, District, City, Pincode) is parsed and saved.
3. **Session Update & Broadcast**:
   - Coordinates are stored in local storage (`nyaya_lat`, `nyaya_lon`).
   - A custom window event `nyaya_location_changed` is broadcasted.
4. **Reactive Seeding & Filtering**:
   - All modules (Courts, Advocates, Legal Aid) intercept the change and refresh directories automatically.

## Business Rules
- System must never depend on fixed hardcoded cities (e.g. fallback lists for Delhi/Mumbai/Kolkata).
- If Nominatim geocoding fails, fallback coordinates must be calculated based on geographical estimations (`estimate_state_from_coords`) rather than static regional lists.
- Seeding of local courts/advocates must happen at the **District** level to ensure unique local listings.

## Validation Rules
- **Coordinates**: Latitude must be between `8.0` and `37.6` and Longitude between `68.1` and `97.2` (enclosing geographical borders of India).
- **Pincodes**: Must be a 6-digit numeric string matching valid Indian postal codes.

## Error Handling
- **GPS Denied**: Show a descriptive warning box instructing the user to enter details manually.
- **Pincode Lookup Failure**: Return a clean `404 Not Found` with "Invalid pincode" if it cannot be resolved.

## Database Requirements
- Table: `courts` (for proximity queries)
- Table: `users` (location columns)
- Table: `advocates` (requires state isolation mapping)

## API Requirements
- `POST /api/v1/navigation/pincode-search`: Translates pincode to coordinate details.
- `POST /api/v1/navigation/reverse-geocode`: Translates coordinates to address hierarchy.
- `POST /api/v1/navigation/courts/search`: Searches courts by haversine distance.

## Edge Cases
- **Offline / Sandbox**: Nominatim call fails -> fall back to state bounding-box estimations.
- **Boundary Crossings**: Pincode indicates a border district -> return courts sorted by concentric distances crossing state boundaries if they fall inside search Level thresholds.

## Acceptance Criteria
- [x] GPS permissions denials are captured gracefully.
- [x] All 5 location targets (Courts, Advocates, Legal Aid, Consumer Forums, Police Stations) update reactively when coordinates change.
- [x] No static Delhi fallback records exist in search output.

---

## BDD Test Cases

### Pincode Location Resolution Scenario
```gherkin
Given user enters a valid pincode "411001"
When location validation succeeds
Then nearby courts, advocates, and landmarks should be resolved
And results should be sorted by haversine distance
And the system should identify the location level tier (e.g. Level 1)
```

### GPS Location Detection Scenario
```gherkin
Given user chooses GPS location detection
When browser returns coordinates (18.5204, 73.8567)
Then the system geocodes coordinates to Pune, Maharashtra
And stores the latitude and longitude in localStorage
And fires a global "nyaya_location_changed" update event
```
