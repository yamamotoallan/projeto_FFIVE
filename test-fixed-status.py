import requests
import json

BASE = "https://gest-o-agenda-marcenaria-production.up.railway.app"

print("Testing simplified status update endpoint...")

# Login
r = requests.post(f"{BASE}/api/login", json={"email":"admin@marcenaria.pro","password":"123"})
token = r.json()['token']
print("1. Login OK")

# Create
h = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
r = requests.post(f"{BASE}/api/quotes", json={"client":"Status Test","project":"Test","value":1000,"status":"Pendente"}, headers=h)
qid = r.json()['id']
print(f"2. Created quote ID={qid} with status=Pendente")

# Update status
print(f"\n3. Updating status to Aprovado...")
r = requests.put(f"{BASE}/api/quotes/{qid}/status", json={"status":"Aprovado"}, headers=h)
print(f"   HTTP Status: {r.status_code}")

if r.status_code == 200:
    try:
        data = r.json()
        print(f"   Response: {json.dumps(data, indent=2)}")
        if data.get('success'):
            print(f"   [OK] API responded with success=true")
            
            # Verify
            r2 = requests.get(f"{BASE}/api/quotes/{qid}", headers=h)
            final = r2.json().get('status')
            print(f"\n4. Verification: Final status in DB = '{final}'")
            
            if final == "Aprovado":
                print("\n[PASS] Status update IS WORKING!")
            else:
                print(f"\n[FAIL] Status not persisted (expected Aprovado, got {final})")
        else:
            print(f"   [FAIL] API returned success=false")
    except Exception as e:
        print(f"   [ERROR] JSON parse failed: {e}")
        print(f"   Raw response: {r.text[:300]}")
else:
    print(f"   [FAIL] HTTP {r.status_code}")
    print(f"   Response: {r.text[:300]}")

# Cleanup
requests.delete(f"{BASE}/api/quotes/{qid}", headers=h)
print("\n5. Cleanup done")
