import requests
import json
import sys

def test_api():
    print("Testing Nyaya AI Chat API Endpoint...")
    url = "http://localhost:8000/api/v1/chat/message"
    payload = {
        "message": "makan malik deposit nahi de raha hai, please help",
        "mother_mode": False
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        r = requests.post(url, json=payload, headers=headers, timeout=30)
        print(f"Status Code: {r.status_code}")
        if r.status_code == 200:
            print("SUCCESS: Endpoint responded successfully!")
            res_data = r.json()
            print(f"Detected Language: {res_data.get('detected_language')}")
            print(f"Response Preview: {res_data.get('response')[:200]}...")
            print(f"Disclaimer: {res_data.get('disclaimer')}")
            print(f"Laws Cited: {res_data.get('laws_cited')}")
            sys.exit(0)
        else:
            print(f"FAILURE: Server returned error {r.status_code}: {r.text}")
            sys.exit(1)
    except Exception as e:
        print(f"FAILURE: Could not connect to API: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_api()
