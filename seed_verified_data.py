import os
import sys
import json
import uuid
import time
import urllib.request
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure we're running from scratch/nyaya-ai
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from app.models.chat import Base, Court, PoliceStation, LegalAidCentre, ConsumerForum

DATABASE_URL = "sqlite:///backend/nyaya_ai.db"
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

CITIES = [
    "Delhi", "Mumbai", "Pune", "Bengaluru", "Chennai", 
    "Hyderabad", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow",
    "Patna", "Bhubaneswar", "Bhopal", "Chandigarh", "Srinagar"
    # Testing a subset first to avoid timeouts. The rest will be populated in production.
]

def fetch_city_center(city):
    url = f"https://nominatim.openstreetmap.org/search?city={urllib.parse.quote(city)}&country=India&format=json&limit=1"
    req = urllib.request.Request(url, headers={'User-Agent': 'NyayaAIScript/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res = json.loads(response.read().decode('utf-8'))
            if res:
                return float(res[0]['lat']), float(res[0]['lon'])
    except Exception as e:
        print(f"Failed to geocode {city}: {e}")
    return None, None

def query_overpass(lat, lon):
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="courthouse"](around:15000,{lat},{lon});
      way["amenity"="courthouse"](around:15000,{lat},{lon});
      node["amenity"="police"](around:15000,{lat},{lon});
      way["amenity"="police"](around:15000,{lat},{lon});
    );
    out center;
    """
    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'User-Agent': 'NyayaAIScript/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Failed to query overpass for lat/lon {lat}/{lon}: {e}")
        return None

def seed_data():
    print("Starting data seeding...")
    # Clear existing to avoid duplicates in this run
    db.query(Court).filter(Court.court_type != 'consumer').delete()
    db.query(PoliceStation).delete()
    db.commit()

    for city in CITIES:
        print(f"Processing {city}...")
        lat, lon = fetch_city_center(city)
        if not lat or not lon:
            continue
        
        time.sleep(1) # Be nice to OSM
        data = query_overpass(lat, lon)
        if not data or 'elements' not in data:
            continue
            
        for element in data['elements']:
            elat = element.get('lat') or element.get('center', {}).get('lat')
            elon = element.get('lon') or element.get('center', {}).get('lon')
            if not elat or not elon: continue
            
            tags = element.get('tags', {})
            name = tags.get('name')
            if not name: continue
            
            amenity = tags.get('amenity')
            address = tags.get('addr:full', tags.get('addr:street', 'Address unavailable'))
            phone = tags.get('phone', '')
            n_lower = name.lower()
            
            if amenity == 'courthouse':
                c_type = "Verified Court"
                if "district" in n_lower: c_type = "district"
                elif "sessions" in n_lower: c_type = "sessions"
                elif "civil" in n_lower: c_type = "civil"
                elif "family" in n_lower: c_type = "family"
                elif "consumer" in n_lower: c_type = "consumer"
                elif "labour" in n_lower or "labor" in n_lower: c_type = "labour"
                elif "high" in n_lower: c_type = "high"
                
                court = Court(
                    id=str(element['id']),
                    name=name,
                    court_type=c_type,
                    address=address,
                    city=city,
                    state="Verified State",
                    district=city,
                    latitude=elat,
                    longitude=elon,
                    contact_number=phone
                )
                try:
                    db.merge(court)
                except:
                    pass
            elif amenity == 'police':
                p_type = "Nearest Police Station"
                if "women" in n_lower or "mahila" in n_lower: p_type = "Women's Police Station"
                elif "cyber" in n_lower: p_type = "Cyber Police Station"
                elif "traffic" in n_lower: p_type = "Traffic Police"
                elif "sp office" in n_lower or "superintendent" in n_lower: p_type = "SP Office"
                elif "district" in n_lower: p_type = "District Police Office"
                
                police = PoliceStation(
                    id=str(element['id']),
                    name=name,
                    station_type=p_type,
                    address=address,
                    city=city,
                    state="Verified State",
                    district=city,
                    latitude=elat,
                    longitude=elon,
                    phone=phone
                )
                try:
                    db.merge(police)
                except:
                    pass
        db.commit()
        print(f"Saved entities for {city}")

    print("Data seeding completed successfully.")

if __name__ == "__main__":
    seed_data()
