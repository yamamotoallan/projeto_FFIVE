import requests
import json

BASE = "https://gest-o-agenda-marcenaria-production.up.railway.app"

# Login
r = requests.post(f"{BASE}/api/login", json={"email":"admin@marcenaria.pro","password":"123"})
token = r.json()['token']
print("Login OK")

# Create
h = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
r = requests.post(f"{BASE}/api/quotes", json={"client":"Test","project":"Test","value":1000,"status":"Pendente"}, headers=h)
qid = r.json()['id']
print(f"Created: ID={qid}")

# Update status
print("\nTesting PUT /api/quotes/{qid}/status...")
r = requests.put(f"{BASE}/api/quotes/{qid}/status", json={"status":"Aprovado"}, headers=h)
print(f"HTTP Status: {r.status_code}")
print(f"Response: {r.text}")

# Get
r2 = requests.get(f"{BASE}/api/quotes/{qid}", headers=h)
final_status = r2.json().get('status')
print(f"\nFinal status: {final_status}")

# Delete
requests.delete(f"{BASE}/api/quotes/{qid}", headers=h)
print("Deleted")

if final_status == "Aprovado":
    print("\n[PASS] Status update works!")
else:
    print(f"\n[FAIL] Status not updated (still '{final_status}')")
