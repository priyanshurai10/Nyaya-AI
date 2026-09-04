
@router.get("/guides")
def get_guides(category: str = "property"):
    guides_db = {
        "property": {
            "title": "Property Title & Boundary Dispute",
            "start_court": "Local Revenue / Sub-Registrar Office",
            "first_instance": "Civil Court Junior Division",
            "timeline": "Revenue survey: 1-2 months. Civil lawsuit trial: 3-5 years.",
            "documents": ["Registered Sale Deed", "Mutation Certificate", "Land Revenue receipts", "Survey Map report"],
            "hierarchy": [
                {"step": 1, "name": "Request Land Survey", "desc": "File an application before the Tehsildar to measure and survey the boundaries of your land plot."},
                {"step": 2, "name": "Sub-Registrar Office", "desc": "Collect certified mutation deeds and land records to prove ownership."},
                {"step": 3, "name": "Civil Court Junior Division", "desc": "File a suit for declaration of title, boundary verification, and permanent injunction."}
            ]
        },
        "family": {
            "title": "Family & Matrimonial Dispute",
            "start_court": "District Family Court Mediation Desk",
            "first_instance": "District Family Court",
            "timeline": "Mutual Divorce: 6 months (cooling period). Contested: 18-36 months.",
            "documents": ["Marriage Certificate", "Photographs", "Joint Petition", "Asset & Income affidavits", "Separation Proof"],
            "hierarchy": [
                {"step": 1, "name": "Consultation & Mediation", "desc": "Evaluate mutual separation bounds. Attempt mediation before filing."},
                {"step": 2, "name": "Family Court Mediation", "desc": "Approach the family court counselor department to seek an amicable settlement."},
                {"step": 3, "name": "Family Court Petition", "desc": "File the petition in the Family Court."}
            ]
        }
    }
    
    # Fallback to general dispute if not found
    return guides_db.get(category, {
        "title": "General Legal Dispute Resolution",
        "start_court": "District Legal Services Authority (DLSA)",
        "first_instance": "Civil Jurisdiction / Magistrate Court",
        "timeline": "Depends on case complexity: Civil disputes range 2-4 years.",
        "documents": ["ID proofs", "Communications (emails/SMS)", "Written statements", "Agreements or receipts"],
        "hierarchy": [
            {"step": 1, "name": "Consultation & Notice Serving", "desc": "Document interactions and serve a legal warning notice."},
            {"step": 2, "name": "Legal Aid / DLSA", "desc": "Seek free legal aid counseling if you cannot afford a private lawyer."},
            {"step": 3, "name": "Magistrate Court", "desc": "Initiate proceedings in the competent territorial court of first instance."}
        ]
    })
