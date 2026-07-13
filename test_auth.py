import requests
import string
import random

def test_auth():
    base_url = 'http://localhost:8000/api/v1'
    email = ''.join(random.choices(string.ascii_lowercase, k=8)) + '@test.com'
    password = 'Password@123'
    name = 'Test User'

    print(f"Testing Auth for {email}")
    
    # 1. Register
    try:
        res = requests.post(
            f"{base_url}/user/register",
            json={"email": email, "password": password, "name": name}
        )
        print(f"Register status: {res.status_code}")
        if res.status_code != 200:
            print(f"Register Error: {res.text}")
            return
    except Exception as e:
        print(f"Register Exception: {e}")
        return

    # 2. Login
    try:
        res = requests.post(
            f"{base_url}/user/login",
            json={"username": email, "password": password}
        )
        print(f"Login status: {res.status_code}")
        if res.status_code != 200:
            print(f"Login Error: {res.text}")
            return
        
        token = res.json().get('access_token')
        print("Successfully obtained access token")
    except Exception as e:
        print(f"Login Exception: {e}")
        return

    # 3. Get profile
    try:
        res = requests.get(
            f"{base_url}/user/profile",
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"Profile status: {res.status_code}")
        if res.status_code == 200:
            print(f"Profile data: {res.json()}")
        else:
            print(f"Profile Error: {res.text}")
    except Exception as e:
        print(f"Profile Exception: {e}")

test_auth()
