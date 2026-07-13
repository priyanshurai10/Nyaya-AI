import requests

def test_advocate_discovery(pincode):
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
        
        # 2. Search advocates
        payload = {
            "pincode": pincode,
            "city": loc_data.get("city"),
            "district": loc_data.get("district"),
            "state": loc_data.get("state"),
            "latitude": loc_data.get("latitude"),
            "longitude": loc_data.get("longitude")
        }
        res_adv = requests.post(
            'http://localhost:8000/api/v1/advocates/search',
            json=payload
        )
        if res_adv.status_code == 200:
            advocates = res_adv.json()
            print(f"\n--- PINCODE {pincode} ({loc_data.get('city')}, {loc_data.get('state')}) ---")
            for a in advocates[:5]:
                print(f"  Advocate: {a['name']} | Distance: {a.get('distance_km')} km | Location: {a.get('office_address')}")
            if not advocates:
                print("  No advocates found.")
        else:
            print(f'Error for advocates {pincode}: {res_adv.text}')
    except Exception as e:
        print(f'Exception {pincode}: {e}')

pincodes = ['821101', '411001', '560001', '682001', '110001']
for p in pincodes:
    test_advocate_discovery(p)
