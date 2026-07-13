import requests

def test_court_discovery(pincode):
    try:
        # 1. First get location from pincode
        res_loc = requests.post(
            'http://localhost:8000/api/v1/navigation/pincode-search',
            json={"pincode": pincode}
        )
        if res_loc.status_code != 200:
            print(f'Failed location for {pincode}')
            return
        loc_data = res_loc.json()
        
        # 2. Search nearest courts
        payload = {
            "pincode": pincode,
            "city": loc_data.get("city"),
            "district": loc_data.get("district"),
            "state": loc_data.get("state"),
            "latitude": loc_data.get("latitude"),
            "longitude": loc_data.get("longitude")
        }
        res_courts = requests.post(
            'http://localhost:8000/api/v1/navigation/courts/search',
            json=payload
        )
        if res_courts.status_code == 200:
            data = res_courts.json()
            print(f"\n--- PINCODE {pincode} ({loc_data.get('city')}, {loc_data.get('state')}) ---")
            print(f"Debug Info: {data.get('debug_info')}")
            for t, court in data.get("nearest_courts", {}).items():
                if court:
                    print(f"  {t.capitalize()}: {court['name']} ({court['distance_km']} km)")
                else:
                    print(f"  {t.capitalize()}: None")
        else:
            print(f'Error for courts {pincode}: {res_courts.text}')
    except Exception as e:
        print(f'Exception {pincode}: {e}')

pincodes = ['821101', '411001', '560001', '682001', '110001']
for p in pincodes:
    test_court_discovery(p)
