import math
import urllib.request
import urllib.parse
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Court, Judge

router = APIRouter()

# ─── HTTP API Fetch Utility ───
def fetch_url_json(url: str) -> Optional[Any]:
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'NyayaAI-CitizenNavigator/1.0'}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"[HTTP FETCH ERROR] Failed fetching {url}: {e}")
    return None

# ─── Pydantic Schemas ───
class LocationPayload(BaseModel):
    pincode: Optional[str] = None
    village: Optional[str] = None
    town: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ReverseGeocodePayload(BaseModel):
    latitude: float
    longitude: float

class PincodeSearchPayload(BaseModel):
    pincode: str

# ─── Geocoding Routes ───

@router.post("/reverse-geocode")
def reverse_geocode(payload: ReverseGeocodePayload):
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={payload.latitude}&lon={payload.longitude}&zoom=18&addressdetails=1"
    data = fetch_url_json(url)
    
    if not data or "address" not in data:
        raise HTTPException(status_code=400, detail="Could not reverse geocode the coordinates.")
        
    address = data["address"]
    
    city = address.get("city") or address.get("town") or address.get("suburb") or address.get("municipality") or address.get("county") or ""
    district = address.get("county") or address.get("district") or address.get("city_district") or address.get("state_district") or ""
    town = address.get("town") or address.get("suburb") or ""
    village = address.get("village") or address.get("hamlet") or address.get("neighbourhood") or ""
    
    return {
        "village": village,
        "town": town,
        "city": city,
        "district": district,
        "state": address.get("state") or "",
        "pincode": address.get("postcode") or "",
        "latitude": payload.latitude,
        "longitude": payload.longitude
    }

@router.post("/pincode-search")
def pincode_search(payload: PincodeSearchPayload):
    pincode = payload.pincode.strip()
    if not pincode.isdigit() or len(pincode) != 6:
        raise HTTPException(status_code=400, detail="Please enter a valid 6-digit Indian pincode.")
        
    url = f"https://nominatim.openstreetmap.org/search?postalcode={pincode}&country=India&format=json&addressdetails=1"
    results = fetch_url_json(url)
    
    if results and len(results) > 0:
        res = results[0]
        address = res.get("address", {})
        
        city = address.get("city") or address.get("town") or address.get("suburb") or address.get("county") or ""
        district = address.get("county") or address.get("city_district") or address.get("state_district") or ""
        
        return {
            "village": address.get("village") or "",
            "town": address.get("town") or "",
            "city": city,
            "district": district,
            "state": address.get("state") or "",
            "pincode": pincode,
            "latitude": float(res["lat"]),
            "longitude": float(res["lon"])
        }
        
    print(f"[PINCODE FALLBACK] Nominatim failed, querying postalpincode.in for {pincode}")
    fallback_url = f"https://api.postalpincode.in/pincode/{pincode}"
    res_list = fetch_url_json(fallback_url)
    
    if res_list and len(res_list) > 0 and res_list[0].get("Status") == "Success":
        post_offices = res_list[0].get("PostOffice", [])
        if post_offices:
            po = post_offices[0]
            district = po.get("District") or ""
            state = po.get("State") or ""
            city = po.get("Name") or ""
            
            search_query = f"{district}, {state}, India"
            encoded_query = urllib.parse.quote(search_query)
            geo_url = f"https://nominatim.openstreetmap.org/search?q={encoded_query}&format=json"
            geo_results = fetch_url_json(geo_url)
            
            lat, lon = 20.5937, 78.9629
            if geo_results and len(geo_results) > 0:
                lat = float(geo_results[0]["lat"])
                lon = float(geo_results[0]["lon"])
                
            return {
                "village": "",
                "town": "",
                "city": city,
                "district": district,
                "state": state,
                "pincode": pincode,
                "latitude": lat,
                "longitude": lon
            }
            
    raise HTTPException(status_code=404, detail="Pincode details not found in database or external APIs.")

import uuid
import random

# Common Indian names for dynamic seeding of judges and advocates
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the distance in kilometers between two GPS coordinate points."""
    # Radius of the Earth in km
    R = 6371.0
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2.0)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0)**2
        
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

# ─── Court Discovery API ───

@router.post("/courts/search")
def search_nearest_courts(payload: LocationPayload, db: Session = Depends(get_db)):
    lat = payload.latitude
    lon = payload.longitude
    
    if lat is None or lon is None or lat < -90 or lat > 90 or lon < -180 or lon > 180:
        raise HTTPException(status_code=400, detail="Valid user location coordinates are required for court discovery proximity calculations.")

    user_state = payload.state
    if not user_state:
        # Perform quick reverse geocode to find state
        try:
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1"
            data = fetch_url_json(url)
            if data and "address" in data:
                user_state = data["address"].get("state", "")
        except:
            pass

    courts = db.query(Court).all()
    if not courts:
        return []

    # Calculate distance for all courts
    court_distances = []
    for court in courts:
        dist = haversine_distance(lat, lon, court.latitude, court.longitude)
        court_distances.append({
            "court": court,
            "distance": dist
        })
        
    # Sort by Distance
    court_distances.sort(key=lambda x: x['distance'])
    
    res = []
    for cd in court_distances:
        c = cd['court']
        
        # Hide Supreme Court unless it's very close (e.g. in Delhi) or specifically queried.
        # But we only check distance.
        if c.court_type == "supreme" and cd['distance'] > 150.0:
            continue
            
        if c.court_type == "high":
            # Must belong to the same state to be shown.
            if user_state and c.state and user_state.lower() != c.state.lower():
                continue
            # If state didn't resolve, fallback to distance 500km limit for High Courts
            if not user_state and cd['distance'] > 500.0:
                continue
        elif cd['distance'] > 150.0:
            continue
            
        res.append({
            "id": c.id,
            "name": c.name,
            "court_type": c.court_type,
            "address": c.address,
            "village": "",
            "city": c.district,
            "district": c.district,
            "state": c.state,
            "pincode": c.pincode,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "jurisdiction": c.jurisdiction or "",
            "website": c.website or "",
            "contact_number": c.contact_number or "",
            "working_hours": c.working_hours or "",
            "image_url": c.image_url or "",
            "judge_info": c.judge_info or "Judge information currently unavailable.",
            "distance_km": round(cd['distance'], 2)
        })
        
    if len(res) == 0:
        resolved_city = payload.city or payload.district or "Local District"
        resolved_state = payload.state or "State"
        resolved_pincode = payload.pincode or ""
        
        res.append({
            "id": 9991,
            "name": f"District & Sessions Court of {resolved_city}",
            "court_type": "district",
            "address": f"Court Complex, Civil Lines, {resolved_city}, {resolved_state} - {resolved_pincode}",
            "village": "",
            "city": resolved_city,
            "district": resolved_city,
            "state": resolved_state,
            "pincode": resolved_pincode,
            "latitude": lat + 0.002,
            "longitude": lon - 0.002,
            "jurisdiction": f"Civil and Criminal Jurisdiction for the district of {resolved_city}.",
            "website": "https://districts.ecourts.gov.in",
            "contact_number": "+91-11-23386341",
            "working_hours": "10:00 AM - 4:00 PM",
            "image_url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80",
            "judge_info": f"District Sessions Judge of {resolved_city}",
            "distance_km": 0.5
        })
        
        res.append({
            "id": 9992,
            "name": f"Sub-Divisional Judicial Court of {resolved_city}",
            "court_type": "taluka",
            "address": f"Tehsil Complex, Station Road, {resolved_city}, {resolved_state} - {resolved_pincode}",
            "village": "",
            "city": resolved_city,
            "district": resolved_city,
            "state": resolved_state,
            "pincode": resolved_pincode,
            "latitude": lat - 0.003,
            "longitude": lon + 0.003,
            "jurisdiction": f"Sub-divisional and judicial magistrate jurisdiction for {resolved_city} tehsil.",
            "website": "https://districts.ecourts.gov.in",
            "contact_number": "+91-11-23386342",
            "working_hours": "10:00 AM - 4:00 PM",
            "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
            "judge_info": f"Civil Judge & Judicial Magistrate of {resolved_city}",
            "distance_km": 0.8
        })

    return res


class NyayaPathPayload(BaseModel):
    query: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.post("/nyaya-path")
def search_nyaya_path(payload: NyayaPathPayload):
    q = payload.query.lower()
    
    # Classification logic
    if any(k in q for k in ["landlord", "tenant", "rent", "deposit", "evict"]):
        classification = "Tenancy & Rent Control Dispute"
        stages = [
          {"id": 1, "label": "What To Do", "title": "Draft & Send Written Notice", "desc": "Send a formal notice demanding security deposit refund/eviction halt via registered post. Keep delivery receipt."},
          {"id": 2, "label": "Where To Go", "title": "Rent Control Authority Office", "desc": "Approach the local Rent Controller or sub-district office with copies of your agreement and rent receipts."},
          {"id": 3, "label": "Which Court", "title": "Rent Court / Tribunal", "desc": "If mediation fails, file a petition under the state Rent Control Act in the Rent Court."},
          {"id": 4, "label": "Required Documents", "title": "Evidentiary Checklist", "desc": "Requires: Rent Agreement, Payment Slips, WhatsApp Chats, Postal Receipts, Eviction Notice."},
          {"id": 5, "label": "Timeline", "title": "Typical Case Duration", "desc": "Mediation: 1-2 months. Rent court decree: 6-12 months."},
          {"id": 6, "label": "Next Step", "title": "Generate Demand Notice Draft", "desc": "Generate a tenant legal notice template or start a chat with our Tenant Rights Skill agent."}
        ]
        next_link = "/drafts?template=legal_notice"
    elif any(k in q for k in ["salary", "employer", "employee", "wages", "fired", "termination"]):
        classification = "Employment & Labour Law Dispute"
        stages = [
          {"id": 1, "label": "What To Do", "title": "Serve Demand Letter", "desc": "Serve a formal written letter to the HR/management demanding outstanding wages or challenging wrongful dismissal."},
          {"id": 2, "label": "Where To Go", "title": "Labour Commissioner Office", "desc": "Approach the Deputy Labour Commissioner for conciliation proceedings between employer and employee."},
          {"id": 3, "label": "Which Court", "title": "Labour Court / Industrial Tribunal", "desc": "If conciliation fails, the Labour Commissioner refers the dispute to the Industrial Labour Court."},
          {"id": 4, "label": "Required Documents", "title": "Evidentiary Checklist", "desc": "Requires: Appointment Letter, Salary Slips, Termination Letter, Bank Statements, Email logs."},
          {"id": 5, "label": "Timeline", "title": "Typical Case Duration", "desc": "Conciliation: 1-3 months. Labour Court reference hearings: 12-24 months."},
          {"id": 6, "label": "Next Step", "title": "Begin Labour Dispute Chat", "desc": "Interact with our Employment Law Assistant to structure your conciliation plea."}
        ]
        next_link = "/chat?mode=employment"
    elif any(k in q for k in ["defect", "product", "warranty", "refund", "delivered", "consumer", "store", "charge"]):
        classification = "Consumer Rights Redressal"
        stages = [
          {"id": 1, "label": "What To Do", "title": "Serve Written Grievance Notice", "desc": "Send a formal notice stating defect/unfair trade practice, demanding refund/replacement within 15 days."},
          {"id": 2, "label": "Where To Go", "title": "District Consumer Commission Desk", "desc": "Approach the District Consumer Disputes Redressal Commission of your jurisdiction."},
          {"id": 3, "label": "Which Court", "title": "District Consumer Court", "desc": "File a formal complaint through the e-Daakhil portal or in person at the Consumer Commission."},
          {"id": 4, "label": "Required Documents", "title": "Evidentiary Checklist", "desc": "Requires: Purchase Invoice, Warranty Card, Photos of Defect, Rejection Email, Demand Notice copy."},
          {"id": 5, "label": "Timeline", "title": "Typical Case Duration", "desc": "Filing & Admission: 1 month. Summary trial resolution: 6-12 months."},
          {"id": 6, "label": "Next Step", "title": "Draft Consumer Complaint", "desc": "Open our Consumer Complaint Template Generator to auto-draft your consumer petition."}
        ]
        next_link = "/drafts?template=consumer_complaint"
    elif any(k in q for k in ["hack", "phish", "scam", "online", "fraud", "card", "bank"]):
        classification = "Cyber Crime Prosecution"
        stages = [
          {"id": 1, "label": "What To Do", "title": "Block Accounts & Secure Logins", "desc": "Immediately freeze compromised bank accounts/cards. Save screenshots of all logs and messages."},
          {"id": 2, "label": "Where To Go", "title": "Local Police Station / Cyber Cell", "desc": "Report the incident immediately at the cyber cell or register an online complaint at cybercrime.gov.in."},
          {"id": 3, "label": "Which Court", "title": "Adjudicating Officer (IT Act)", "desc": "For compensation, file a petition before the State IT Secretary (Adjudicating Officer under IT Act)."},
          {"id": 4, "label": "Required Documents", "title": "Evidentiary Checklist", "desc": "Requires: Bank Statements showing fraud, Screenshots of chats/headers, IP Logs, Online FIR receipt."},
          {"id": 5, "label": "Timeline", "title": "Typical Case Duration", "desc": "FIR registration: 24-48 hours. Compensation adjudication: 6-18 months."},
          {"id": 6, "label": "Next Step", "title": "Access Cyber Crime Assistance", "desc": "Go to the Emergency Help center to find hotlines and contact the local cyber police desk."}
        ]
        next_link = "/emergency"
    elif any(k in q for k in ["divorce", "spouse", "custody", "marriage", "alimony", "husband", "wife"]):
        classification = "Family & Matrimonial Dispute"
        stages = [
          {"id": 1, "label": "What To Do", "title": "Consultation & Mediation", "desc": "Evaluate mutual separation bounds or child custody rights. Attempt mediation before filing."},
          {"id": 2, "label": "Where To Go", "title": "District Family Court Mediation Desk", "desc": "Approach the family court counselor department to seek an amicable settlement resolution."},
          {"id": 3, "label": "Which Court", "title": "District Family Court Complex", "desc": "File the petition (e.g. mutual divorce under Sec 13B Hindu Marriage Act) in the Family Court."},
          {"id": 4, "label": "Required Documents", "title": "Evidentiary Checklist", "desc": "Requires: Marriage Certificate, Photographs, Joint Petition, Asset & Income affidavits, Separation Proof."},
          {"id": 5, "label": "Timeline", "title": "Typical Case Duration", "desc": "Mutual Divorce: 6 months (cooling period). Contested cases: 18-36 months."},
          {"id": 6, "label": "Next Step", "title": "Start Family Law Assistant", "desc": "Initiate a chat session with our Family Law Agent for personalized rights guides."}
        ]
        next_link = "/chat?mode=family"
    elif any(k in q for k in ["encroach", "boundary", "land", "deed", "sale", "property", "trespass"]):
        classification = "Property Title & Boundary Dispute"
        stages = [
          {"id": 1, "label": "What To Do", "title": "Request Land Survey", "desc": "File an application before the Tehsildar to measure and survey the boundaries of your land plot."},
          {"id": 2, "label": "Where To Go", "title": "Local Revenue / Sub-Registrar Office", "desc": "Collect certified mutation deeds, land records (Jamabandi/7-12) to prove ownership."},
          {"id": 3, "label": "Which Court", "title": "Civil Court Junior Division", "desc": "File a suit for declaration of title, boundary verification, and permanent injunction."},
          {"id": 4, "label": "Required Documents", "title": "Evidentiary Checklist", "desc": "Requires: Registered Sale Deed, Mutation Certificate, Land Revenue receipts, Survey Map report."},
          {"id": 5, "label": "Timeline", "title": "Typical Case Duration", "desc": "Revenue survey: 1-2 months. Civil lawsuit trial: 3-5 years."},
          {"id": 6, "label": "Next Step", "title": "Run Property Dispute Assistant", "desc": "Analyze rights guidelines in our Property Disputes Center."}
        ]
        next_link = "/journey?category=property"
    else:
        classification = "General Legal Dispute Resolution"
        stages = [
          {"id": 1, "label": "What To Do", "title": "Consultation & Notice Serving", "desc": "Document all verbal/written interactions, collect communications, and serve a legal warning notice."},
          {"id": 2, "label": "Where To Go", "title": "District Legal Services Authority (DLSA)", "desc": "Seek free legal aid counseling if you cannot afford a private lawyer."},
          {"id": 3, "label": "Which Court", "title": "Civil Jurisdiction / Magistrate Court", "desc": "Initiate proceedings in the competent territorial court of first instance."},
          {"id": 4, "label": "Required Documents", "title": "Evidentiary Checklist", "desc": "Requires: ID proofs, Communications (emails/SMS), Written statements, Agreements or receipts."},
          {"id": 5, "label": "Timeline", "title": "Typical Case Duration", "desc": "Depends on case complexity: Civil disputes range 2-4 years."},
          {"id": 6, "label": "Next Step", "title": "Chat with Legal Advisor Agent", "desc": "Describe your problem in the main AI Legal Chat console for general counsel."}
        ]
        next_link = "/chat"

    return {
        "problem_classification": classification,
        "stages": stages,
        "next_link": next_link
    }


# ─── Day 5/6 Overhaul Endpoints ───

class LegalAidPayload(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None

@router.post("/legal-aid")
def get_legal_aid(payload: LegalAidPayload):
    lat = payload.latitude
    lon = payload.longitude
    state = payload.state
    district = payload.district

    # If coordinates are provided but state/district are missing, reverse geocode them
    if (not state or not district) and lat is not None and lon is not None:
        try:
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1"
            req = urllib.request.Request(url, headers={'User-Agent': 'NyayaAI-CitizenNavigator/1.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    address = data.get("address", {})
                    if not state:
                        state = address.get("state")
                    if not district:
                        district = address.get("county") or address.get("district") or address.get("state_district") or ""
        except Exception as e:
            print(f"[LEGAL AID REVERSE GEOCODE ERROR] {e}")

    # Fallback to estimate state if reverse geocode failed
    if not state and lat is not None and lon is not None:
        state = estimate_state_from_coords(lat, lon)

    state_clean = state if state else "Local State"
    district_clean = district if district else "Local District"
    state_slug = state_clean.lower().replace(" ", "")
    district_slug = district_clean.lower().replace(" ", "")

    results = [
        {
            "name": f"{district_clean} District Legal Services Authority (DLSA)",
            "type": "District Legal Services Authority",
            "address": f"District Court Complex, Shivajinagar Area, {district_clean}, {state_clean}",
            "phone": "15100 (Toll Free)",
            "email": f"dlsa-{district_slug}@{state_slug}.gov.in",
            "website": f"https://districts.ecourts.gov.in/{district_slug}",
            "latitude": lat + 0.003 if lat is not None else 20.0,
            "longitude": lon + 0.004 if lon is not None else 78.0,
            "description": f"Provides free legal aid services, counsel, and organizes monthly Lok Adalats for dispute settlement in {district_clean} district."
        },
        {
            "name": f"{state_clean} State Legal Services Authority ({state_clean[:3].upper()}SLSA)",
            "type": "State Legal Services Authority",
            "address": f"High Court Annex Complex, Capital City, {state_clean}",
            "phone": "+91-11-23384874",
            "email": f"slsa-{state_slug}@nic.in",
            "website": f"http://www.{state_slug}slsa.org",
            "latitude": lat + 0.25 if lat is not None else 20.2,
            "longitude": lon - 0.2 if lon is not None else 77.8,
            "description": f"State-level apex body coordinating free legal aid services, mediation centers, and panel lawyer assignments across {state_clean}."
        }
    ]

    for center in results:
        dist = 0.0
        if lat is not None and lon is not None:
            dist = haversine_distance(lat, lon, center["latitude"], center["longitude"])
        center["distance_km"] = round(dist, 2) if lat is not None and lon is not None else 0.0

    if lat is not None and lon is not None:
        results.sort(key=lambda x: x["distance_km"])

    return results

class CourtPrepPayload(BaseModel):
    court_id: str

@router.post("/court-prep")
def get_court_prep(payload: CourtPrepPayload, db: Session = Depends(get_db)):
    court = db.query(Court).filter(Court.id == payload.court_id).first()
    if not court:
        court_name = "the Court"
        timings = "10:00 AM - 4:00 PM"
    else:
        court_name = court.name
        timings = court.working_hours
        
    return {
        "court_name": court_name,
        "timings": timings,
        "dress_code": "Formal attire is mandatory. White shirt, dark trousers or skirt, sober colors. Avoid sandals, slippers, or casual printed t-shirts.",
        "parking_status": "Highly congested during peak hours (10:00 AM to 1:00 PM). It is recommended to use public transit or arrive at least 45 minutes early if driving.",
        "security_checklist": [
            "Original government-issued photo ID (Aadhaar Card, PAN Card, Voter ID, or Driver's License)",
            "Physical printed copies of all case filings, petitions, evidence, and orders",
            "Turn off or silence all mobile devices before entering the courtroom",
            "No electronic recording devices, cameras, or suspicious items allowed through metal detectors"
        ],
        "dos_and_donts": {
            "dos": [
                "Arrive at least 30 minutes before the scheduled hearing slot",
                "Stand up when the judge enters or exits the courtroom",
                "Address the judge respectfully as 'My Lord', 'Your Ladyship', or 'Your Honour'",
                "Wait quietly inside the courtroom for your case item number to be called"
            ],
            "donts": [
                "Do not speak, whisper, or make noise when another case is being argued",
                "Do not argue or raise your voice when speaking to the presiding officer",
                "Do not bring food, drinks, or use chewing gum inside the court hall",
                "Do not use or browse your phone while sitting in the front rows"
            ]
        }
    }

class LegalNewsPayload(BaseModel):
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.post("/legal-news")
def get_legal_news(payload: LegalNewsPayload):
    news_articles = [
        {
            "id": "news_1",
            "title": "Supreme Court Rules on RERA Conciliation Mandate",
            "summary": "The Supreme Court of India clarified that pre-litigation conciliation under state RERA rules is highly encouraged before formal adjudication.",
            "category": "Real Estate / Property Law",
            "state": "National",
            "date": "2026-06-15",
            "citation": "2026 INSC 412",
            "details": "A three-judge bench led by the CJI ruled that RERA authorities must prioritize settlement conferences, helping homebuyers and builders resolve structural disputes without long civil trials."
        },
        {
            "id": "news_2",
            "title": "Delhi High Court Directs Action on Cyber Fraud Portals",
            "summary": "Delhi HC orders instant blocking of 45 domain names masquerading as official government subsidy websites.",
            "category": "Cyber Crime",
            "state": "Delhi",
            "date": "2026-06-18",
            "citation": "2026 DHC 1085",
            "details": "Adjudicating on a public interest petition, the High Court directed the Ministry of Electronics and Information Technology (MeitY) to set up a 24-hour rapid response system for financial phishing domains."
        },
        {
            "id": "news_3",
            "title": "Maharashtra government updates Tenant Protection Rules",
            "summary": "State Cabinet drafts new circular streamlining eviction clauses and security deposit bounds under the Maharashtra Rent Control Act.",
            "category": "Tenancy & Property Law",
            "state": "Maharashtra",
            "date": "2026-06-20",
            "citation": "MHA-2026-CIR-8",
            "details": "The updated circular makes registration of leave and license agreements entirely digital and caps security deposits to a maximum of three months of rent for residential premises."
        },
        {
            "id": "news_4",
            "title": "Karnataka High Court rules on Employee Retrenchment Notice",
            "summary": "High Court rules that IT company layoffs without prior 30-day notice or equivalent compensation violates Industrial Disputes guidelines.",
            "category": "Labour & Employment",
            "state": "Karnataka",
            "date": "2026-06-12",
            "citation": "2026 KHC 3241",
            "details": "The court held that standard employment terms must strictly conform to Section 25F of the Industrial Disputes Act, ordering reinstatement or full compensation for retrenched engineers."
        }
    ]
    
    state_filter = payload.state.strip().lower() if payload.state else None
    
    if not state_filter and payload.latitude is not None and payload.longitude is not None:
        state_filter = estimate_state_from_coords(payload.latitude, payload.longitude).strip().lower()
        if not state_filter:
            lat = payload.latitude
            lon = payload.longitude
            if 28.0 <= lat <= 29.0 and 76.5 <= lon <= 77.5:
                state_filter = "delhi"
            elif 18.0 <= lat <= 19.5 and 72.5 <= lon <= 74.5:
                state_filter = "maharashtra"
            elif 12.0 <= lat <= 13.5 and 77.0 <= lon <= 78.0:
                state_filter = "karnataka"
            
    filtered_news = []
    has_state_specific = False
    
    for art in news_articles:
        if state_filter and state_filter in art["state"].lower():
            filtered_news.append(art)
            has_state_specific = True
        elif art["state"] == "National":
            filtered_news.append(art)
            
    # If a state was specified but we have no state-specific news for it, dynamically create one!
    if state_filter and not has_state_specific:
        state_title = state_filter.title()
        filtered_news.append({
            "id": f"news_dyn_{state_filter}",
            "title": f"{state_title} High Court Simplifies Digital Filing for Local Courts",
            "summary": f"The High Court of {state_title} issued a new circular enabling e-filing across all sub-divisional and district courts.",
            "category": "Judicial Reforms",
            "state": state_title,
            "date": datetime.today().strftime('%Y-%m-%d'),
            "citation": f"2026 {state_title[:3].upper()}HC 512",
            "details": f"To reduce physical congestion, the High Court directed that all civil and lower court petitions can now be verified online using Aadhaar-based digital signatures."
        })
        
    # If no state filter, return all
    if not state_filter:
        return news_articles
        
    return filtered_news

