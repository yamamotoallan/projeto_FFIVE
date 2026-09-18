import requests
import json
import sys

BASE_URL = "https://gest-o-agenda-marcenaria-production.up.railway.app"

def test_health():
    print("\n" + "="*70)
    print("TEST 1: HEALTH CHECK")
    print("="*70)
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Status: {r.status_code}")
        print(f"Response: {json.dumps(r.json(), indent=2)}")
        return r.status_code == 200
    except Exception as e:
        print(f"FAILED: {e}")
        return False

def test_login():
    print("\n" + "="*70)
    print("TEST 2: LOGIN (admin@admin.com / 123)")
    print("="*70)
    try:
        data = {"email": "admin@admin.com", "password": "123"}
        r = requests.post(f"{BASE_URL}/api/login", json=data, timeout=10)
        print(f"Status: {r.status_code}")
        result = r.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if r.status_code == 200 and result.get('token'):
            print(f"\n[PASS] LOGIN OK")
            print(f"Token: {result['token'][:50]}...")
            print(f"User: {result.get('user', {}).get('name', 'Unknown')}")
            return result['token']
        else:
            print(f"\n[FAIL] LOGIN: {result.get('message', 'Unknown error')}")
            return None
    except Exception as e:
        print(f"[FAIL]: {e}")
        return None

def test_create_quote(token):
    print("\n" + "="*70)
    print("TEST 3: CREATE QUOTE")
    print("="*70)
    try:
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        data = {
            "client": "Auto Test Client",
            "project": "Upload Test Project",
            "value": 5000.00,
            "status": "Pendente",
            "phone": "(11) 99999-9999",
            "project_type": "Cozinha",
            "service_type": "Moveis planejados",
            "notes": "Criado por teste automatico"
        }
        r = requests.post(f"{BASE_URL}/api/quotes", json=data, headers=headers, timeout=10)
        print(f"Status: {r.status_code}")
        
        if r.status_code >= 200 and r.status_code < 300:
            result = r.json()
            print(f"[PASS] QUOTE CREATED: ID = {result.get('id')}")
            return result.get('id')
        else:
            print(f"Response: {r.text[:300]}")
            print(f"[FAIL]")
            return None
    except Exception as e:
        print(f"[FAIL]: {e}")
        return None

def test_upload(token, quote_id):
    print("\n" + "="*70)
    print(f"TEST 4: FILE UPLOAD (Quote ID: {quote_id})")
    print("="*70)
    try:
        filename = 'auto-test-file.txt'
        with open(filename, 'w') as f:
            f.write('Arquivo de teste automatico do sistema Marcenaria Pro\n')
            f.write('Data: 2026-01-29\n')
        
        print(f"Created test file: {filename}")
        
        headers = {'Authorization': f'Bearer {token}'}
        files = {'files': (filename, open(filename, 'rb'), 'text/plain')}
        
        r = requests.post(
            f"{BASE_URL}/api/quotes/{quote_id}/files",
            files=files,
            headers=headers,
            timeout=30
        )
        
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text[:500]}")
        
        if r.status_code >= 200 and r.status_code < 300:
            print(f"\n[PASS] UPLOAD OK!")
            return True
        else:
            print(f"\n[FAIL] UPLOAD")
            return False
            
    except Exception as e:
        print(f"[FAIL]: {e}")
        return False
    finally:
        import os
        if os.path.exists(filename):
            os.remove(filename)

print("\n" + "="*70)
print("AUTO-TEST - MARCENARIA PRO BACKEND")
print("="*70)

results = {}
results['health'] = test_health()
token = test_login()
results['login'] = token is not None

if token:
    quote_id = test_create_quote(token)
    results['create_quote'] = quote_id is not None
    if quote_id:
        results['upload'] = test_upload(token, quote_id)
else:
    results['create_quote'] = False
    results['upload'] = False

print("\n" + "="*70)
print("TEST SUMMARY")
print("="*70)
print(f"Health Check:   {'[PASS]' if results['health'] else '[FAIL]'}")
print(f"Login:          {'[PASS]' if results['login'] else '[FAIL]'}")
print(f"Create Quote:   {'[PASS]' if results['create_quote'] else '[FAIL]'}")
print(f"File Upload:    {'[PASS]' if results['upload'] else '[FAIL]'}")
print("="*70)

all_pass = all(results.values())
if all_pass:
    print("\nALL TESTS PASSED! Sistema funcionando 100%")
else:
    print("\nSome tests failed. Check details above.")
