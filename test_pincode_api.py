import urllib.request, json

base = 'http://127.0.0.1:8000/api/v1/location'

# Test health
with urllib.request.urlopen(base + '/health', timeout=5) as r:
    health = json.loads(r.read())
print('Health:', json.dumps(health, indent=2))

# Test all 10 sample PINs
test_pins = ['110001','400001','560001','700001','600001','682001','226001','302001','781001','821101']
print()
print('Live API PIN Code Tests:')
print('-' * 60)
all_passed = True
for pin in test_pins:
    payload = json.dumps({'pincode': pin}).encode()
    req = urllib.request.Request(
        base + '/search-pincode',
        data=payload,
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        data = json.loads(r.read())
    if data.get('success'):
        loc = data['location']
        city = loc.get('city', '')
        district = loc.get('district', '')
        state = loc.get('state', '')
        lat = loc.get('latitude')
        lon = loc.get('longitude')
        print(f'  PASS  {pin}  ->  {city}, {district}, {state}  (lat={lat}, lon={lon})')
    else:
        print(f'  FAIL  {pin}  ->  ERROR: {data.get("error")}')
        all_passed = False

print()
print('Result:', 'ALL PASSED' if all_passed else 'SOME FAILED')
