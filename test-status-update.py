import requests
import json

BASE_URL = "https://gest-o-agenda-marcenaria-production.up.railway.app"
EMAIL = "admin@marcenaria.pro"
PASSWORD = "123"

print("="*70)
print("FOCUSED TEST: QUOTE STATUS UPDATE")
print("="*70)

# Login
print("\n1. Login...")
r = requests.post(f"{BASE_URL}/api/login", json={"email": EMAIL, "password": PASSWORD})
token = r.json()['token']
print(f"   Token obtained: {token[:30]}...")

headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# Create quote
print("\n2. Creating test quote...")
quote_data = {
    "client": "Status Test Client",
    "project": "Status Test Project",
    "value": 5000.00,
    "status": "Pendente"
}
r = requests.post(f"{BASE_URL}/api/quotes", json=quote_data, headers=headers)
quote = r.json()
quote_id = quote.get('id')
print(f"   Quote created: ID={quote_id}, Status={quote.get('status')}")

# Get current status
print("\n3. Getting current quote...")
r = requests.get(f"{BASE_URL}/api/quotes/{quote_id}", headers=headers)
current = r.json()
print(f"   Current status: {current.get('status')}")

# Update status
print("\n4. Updating status to 'Aprovado'...")
update_data = {"status": "Aprovado"}
r = requests.put(f"{BASE_URL}/api/quotes/{quote_id}", json=update_data, headers=headers)
print(f"   HTTP Status: {r.status_code}")
print(f"   Response: {r.text[:300]}")

# Verify update
print("\n5. Verifying update...")
r = requests.get(f"{BASE_URL}/api/quotes/{quote_id}", headers=headers)
updated = r.json()
final_status = updated.get('status')
print(f"   Final status: {final_status}")

# Cleanup
print("\n6. Cleaning up (deleting test quote)...")
r = requests.delete(f"{BASE_URL}/api/quotes/{quote_id}", headers=headers)
print(f"   Deleted: HTTP {r.status_code}")

# Result
print("\n" + "="*70)
if final_status == "Aprovado":
   print("RESULT: [PASS] Status update is WORKING")
else:
    print(f"RESULT: [FAIL] Status NOT updated (Expected: Aprovado, Got: {final_status})")
print("="*70)
