
@router.get("/hierarchy/courts")
def get_court_hierarchy():
    return [
        {
            "id": "sc",
            "level": "Apex Court",
            "name": "Supreme Court of India",
            "description": "The highest judicial court and the final court of appeal under the Constitution of India.",
            "jurisdiction": "Original, Appellate & Advisory",
            "location": "New Delhi"
        },
        {
            "id": "hc",
            "level": "State Level",
            "name": "High Courts",
            "description": "The principal civil courts of original jurisdiction in each state and union territory.",
            "jurisdiction": "State-wide Appellate & Writ",
            "location": "State Capitals"
        },
        {
            "id": "dc",
            "level": "District Level",
            "name": "District & Sessions Courts",
            "description": "Deals with civil and criminal matters at the district level across India.",
            "jurisdiction": "District-wide Original",
            "location": "All Districts"
        },
        {
            "id": "sub",
            "level": "Subordinate",
            "name": "Subordinate Courts (Munsif / Magistrate)",
            "description": "Lower courts dealing with civil and criminal cases of lower valuation and lesser offences.",
            "jurisdiction": "Taluka/Tehsil Level",
            "location": "Local Jurisdictions"
        }
    ]
