import math
import urllib.request
import urllib.parse
import json
import time
import logging
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Court, Advocate
import os

router = APIRouter()
logger = logging.getLogger("discovery")

GOOGLE_MAPS_API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY", "")

# ─── Observability ───
def log_observability(provider: str, duration_ms: float, cache_hit: bool, error: Optional[str] = None):
    status = "FAILURE" if error else "SUCCESS"
    cache_str = "HIT" if cache_hit else "MISS"
    print(f"[OBSERVABILITY] Provider: {provider} | Status: {status} | Latency: {duration_ms:.2f}ms | Cache: {cache_str}")
    if error:
        print(f"                -> Reason: {error}")

def fetch_url_json(url: str, timeout: int = 5) -> Optional[Any]:
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'NyayaAI-DiscoveryEngine/2.0 (production)'}
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        raise Exception(f"HTTP Request failed: {e}")
    return None

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

# ─── Provider Interfaces ───


# ─── Resilience & Caching ───
class CircuitBreaker:
    def __init__(self, failure_threshold=3, recovery_timeout=60):
        self.failures = 0
        self.threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.last_failure_time = 0

    def is_open(self):
        if self.failures >= self.threshold:
            import time
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.failures = 0
                return False
            return True
        return False

    def record_failure(self):
        import time
        self.failures += 1
        self.last_failure_time = time.time()

    def record_success(self):
        self.failures = 0

osm_circuit_breaker = CircuitBreaker()

class CacheManager:
    def __init__(self, ttl_seconds=3600):
        self.cache = {}
        self.ttl = ttl_seconds
        
    def get(self, key):
        import time
        if key in self.cache:
            data, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return data
            else:
                del self.cache[key]
        return None
        
    def set(self, key, value):
        import time
class DiscoveryProvider(ABC):
    @abstractmethod
    def search(self, lat: float, lon: float, state: str, db: Session) -> List[Dict]:
        pass

class CourtProvider(DiscoveryProvider):
    def search(self, lat: float, lon: float, state: str, db: Session) -> List[Dict]:
        start_time = time.time()
        try:
            # 1. Fetch from DB
            courts = db.query(Court).all()
            valid_courts = []
            
            order_map = {
                "supreme": 1, "high": 2, "district": 3, "sessions": 4, 
                "civil": 5, "family": 6, "consumer": 7, "labour": 8,
                "commercial": 9, "Verified Court": 10
            }
            
            for c in courts:
                if c.court_type == "supreme": continue
                dist = haversine_distance(lat, lon, c.latitude, c.longitude)
                if c.court_type == "high" and state and c.state and state.lower() != c.state.lower():
                    continue
                if dist <= 150.0:
                    valid_courts.append({
                        "id": c.id, "name": c.name, "type": c.court_type,
                        "address": c.address, "district": c.district, "state": c.state,
                        "latitude": c.latitude, "longitude": c.longitude,
                        "contact_number": c.contact_number, "working_hours": c.working_hours,
                        "judge_info": c.judge_info, "distance_km": round(dist, 2),
                        "sort_priority": order_map.get(c.court_type, 10)
                    })
            
            valid_courts.sort(key=lambda x: (x['sort_priority'], x['distance_km']))
            
            sc = db.query(Court).filter(Court.court_type == "supreme").first()
            if sc:
                valid_courts.append({
                    "id": sc.id, "name": sc.name, "type": "supreme",
                    "address": sc.address, "district": sc.district, "state": sc.state,
                    "latitude": sc.latitude, "longitude": sc.longitude,
                    "contact_number": sc.contact_number, "working_hours": sc.working_hours,
                    "judge_info": sc.judge_info, 
                    "distance_km": round(haversine_distance(lat, lon, sc.latitude, sc.longitude), 2),
                    "sort_priority": 9
                })
            
            log_observability("CourtProvider", (time.time() - start_time)*1000, False)
            return valid_courts
        except Exception as e:
            log_observability("CourtProvider", (time.time() - start_time)*1000, True, str(e))
            return [{"error": "temporarily_unavailable"}]

class AdvocateProvider(DiscoveryProvider):
    def search(self, lat: float, lon: float, state: str, db: Session) -> List[Dict]:
        start_time = time.time()
        try:
            advocates = db.query(Advocate).all()
            adv_list = []
            for c in advocates:
                dist = haversine_distance(lat, lon, c.latitude, c.longitude)
                if dist <= 50.0:
                    adv_list.append({
                        "id": c.id, "name": c.name, "type": "Verified Advocate",
                        "address": c.office_address, "latitude": c.latitude, "longitude": c.longitude,
                        "contact_number": c.contact_number, "website": c.website,
                        "distance_km": round(dist, 2)
                    })
                                
            adv_list.sort(key=lambda x: x['distance_km'])
            log_observability("AdvocateProvider", (time.time() - start_time)*1000, False)
            return adv_list
        except Exception as e:
            log_observability("AdvocateProvider", (time.time() - start_time)*1000, False, str(e))
            return []

class PoliceProvider(DiscoveryProvider):
    def search(self, lat: float, lon: float, state: str, db: Session) -> List[Dict]:
        start_time = time.time()
        try:
            stations = db.query(PoliceStation).all()
            valid_stations = []
            
            for s in stations:
                dist = haversine_distance(lat, lon, s.latitude, s.longitude)
                if dist <= 50.0:
                    valid_stations.append({
                        "id": s.id, "name": s.name, "type": s.station_type,
                        "address": s.address, "city": s.city, "district": s.district, "state": s.state,
                        "latitude": s.latitude, "longitude": s.longitude,
                        "contact_number": s.phone, "distance_km": round(dist, 2)
                    })
                    
            valid_stations.sort(key=lambda x: x['distance_km'])
            log_observability("PoliceProvider (DB)", (time.time() - start_time)*1000, False)
            return valid_stations
        except Exception as e:
            log_observability("PoliceProvider", (time.time() - start_time)*1000, True, str(e))
            return [{"error": "temporarily_unavailable"}]

class LegalAidProvider(DiscoveryProvider):
    def search(self, lat: float, lon: float, state: str, db: Session) -> List[Dict]:
        start_time = time.time()
        try:
            centres = db.query(LegalAidCentre).all()
            valid_aids = []
            
            for c in centres:
                dist = haversine_distance(lat, lon, c.latitude, c.longitude)
                if dist <= 100.0:
                    valid_aids.append({
                        "id": c.id, "name": c.name, "type": "Free Legal Aid Centre",
                        "address": c.address, "latitude": c.latitude, "longitude": c.longitude,
                        "contact_number": c.phone, "distance_km": round(dist, 2)
                    })
            
            valid_aids.sort(key=lambda x: x['distance_km'])
            log_observability("LegalAidProvider (DB)", (time.time() - start_time)*1000, False)
            return valid_aids
        except Exception as e:
            log_observability("LegalAidProvider", (time.time() - start_time)*1000, True, str(e))
            return []

class ConsumerForumProvider(DiscoveryProvider):
    def search(self, lat: float, lon: float, state: str, db: Session) -> List[Dict]:
        start_time = time.time()
        try:
            courts = db.query(Court).filter(Court.court_type == 'consumer').all()
            forums = []
            for c in courts:
                dist = haversine_distance(lat, lon, c.latitude, c.longitude)
                if dist <= 150.0:
                    forums.append({
                        "id": c.id, "name": c.name, "type": "District Consumer Commission" if "district" in c.name.lower() else "State Consumer Commission",
                        "address": c.address, "district": c.district, "state": c.state,
                        "latitude": c.latitude, "longitude": c.longitude,
                        "contact_number": c.contact_number, "working_hours": c.working_hours,
                        "distance_km": round(dist, 2)
                    })
            forums.sort(key=lambda x: x['distance_km'])
            log_observability("ConsumerForumProvider", (time.time() - start_time)*1000, False)
            return forums
        except Exception as e:
            log_observability("ConsumerForumProvider", (time.time() - start_time)*1000, False, str(e))
            return []

# ─── API Schemas ───
from pydantic import Field, validator

class ResolveLocationPayload(BaseModel):
    query: str = Field(..., max_length=100)
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lon: Optional[float] = Field(None, ge=-180, le=180)

class SearchPayload(BaseModel):
    """Used for geolocation-based unified search (courts, advocates, police).
    latitude/longitude are the primary search parameters.
    """
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    state_name: Optional[str] = None
    pincode: Optional[str] = None
    city_name: Optional[str] = None

# ─── Endpoints ───
@router.post("/resolve-location")
def resolve_location(payload: ResolveLocationPayload):
    start_time = time.time()
    
    if not GOOGLE_MAPS_API_KEY:
        raise HTTPException(status_code=500, detail="Google Maps API Key not configured.")
        
    # Priority 1: GPS Direct Reverse Geocode
    if payload.lat is not None and payload.lon is not None and not payload.query:
        url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={payload.lat},{payload.lon}&key={GOOGLE_MAPS_API_KEY}"
        try:
            data = fetch_url_json(url)
            log_observability("LocationResolver (Reverse)", (time.time() - start_time)*1000, False)
            if data and data.get("status") == "OK" and data.get("results"):
                results = data["results"]
                addr_comp = results[0].get("address_components", [])
                
                city = ""
                district = ""
                town = ""
                village = ""
                state = ""
                pincode = ""
                
                for comp in addr_comp:
                    types = comp.get("types", [])
                    if "locality" in types: city = comp.get("long_name", "")
                    if "administrative_area_level_3" in types: district = comp.get("long_name", "")
                    if not district and "administrative_area_level_2" in types: district = comp.get("long_name", "")
                    if "sublocality" in types: town = comp.get("long_name", "")
                    if "neighborhood" in types or "village" in types: village = comp.get("long_name", "")
                    if "administrative_area_level_1" in types: state = comp.get("long_name", "")
                    if "postal_code" in types: pincode = comp.get("long_name", "")
                    
                return [{
                    "display_name": results[0].get("formatted_address", "Current Location"),
                    "village": village,
                    "town": town,
                    "city": city,
                    "district": district,
                    "state": state,
                    "pincode": pincode,
                    "latitude": payload.lat, "longitude": payload.lon
                }]
        except Exception as e:
            log_observability("LocationResolver (Reverse)", (time.time() - start_time)*1000, False, str(e))
            raise HTTPException(status_code=503, detail="Location service temporarily unavailable.")
            
    # Priority 2: Text Search
    if payload.query:
        encoded = urllib.parse.quote(payload.query.strip() + " India")
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={encoded}&key={GOOGLE_MAPS_API_KEY}"
        try:
            results_data = fetch_url_json(url)
            log_observability("LocationResolver (Search)", (time.time() - start_time)*1000, False)
            matches = []
            if results_data and results_data.get("status") == "OK":
                for res in results_data.get("results", [])[:5]:
                    geometry = res.get("geometry", {}).get("location", {})
                    lat = geometry.get("lat", 0)
                    lon = geometry.get("lng", 0)
                    
                    addr_comp = res.get("address_components", [])
                    city = ""
                    district = ""
                    town = ""
                    village = ""
                    state = ""
                    pincode = ""
                    
                    for comp in addr_comp:
                        types = comp.get("types", [])
                        if "locality" in types: city = comp.get("long_name", "")
                        if "administrative_area_level_3" in types: district = comp.get("long_name", "")
                        if not district and "administrative_area_level_2" in types: district = comp.get("long_name", "")
                        if "sublocality" in types: town = comp.get("long_name", "")
                        if "neighborhood" in types or "village" in types: village = comp.get("long_name", "")
                        if "administrative_area_level_1" in types: state = comp.get("long_name", "")
                        if "postal_code" in types: pincode = comp.get("long_name", "")
                        
                    matches.append({
                        "display_name": res.get("formatted_address", ""),
                        "village": village,
                        "town": town,
                        "city": city,
                        "district": district,
                        "state": state,
                        "pincode": pincode,
                        "latitude": float(lat), "longitude": float(lon)
                    })
            return matches
        except Exception as e:
            log_observability("LocationResolver (Search)", (time.time() - start_time)*1000, False, str(e))
            raise HTTPException(status_code=503, detail="Location service temporarily unavailable.")
            
    return []


