import json
import sqlite3
import math
import uuid
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
import time

CITIES = [
    "New Delhi", "Mumbai", "Pune", "Nagpur", "Nashik", "Bengaluru", "Mysuru",
    "Mangalore", "Chennai", "Coimbatore", "Madurai", "Hyderabad", "Warangal",
    "Visakhapatnam", "Vijayawada", "Kochi", "Thiruvananthapuram", "Kozhikode",
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Jaipur", "Jodhpur", "Udaipur",
    "Lucknow", "Kanpur", "Prayagraj", "Varanasi", "Agra", "Patna", "Gaya",
    "Muzaffarpur", "Bhagalpur", "Bhabua", "Kolkata", "Siliguri", "Durgapur",
    "Bhubaneswar", "Cuttack", "Ranchi", "Jamshedpur", "Raipur", "Bilaspur",
    "Bhopal", "Indore", "Gwalior", "Chandigarh", "Ludhiana", "Amritsar",
    "Gurugram", "Faridabad", "Shimla", "Dehradun", "Guwahati", "Imphal",
    "Agartala", "Jammu", "Srinagar"
]

def geocode_city(city_name):
    geolocator = Nominatim(user_agent="nyaya_demo_mode_seeder")
    try:
        location = geolocator.geocode(f"{city_name}, India")
        if location:
            return location.latitude, location.longitude
        return None, None
    except Exception:
        return None, None

def distance(lat1, lon1, lat2, lon2):
    R = 6371 # km
    dLat = (lat2-lat1) * math.pi / 180.0
    dLon = (lon2-lon1) * math.pi / 180.0
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(lat1 * math.pi / 180.0) * math.cos(lat2 * math.pi / 180.0) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def seed():
    conn = sqlite3.connect('nyaya_ai.db')
    c = conn.cursor()
    
    print("Clearing demo tables...")
    c.execute("DELETE FROM demo_courts")
    c.execute("DELETE FROM demo_police_stations")
    c.execute("DELETE FROM demo_advocates")
    
    # Check if cities already exist to prevent slow geocoding API calls
    c.execute("SELECT id, city, latitude, longitude FROM demo_cities")
    existing_cities = c.fetchall()
    city_ids = {}
    
    if len(existing_cities) > 0:
        print("Using existing demo cities from database...")
        for row in existing_cities:
            city_ids[row[1]] = row[0]
    else:
        print("Geocoding demo cities...")
        for city in CITIES:
            lat, lon = geocode_city(city)
            if lat and lon:
                c.execute("INSERT INTO demo_cities (city, state, latitude, longitude, is_active) VALUES (?, ?, ?, ?, ?)",
                          (city, "India", lat, lon, True))
                city_ids[city] = c.lastrowid
                print(f"Inserted {city} at {lat}, {lon}")
            else:
                print(f"Failed to geocode {city}")
            time.sleep(1) # rate limit respect
            
    print("Transferring courts...")
    c.execute("SELECT id, name, court_type, address, latitude, longitude, contact_number FROM courts")
    for row in c.fetchall():
        court_id, name, court_type, address, lat, lon, contact = row
        closest_city = None
        min_dist = float('inf')
        for city, cid in city_ids.items():
            c.execute("SELECT latitude, longitude FROM demo_cities WHERE id=?", (cid,))
            city_lat, city_lon = c.fetchone()
            d = distance(lat, lon, city_lat, city_lon)
            if d < 20 and d < min_dist:
                min_dist = d
                closest_city = cid
                
        if closest_city:
            c.execute("INSERT INTO demo_courts (id, demo_city_id, name, court_type, address, latitude, longitude, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                      (str(uuid.uuid4()), closest_city, name, court_type, address, lat, lon, contact))
            
    print("Transferring police stations...")
    c.execute("SELECT id, name, station_type, address, latitude, longitude, phone FROM police_stations")
    for row in c.fetchall():
        ps_id, name, stype, address, lat, lon, phone = row
        closest_city = None
        min_dist = float('inf')
        for city, cid in city_ids.items():
            c.execute("SELECT latitude, longitude FROM demo_cities WHERE id=?", (cid,))
            city_lat, city_lon = c.fetchone()
            d = distance(lat, lon, city_lat, city_lon)
            if d < 20 and d < min_dist:
                min_dist = d
                closest_city = cid
                
        if closest_city:
            c.execute("INSERT INTO demo_police_stations (id, demo_city_id, name, station_type, address, latitude, longitude, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                      (str(uuid.uuid4()), closest_city, name, stype, address, lat, lon, phone))
            
    print("Transferring advocates...")
    c.execute("SELECT id, name, experience_years, practice_areas, languages, phone_number, latitude, longitude FROM advocates")
    for row in c.fetchall():
        adv_id, name, exp, practice_areas, languages, phone, lat, lon = row
        closest_city = None
        min_dist = float('inf')
        for city, cid in city_ids.items():
            c.execute("SELECT latitude, longitude FROM demo_cities WHERE id=?", (cid,))
            city_lat, city_lon = c.fetchone()
            d = distance(lat, lon, city_lat, city_lon)
            if d < 20 and d < min_dist:
                min_dist = d
                closest_city = cid
                
        if closest_city:
            c.execute("INSERT INTO demo_advocates (id, demo_city_id, name, experience_years, practice_areas, languages, phone_number, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      (str(uuid.uuid4()), closest_city, name, exp, practice_areas, languages, phone, lat, lon))
            
    conn.commit()
    conn.close()
    print("Demo Seeding Complete.")

if __name__ == "__main__":
    seed()
