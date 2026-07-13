import requests
import json

def test_marketplace_flow():
    base_url = 'http://localhost:8000/api/v1'
    # 1. Login to get token
    login_res = requests.post(f"{base_url}/user/login", json={"username": "sjnhcjjc@test.com", "password": "Password@123"})
    if login_res.status_code != 200:
        print("Login failed:", login_res.text)
        return
    token = login_res.json().get('access_token')
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get services
    print("\nFetching Marketplace Services...")
    services_res = requests.get(f"{base_url}/marketplace/services", headers=headers)
    print("Services Status:", services_res.status_code)
    
    if services_res.status_code != 200:
        return
        
    services = services_res.json()
    if not services:
        print("No services found.")
        return
    
    service_name = services[0]['name']
    
    # 3. Submit Payment (Pay Now)
    print(f"\nSubmitting payment for service {service_name}...")
    pay_payload = {
        "service_name": service_name,
        "amount": 200,
        "payment_method": "upi"
    }
    
    pay_res = requests.post(f"{base_url}/marketplace/payment/submit", headers=headers, data=pay_payload)
    print("Payment Status:", pay_res.status_code)
    if pay_res.status_code != 200:
        print("Payment Error:", pay_res.text)
        return
        
    tx_id = pay_res.json().get("transaction_id")
    print("Transaction ID:", tx_id)
    
    # 4. Verify Payment (Screenshot)
    print("\nVerifying Payment...")
    verify_payload = {
        "transaction_id": tx_id,
        "full_name": "Test User",
        "mobile_number": "1234567890",
        "email": "sjnhcjjc@test.com",
        "legal_issue_type": "Civil",
        "utr_number": "UTR1234567890"
    }
    
    # fake screenshot upload
    files = {
        'screenshot': ('payment.jpg', b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08', 'image/jpeg')
    }
    
    verify_res = requests.post(f"{base_url}/marketplace/payment/verify", headers=headers, data=verify_payload, files=files)
    print("Verify Status:", verify_res.status_code)
    if verify_res.status_code == 200:
        print("Verify Response:", verify_res.json())
    else:
        print("Verify Error:", verify_res.text)

test_marketplace_flow()
