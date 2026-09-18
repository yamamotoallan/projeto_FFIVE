import requests
import json

BASE_URL = "https://gest-o-agenda-marcenaria-production.up.railway.app"
EMAIL = "admin@marcenaria.pro"
PASSWORD = "123"

print("="*70)
print("FOCUSED TEST: QUOTE STATUS UPDATE")
print("="*70)

# Login
print("\n[STEP 1] Login...")
try:
    r = requests.post(f"{BASE_URL}/api/login", json={"email": EMAIL, "password": PASSWORD})
    print(f"   HTTP Status: {r.status_code}")
    if r.status_code != 200:
        print(f"   Response: {r.text}")
        exit(1)
    token = r.json()['token']
    print(f"   [OK] Token obtained")
except Exception as e:
    print(f"   [ERROR] {e}")
    exit(1)

headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# Create quote
print("\n[STEP 2] Creating test quote...")
try:
    quote_data = {
        "client": "Status Test Client",
        "project": "Status Test Project",
        "value": 5000.00,
        "status": "Pendente"
    }
    r = requests.post(f"{BASE_URL}/api/quotes", json=quote_data, headers=headers)
    print(f"   HTTP Status: {r.status_code}")
    if r.status_code not in [200, 201]:
        print(f"   Response: {r.text}")
        exit(1)
    quote = r.json()
    quote_id = quote.get('id')
    initial_status = quote.get('status')
    print(f"   [OK] Quote ID={quote_id}, Status={initial_status}")
except Exception as e:
    print(f"   [ERROR] {e}")
    print(f"   Response text: {r.text if 'r' in locals() else 'N/A'}")
    exit(1)

# Update status
print("\n[STEP 3] Updating status Pendente → Aprovado...")
try:
    update_data = {"status": "Aprovado"}
    r = requests.put(f"{BASE_URL}/api/quotes/{quote_id}", json=update_data, headers=headers)
    print(f"   HTTP Status: {r.status_code}")
    print(f"   Response: {r.text[:500]}")
    
    if r.status_code not in [200, 201]:
        print(f"   [FAIL] Update failed")
except Exception as e:
    print(f"   [ERROR] {e}")

# Verify
print("\n[STEP 4] Verifying update...")
try:
    r = requests.get(f"{BASE_URL}/api/quotes/{quote_id}", headers=headers)
    print(f"   HTTP Status: {r.status_code}")
    
    if r.status_code == 200:
        updated = r.json()
        final_status = updated.get('status')
        print(f"   Final status in DB: '{final_status}'")
        
        if final_status == "Aprovado":
            print(f"   [PASS] Status WAS UPDATED!")
            test_passed = True
        else:
            print(f"   [FAIL] Status NOT UPDATED (still '{final_status}')")
            test_passed = False
    else:
        print(f"   [ERROR] Could not verify")
        test_passed = False
except Exception as e:
    print(f"   [ERROR] {e}")
    test_passed = False

# Cleanup
print("\n[STEP 5] Cleanup...")
try:
    r = requests.delete(f"{BASE_URL}/api/quotes/{quote_id}", headers=headers)
    print(f"   Deleted quote: HTTP {r.status_code}")
except:
    print(f"   Could not delete")

# Result
print("\n" + "="*70)
if test_passed:
    print("RESULT: [PASS] ✓ Status update WORKS in backend API")
    print("        If frontend doesn't work, it's a frontend issue")
else:
    print("RESULT: [FAIL] ✗ Backend NOT updating status")
print("="*70)
