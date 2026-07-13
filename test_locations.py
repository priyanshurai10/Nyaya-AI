import requests

def test_pincode(pincode):
    try:
        response = requests.post(
            'http://localhost:8000/api/v1/navigation/pincode-search',
            json={"pincode": pincode}
        )
        print(f'Pincode {pincode}: {response.status_code}')
        if response.status_code == 200:
            data = response.json()
            print(f'  City: {data.get("city")}')
            print(f'  District: {data.get("district")}')
            print(f'  State: {data.get("state")}')
            print(f'  Lat/Lon: {data.get("latitude")}, {data.get("longitude")}')
        else:
            print(f'  Error: {response.text}')
    except Exception as e:
        print(f'  Exception: {e}')

pincodes = ['821101', '411001', '560001', '682001', '110001']
for p in pincodes:
    test_pincode(p)
