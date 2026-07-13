import requests
import json

def test_admin_flow():
    base_url = 'http://localhost:8000/api/v1'
    
    # 1. Login as Admin
    # Ensure there's an admin user
    login_res = requests.post(f"{base_url}/user/login", json={"username": "admin@nyaya.ai", "password": "AdminPassword@123"})
    if login_res.status_code != 200:
        # Register Admin
        requests.post(f"{base_url}/user/register", json={"name": "Admin", "email": "admin@nyaya.ai", "password": "AdminPassword@123", "mobile": "9999999999"})
        login_res = requests.post(f"{base_url}/user/login", json={"username": "admin@nyaya.ai", "password": "AdminPassword@123"})
        if login_res.status_code != 200:
            print("Admin Login failed")
            return
            
    token = login_res.json().get('access_token')
    headers = {"Authorization": f"Bearer {token}"}
    
    # Wait, the check_admin function in marketplace.py says:
    # `if user and not user.is_admin: if user.email == "admin@nyaya.ai": return user`
    # So "admin@nyaya.ai" has hardcoded admin access.
    
    # 2. Get Payments
    print("\nFetching Admin Payments...")
    payments_res = requests.get(f"{base_url}/marketplace/admin/payments", headers=headers)
    print("Admin Payments Status:", payments_res.status_code)
    
    if payments_res.status_code != 200:
        return
        
    data = payments_res.json()
    payments = data.get("payments", [])
    if not payments:
        print("No payments found for admin.")
        return
        
    tx_id = payments[0]['id']
    print(f"Approving transaction {tx_id}...")
    
    # 3. Approve Payment
    verify_payload = {
        "transaction_id": tx_id,
        "action": "approve"
    }
    
    verify_res = requests.post(f"{base_url}/marketplace/admin/verify", headers=headers, data=verify_payload)
    print("Admin Verify Status:", verify_res.status_code)
    if verify_res.status_code == 200:
        print("Admin Verify Response:", verify_res.json())
    else:
        print("Admin Verify Error:", verify_res.text)

test_admin_flow()
